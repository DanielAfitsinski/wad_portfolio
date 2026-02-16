// Application entry point with Google OAuth provider integration

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";

// Load Google Client ID from environment variables
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.error("Missing VITE_GOOGLE_CLIENT_ID environment variable");
}

// Render application with OAuth provider wrapper
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId || ""}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
