import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";   // ✅ IMPORTA useAuth
import useOutboxSync from "../hooks/useOutboxSync.js";  // (si usas el indicador offline)

export default function Navbar() {
  const { user, team, logout } = useAuth();             // ✅ ya existe
  const nav = useNavigate();
  const { status, counts, busy, runNow } = useOutboxSync?.() ?? {
    status: "online",
    counts: { events: 0, vehicles: 0 },
    busy: false,
    runNow: () => {},
  };

  const pill =
    status === "offline" ? "Offline" :
    busy ? `Sincronizando… (${counts.events + counts.vehicles})` :
    (counts.events + counts.vehicles) > 0 ? `Pendientes: ${counts.events + counts.vehicles}` :
    "Online";

  return (
    <div className="nav card">
      <Link to="/">Inicio</Link>
      <Link to="/register">Registrar</Link>
      <Link to="/history">Histórico</Link>

      <div style={{ marginLeft: "auto", display:"flex", gap:8, alignItems:"center" }}>
        <span className="badge">{user?.email} · {team?.name || "Default"}</span>
        <button className="btn" onClick={runNow} disabled={busy || status === "offline"}>
          {pill}
        </button>
        <button className="btn" onClick={() => { logout(); nav("/login"); }}>
          Salir
        </button>
      </div>
    </div>
  );
}
