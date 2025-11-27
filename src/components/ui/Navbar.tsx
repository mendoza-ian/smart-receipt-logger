// src/components/ui/Navbar.tsx
import { Link, NavLink } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";

const linkStyle: React.CSSProperties = {
  marginRight: 12,
  textDecoration: "none",
  padding: "6px 8px",
  borderRadius: 6,
};

export default function Navbar() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];

  function login() {
    instance.loginRedirect(loginRequest);
  }

  function logout() {
    instance.logoutRedirect();
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0.5rem 1rem",
        borderBottom: "1px solid #eee",
        background: "#fff",
      }}
    >
      <Link
        to="/"
        style={{
          marginRight: 16,
          fontWeight: 700,
          fontSize: 18,
          textDecoration: "none",
        }}
      >
        Receipt Logger
      </Link>

      <nav style={{ display: "flex", gap: 8, flex: 1 }}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            ...linkStyle,
            background: isActive ? "#eef" : "transparent",
          })}
        >
          Home
        </NavLink>

        <NavLink
          to="/add"
          style={({ isActive }) => ({
            ...linkStyle,
            background: isActive ? "#eef" : "transparent",
          })}
        >
          Add
        </NavLink>

        <NavLink
          to="/receipts"
          style={({ isActive }) => ({
            ...linkStyle,
            background: isActive ? "#eef" : "transparent",
          })}
        >
          Receipts
        </NavLink>

        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            ...linkStyle,
            background: isActive ? "#eef" : "transparent",
          })}
        >
          Settings
        </NavLink>
      </nav>

      {!user && (
        <button
          onClick={login}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: "#f1f1f1",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      )}

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>{user.username}</span>
          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#f1f1f1",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
