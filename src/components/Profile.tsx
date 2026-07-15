import { useEffect, useRef, useState, FormEvent } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import CameraCapture from "./CameraCapture";

interface ProfileProps {
  user: User;
}

function Profile({ user }: ProfileProps) {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else if (data) {
          setDisplayName(data.display_name ?? "");
          setPhone(data.phone ?? "");
          setAvatarUrl(data.avatar_url);
        }
        setLoading(false);
      });
  }, [user.id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSaving(true);

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
    }
    setSaving(false);
  }

  async function handleAvatarChange(file: File) {
    setError(null);
    setInfo(null);
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
      }
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="auth-card">
      <h2>Mi perfil</h2>

      <div className="avatar-section">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="avatar" />
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
            📷 Usar cámara
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
        <input
          type="text"
          placeholder="Nombre para mostrar"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
        />
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {info && <p className="auth-info">{info}</p>}
    </div>
  );
}

export default Profile;
