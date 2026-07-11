import "./App.css";

function App() {
  return (
    <main className="container">
      <span className="badge">App de prueba</span>
      <h1>Bienvenido</h1>
      <p className="subtitle">
        Esta es una aplicación de prueba de escritorio construida con Tauri.
      </p>
      <div className="platforms">
        <span className="platform-pill">🐧 Ubuntu</span>
        <span className="platform-pill">🪟 Windows 11</span>
      </div>
      <p className="note">
        Esta página es solo para fines de prueba y desarrollo, no representa
        una versión final del producto.
      </p>
    </main>
  );
}

export default App;
