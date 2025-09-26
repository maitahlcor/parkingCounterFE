import { useEffect, useState } from "react";
import { apiListEvents } from "../lib/api.js";
import useDebounce from "../lib/useDebounce.js";

export default function History() {
  const [plate, setPlate] = useState("");
  const [items, setItems] = useState([]);
  const deb = useDebounce(plate, 300);

  useEffect(() => {
    apiListEvents({ plate: deb || undefined })
      .then(setItems)
      .catch(()=>setItems([]));
  }, [deb]);

  return (
    <div className="card">
      <h2>Histórico</h2>
      <div className="row">
        <input className="input" placeholder="Filtrar por placa (opcional)" value={plate} onChange={e=>setPlate(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        {items.length === 0 && <div className="badge">Sin resultados</div>}
        {items.map(ev => (
          <div key={ev._id} className="row" style={{ borderBottom: "1px solid #1f2937", padding: "8px 0" }}>
            <div style={{ width: 88 }}><b>{ev.direction}</b></div>
            <div style={{ flex: 1 }}>{new Date(ev.at).toLocaleString()}</div>
            <div className="badge">{ev.notes || ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
