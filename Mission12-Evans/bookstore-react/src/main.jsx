import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
// JS bundle: powers pieces like Offcanvas (slide-in cart) and dismissing panels / toasts — not just the stylesheet.
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App.jsx";

// Mount the whole React app into the empty <div id="root"> in index.html.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

