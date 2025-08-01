import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootDiv = document.createElement("div");
rootDiv.id = "browser-pet-root";
document.body.appendChild(rootDiv);

const root = createRoot(rootDiv);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
