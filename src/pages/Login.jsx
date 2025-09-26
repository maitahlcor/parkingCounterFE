import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login({ email, accessCode });
      nav("/");
    } catch {
      setErr("Credenciales inválidas");
    }
  }

  return (
    <div className="center-page">
      <div className="card auth">
        <h2>Ingreso</h2>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>

          <div className="field">
            <label>Clave global</label>
            <input
              className="input"
              type="password"
              value={accessCode}
              onChange={e=>setAccessCode(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {err && <div style={{ color: "#f87171", marginTop: 8 }}>{err}</div>}

          <button className="btn primary" style={{ marginTop: 14 }} disabled={loading}>
            {loading ? "Validando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
