import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";



// Auth Context
import { AuthProvider } from "./context/AuthContext";

// React Query (optional but you are using it in App.tsx)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
