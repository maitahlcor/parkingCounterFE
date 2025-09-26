import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import useDebounce from "../lib/useDebounce.js";
import { apiVehicleSearch, apiCreateEvent } from "../lib/api.js";

export default function RegisterEvent() {
  const [plate, setPlate] = useState("");
  const [direction, setDirection] = useState("IN");
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const debounced = useDebounce(plate, 300);
  const listRef = useRef(null);

  useEffect(() => {
    const q = debounced.trim();
    if (!q) { setResults([]); setOpen(false); return; }
    apiVehicleSearch(q).then(setResults).catch(()=>{});
  }, [debounced]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const idempotencyKey = nanoid();
    const clientAt = new Date().toISOString();
    try {
      const r = await apiCreateEvent({ plate, direction, idempotencyKey, clientAt, notes });
      setMsg(r?.duplicate ? "Evento duplicado (ignorado)" : "Evento registrado");
      setPlate("");
      setNotes("");
      setOpen(false);
    } catch {
      setMsg("Error registrando evento");
    }
  }

  return (
    <div className="card">
      <h2>Registrar IN/OUT</h2>
      <form onSubmit={submit}>
        <div style={{ position: "relative" }}>
          <label>Placa</label>
          <input
            className="input"
            value={plate}
            onChange={e=>{ setPlate(e.target.value); setOpen(true); }}
            onBlur={() => setTimeout(()=>setOpen(false), 150)}
            placeholder="ABC123"
            autoComplete="off"
          />
          {open && results?.length > 0 && (
            <div className="autocomplete-list" ref={listRef}>
              {results.map(p => (
                <div key={p} className="autocomplete-item" onMouseDown={()=>{ setPlate(p); setOpen(false); }}>
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <div>
            <label>Dirección</label>
            <select className="input" value={direction} onChange={e=>setDirection(e.target.value)}>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Notas</label>
            <input className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        <button className="btn primary" style={{ marginTop: 12 }}>Guardar</button>
      </form>
      {msg && <div className="badge" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
