import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, team, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="nav card">
      <Link to="/">Inicio</Link>
      <Link to="/register">Registrar</Link>
      <Link to="/history">Histórico</Link>
      <div style={{ marginLeft: "auto" }} className="badge">
        {user?.email} · {team?.name}
        <button className="btn" style={{ marginLeft: 8 }} onClick={() => { logout(); nav("/login"); }}>
          Salir
        </button>
      </div>
    </div>
  );
}
