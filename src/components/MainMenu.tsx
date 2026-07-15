import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface MainMenuProps {
  user: User;
  onEditProfile: () => void;
}

function MainMenu({ user, onEditProfile }: MainMenuProps) {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else if (data) {
          setDisplayName(data.display_name ?? "");
          setAvatarUrl(data.avatar_url);
        }
        setLoading(false);
      });
  }, [user.id]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="main-menu">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="avatar" />
      ) : (
        <div className="avatar avatar-placeholder">
          {(displayName || user.email || "?").charAt(0).toUpperCase()}
        </div>
      )}
      <h2 className="menu-name">{displayName || user.email}</h2>

      <nav className="menu-options">
        <button type="button" onClick={onEditProfile}>
          Editar perfil
        </button>
      </nav>

      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}

export default MainMenu;
