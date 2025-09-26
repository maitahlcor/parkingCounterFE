import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="card">
      <h2>Registro de vehículos</h2>
      <p>Usa <Link to="/register">Registrar</Link> para marcar entrada/salida y <Link to="/history">Histórico</Link> para consultar.</p>
    </div>
  );
}
