import { Link, NavLink } from "react-router-dom";
import { msalInstance } from "../../utils/msalInstance";
import { loginRequest } from "../../authConfig";
import { useEffect, useState } from "react";

const linkStyle: React.CSSProperties = {
  marginRight: 12,
  textDecoration: "none",
  padding: "6px 8px",
  borderRadius: 6,
};

export default function Navbar() {
  const [user, setUser] = useState(null as any);

  useEffect(() => {
    const account = msalInstance.getAllAccounts()[0];
    if (account) setUser(account);
  }, []);

  async function login() {
    try {
      const result = await msalInstance.loginPopup(loginRequest);
      setUser(result.account);
    } catch (err) {
      console.error(err);
    }
  }

  function logout() {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) return;
    msalInstance.logoutPopup({ account });
    setUser(null);
  }

  return (
    <header style={{ display: "flex", alignItems: "center", padding: "0.5rem 1rem", borderBottom: "1px solid #eee", background: "#fff" }}>
      <Link to="/" style={{ marginRight: 16, fontWeight: 700, fontSize: 18 }}>Receipt Logger</Link>

      <nav style={{ display: "flex", gap: 8, flex: 1 }}>
        <NavLink to="/" end style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef" : "transparent" })}>Home</NavLink>
        <NavLink to="/add" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef" : "transparent" })}>Add</NavLink>
        <NavLink to="/receipts" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef" : "transparent" })}>Receipts</NavLink>
        <NavLink to="/settings" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef" : "transparent" })}>Settings</NavLink>
      </nav>

      {!user && (
        <button onClick={login} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#f1f1f1" }}>
          Sign In
        </button>
      )}

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>{user.username}</span>
          <button onClick={logout} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#f1f1f1" }}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
