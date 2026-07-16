import React from "react";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

// Dynamic import so a configuration error thrown at module load
// (e.g. missing Supabase env vars) shows a message instead of a blank screen.
import("./App")
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  })
  .catch((err: unknown) => {
    root.render(
      <p style={{ padding: "2rem", textAlign: "center" }}>
        {err instanceof Error ? err.message : String(err)}
      </p>,
    );
  });
