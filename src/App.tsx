import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
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
      <div className="platforms">
        <span className="platform-pill">🐧 Ubuntu</span>
        <span className="platform-pill">🪟 Windows 11</span>
      </div>
      <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      <p className="note">
        Esta página es solo para fines de prueba y desarrollo, no representa
        una versión final del producto.
      </p>
    </main>
  );
}

export default App;
