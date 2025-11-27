// src/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

export default function AppLayout() {
  return (
    <div className="app-root" style={{minHeight: "100vh", display: "flex", flexDirection: "column"}}>
      <Navbar />
      <main style={{ padding: "1rem", flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ padding: "0.5rem 1rem", textAlign: "center", fontSize: 12, color: "#666" }}>
        Smart Receipt Logger — © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
