import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      })
      .catch((err: Error) => {
        setError(
          err.name === "NotAllowedError"
            ? "Permiso de cámara denegado."
            : err.name === "NotFoundError"
              ? "No se encontró ninguna cámara."
              : `Error de cámara: ${err.message}`
        );
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        }
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="camera-capture">
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
      )}
      <div className="camera-buttons">
        {!error && (
          <button type="button" disabled={!ready} onClick={handleCapture}>
            <svg
              className="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Tomar foto
          </button>
        )}
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default CameraCapture;
