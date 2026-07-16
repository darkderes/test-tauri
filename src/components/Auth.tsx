import { useState, FormEvent } from "react";
import { supabase } from "../lib/supabase";

type Mode = "login" | "signup";

function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setError(error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else if (data.user && !data.session) {
          setInfo("Revisa tu correo para confirmar la cuenta.");
        }
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);

    if (!email) {
      setError("Escribe tu correo primero.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setInfo("Revisa tu correo para restablecer la contraseña.");
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="auth-email">Correo electrónico</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="auth-password">Contraseña</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading
            ? "Cargando..."
            : mode === "login"
              ? "Entrar"
              : "Registrarse"}
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

      {mode === "login" && (
        <button
          type="button"
          className="auth-switch"
          disabled={loading}
          onClick={handleForgotPassword}
        >
          ¿Olvidaste tu contraseña?
        </button>
      )}

      <button
        type="button"
        className="auth-switch"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setInfo(null);
        }}
      >
        {mode === "login"
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}

export default Auth;
