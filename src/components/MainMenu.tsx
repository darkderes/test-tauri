import { User } from "@supabase/supabase-js";
import { ProfileData } from "../App";

interface MainMenuProps {
  user: User;
  profile: ProfileData;
  onEditProfile: () => void;
}

function MainMenu({ user, profile, onEditProfile }: MainMenuProps) {
  const { displayName, avatarUrl } = profile;

  return (
    <div className="main-menu">
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
      <h2 className="menu-name">{displayName || user.email}</h2>

      <nav className="menu-options">
        <button type="button" onClick={onEditProfile}>
          Editar perfil
        </button>
      </nav>
    </div>
  );
}

export default MainMenu;
