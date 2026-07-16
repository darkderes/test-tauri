import { useRef, useState, FormEvent } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { ProfileData } from "../lib/types";
import CameraCapture from "./CameraCapture";

interface ProfileProps {
  user: User;
  profile: ProfileData;
  onProfileChange: (profile: ProfileData) => void;
}

function Profile({ user, profile, onProfileChange }: ProfileProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSaving(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setError(error.message);
      } else {
        setInfo("Perfil guardado.");
        onProfileChange({ displayName, phone, avatarUrl });
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(file: File) {
    setError(null);
    setInfo(null);

    const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_AVATAR_BYTES) {
      setError("La imagen supera el máximo de 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const freshUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: freshUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setAvatarUrl(freshUrl);
        setInfo("Foto actualizada.");
        onProfileChange({ displayName, phone, avatarUrl: freshUrl });
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Mi perfil</h2>

      <div className="avatar-section">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || "Avatar del usuario"}
            className="avatar"
          />
        ) : (
          <div className="avatar avatar-placeholder">
            {(displayName || user.email || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="camera-buttons">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Subiendo..." : "Subir foto"}
          </button>
          <button
            type="button"
            disabled={uploading || showCamera}
            onClick={() => setShowCamera(true)}
          >
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
            Usar cámara
          </button>
        </div>
        {showCamera && (
          <CameraCapture
            onCapture={(file) => {
              setShowCamera(false);
              handleAvatarChange(file);
            }}
            onClose={() => setShowCamera(false)}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAvatarChange(file);
            e.target.value = "";
          }}
        />
      </div>

      <form className="auth-form" onSubmit={handleSave}>
        <div className="field">
          <label htmlFor="profile-name">Nombre para mostrar</label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-phone">Teléfono</label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            pattern="[+0-9 ()\-]{6,20}"
            title="Solo dígitos, espacios y los símbolos + ( ) -"
          />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="auth-info" role="status">
          {info}
        </p>
      )}
    </div>
  );
}

export default Profile;
