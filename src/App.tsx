import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className="container">
        <p>Cargando...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container">
        <span className="badge">App de prueba</span>
        <h1>Bienvenido</h1>
        <Auth />
      </main>
    );
  }

  return (
    <main className="container">
      <span className="badge">App de prueba</span>
      <h1>Bienvenido</h1>
      <p className="subtitle">Sesión iniciada como {session.user.email}</p>
      <Profile user={session.user} />
      <button className="signout" onClick={() => supabase.auth.signOut()}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default App;
