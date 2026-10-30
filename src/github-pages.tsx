import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Eco Fuel could not find its application root.");
}

const app = createRoot(root);
app.render(<p className="p-6 text-foreground">Loading Eco Fuel…</p>);

void Promise.all([import("@tanstack/react-router"), import("./router")])
  .then(([{ RouterProvider }, { getRouter }]) => {
    app.render(
      <StrictMode>
        <RouterProvider router={getRouter()} />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error("Eco Fuel failed to start", error);
    app.render(
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
        <div>
          <h1 className="font-display text-3xl">Eco Fuel</h1>
          <p className="mt-3 text-muted-foreground">
            This page could not load. Please refresh and try again.
          </p>
        </div>
      </main>,
    );
  });
