import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import type { ProfileData } from "./lib/types";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import MainMenu from "./components/MainMenu";
import "./App.css";

type View = "menu" | "profile";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("menu");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    let cancelled = false;

    supabase
      .from("profiles")
      .select("display_name, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setProfileError(error.message);
        }
        setProfile({
          displayName: data?.display_name ?? "",
          phone: data?.phone ?? "",
          avatarUrl: data?.avatar_url ?? null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!loading && !session) {
    return (
      <main className="container">
        <span className="badge">App de prueba</span>
        <h1>Bienvenido</h1>
        <Auth />
      </main>
    );
  }

  if (loading || !session || !profile) {
    return (
      <main className="container">
        <div className="spinner" role="status" aria-label="Cargando" />
      </main>
    );
  }

  return (
    <main className="container">
      <span className="badge">App de prueba</span>

      {profileError && (
        <p className="auth-error" role="alert">
          {profileError}
        </p>
      )}

      {view === "menu" ? (
        <MainMenu
          user={session.user}
          profile={profile}
          onEditProfile={() => setView("profile")}
        />
      ) : (
        <>
          <button className="back-button" onClick={() => setView("menu")}>
            ← Volver al menú
          </button>
          <Profile
            user={session.user}
            profile={profile}
            onProfileChange={setProfile}
          />
        </>
      )}

      <button className="signout" onClick={() => supabase.auth.signOut()}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default App;
