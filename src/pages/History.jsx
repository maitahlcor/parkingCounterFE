import { useEffect, useState } from "react";
import { apiListEvents, apiVehicleSearch } from "../lib/api.js";
import useDebounce from "../lib/useDebounce.js";

export default function History() {
  const [plate, setPlate] = useState("");
  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const deb = useDebounce(plate, 300);

  // sugerencias
  useEffect(() => {
    const q = deb.trim();
    if (!q) { setSuggestions([]); setOpen(false); return; }
    apiVehicleSearch(q).then((arr) => {
      setSuggestions(arr);
      setOpen(arr.length > 0);
    }).catch(() => { setSuggestions([]); setOpen(false); });
  }, [deb]);

  // listar eventos
  useEffect(() => {
    apiListEvents({ plate: deb || undefined })
      .then(setItems)
      .catch(() => setItems([]));
  }, [deb]);

  return (
    <div className="card">
      <h2>Histórico</h2>

      <div style={{ position: "relative" }}>
        <input
          className="input"
          placeholder="Filtrar por placa (opcional)"
          value={plate}
          onChange={(e) => { setPlate(e.target.value); setOpen(true); }}
          onBlur={() => setTimeout(()=>setOpen(false), 150)}
          autoComplete="off"
          style={{ marginBottom: 12 }}
        />
        {open && suggestions.length > 0 && (
          <div className="autocomplete-list">
            {suggestions.map(p => (
              <div
                key={p}
                className="autocomplete-item"
                onMouseDown={() => { setPlate(p); setOpen(false); }}
              >
                {p}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="row" style={{ fontWeight: 600, borderBottom: "1px solid #1f2937", padding: "8px 0" }}>
        <div style={{ width: 120 }}>Placa</div>
        <div style={{ width: 80 }}>Dir</div>
        <div style={{ flex: 1 }}>Fecha</div>
        <div style={{ width: 180 }}>Notas</div>
      </div>

      {items.length === 0 && <div className="badge" style={{ marginTop: 10 }}>Sin resultados</div>}
      {items.map(ev => (
        <div key={ev._id} className="row" style={{ borderBottom: "1px solid #1f2937", padding: "8px 0" }}>
          <div style={{ width: 120 }}><b>{ev.plate}</b></div>
          <div style={{ width: 80 }}>{ev.direction}</div>
          <div style={{ flex: 1 }}>{new Date(ev.at).toLocaleString()}</div>
          <div style={{ width: 180 }} className="badge">{ev.notes || ""}</div>
        </div>
      ))}
    </div>
  );
}
