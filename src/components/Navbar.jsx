import useOutboxSync from "../hooks/useOutboxSync.js";

// ...
export default function Navbar() {
  const { user, team, logout } = useAuth();
  const { status, counts, busy, runNow } = useOutboxSync();

  const pill =
    status === "offline" ? "Offline" :
    busy ? `Sincronizando… (${counts.events + counts.vehicles})` :
    (counts.events + counts.vehicles) > 0 ? `Pendientes: ${counts.events + counts.vehicles}` :
    "Online";

  return (
    <div className="nav card">
      {/* ...links */}
      <div style={{ marginLeft: "auto", display:"flex", gap:8, alignItems:"center" }}>
        <span className="badge">{user?.email} · {team?.name}</span>
        <button className="btn" onClick={runNow} disabled={busy || status==="offline"}>{pill}</button>
        <button className="btn" onClick={logout}>Salir</button>
      </div>
    </div>
  );
}
