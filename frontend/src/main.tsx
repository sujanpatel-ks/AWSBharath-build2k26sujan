import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { configureAmplify } from "@/api/amplify-config";
import App from "./App";
import "./index.css";

// Configure Amplify before rendering
configureAmplify();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#1f2937",
          color: "#f9fafb",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#f9fafb" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#f9fafb" } },
      }}
    />
  </React.StrictMode>
);
