import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import useDebounce from "../lib/useDebounce.js";
import { apiVehicleSearch, apiCreateEvent, apiCreateVehicle } from "../lib/api.js";
import { enqueueEvent, enqueueVehicle } from "../lib/offline.js";

export default function RegisterEvent() {
  const [plate, setPlate] = useState("");
  const [direction, setDirection] = useState("IN");
  const [notes, setNotes] = useState("");

  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  // tipo de vehículo (para creación cuando no existe)
  const [vehicleType, setVehicleType] = useState("AUTO");
  const [showCreate, setShowCreate] = useState(false);

  const debounced = useDebounce(plate, 300);
  const listRef = useRef(null);

  // Autocomplete
  useEffect(() => {
    const q = debounced.trim();
    if (!q) { setResults([]); setOpen(false); setShowCreate(false); return; }
    apiVehicleSearch(q)
      .then(arr => {
        setResults(arr);
        setOpen(arr.length > 0);
        // si no hay sugerencias y hay texto → mostrar bloque de “se creará”
        setShowCreate(arr.length === 0 && q.length >= 2);
      })
      .catch(() => { setResults([]); setOpen(false); setShowCreate(false); });
  }, [debounced]);

  async function submit(e) {
    e.preventDefault();
    if (!plate.trim()) { setMsg("Ingresa una placa"); return; }
    setMsg("");

    // 1) si no existe, crea vehículo antes de registrar evento
    if (showCreate) {
      try {
        await apiCreateVehicle({ plate, meta: { type: vehicleType } });
      } catch {
        await enqueueVehicle({ plate, type: vehicleType });
      }
    }

    // 2) registra evento (online u offline)
    const idempotencyKey = nanoid();
    const clientAt = new Date().toISOString();
    try {
      const r = await apiCreateEvent({ plate, direction, idempotencyKey, clientAt, notes });
      setMsg(r?.duplicate ? "Evento duplicado (ignorado)" : "Evento registrado");
      setOpen(false);
      // conservamos la placa para permitir OUT inmediato del mismo vehículo
      setNotes("");
    } catch {
      await enqueueEvent({ plate, direction, idempotencyKey, clientAt, notes });
      setMsg(showCreate
        ? "Vehículo y evento guardados localmente (pendiente de sincronizar)"
        : "Evento guardado localmente (pendiente de sincronizar)");
    }
  }

  return (
    <div className="card">
      <h2>Registrar IN/OUT</h2>
      <form onSubmit={submit}>
        {/* PLACA + AUTOCOMPLETE */}
        <div style={{ position: "relative" }}>
          <label>Placa</label>
          <input
            className="input"
            value={plate}
            onChange={e=>{ setPlate(e.target.value.toUpperCase()); setOpen(true); }}
            onBlur={() => setTimeout(()=>setOpen(false), 150)}
            placeholder="ABC123"
            autoComplete="off"
          />
          {open && results?.length > 0 && (
            <div className="autocomplete-list" ref={listRef}>
              {results.map(p => (
                <div
                  key={p}
                  className="autocomplete-item"
                  onMouseDown={()=>{ setPlate(p); setOpen(false); setShowCreate(false); }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUANDO NO EXISTE: avisar que se creará y elegir TIPO con radios */}
        {showCreate && (
          <div className="card" style={{ marginTop: 10, padding: 12, background: "#0b1220" }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              No se encontró <span style={{ opacity: .9 }}>{plate}</span>. Se creará al guardar.
            </div>

            <label>Tipo de vehículo</label>
            <div className="radio-group">
              <label className="radio">
                <input
                  type="radio"
                  name="vehType"
                  value="AUTO"
                  checked={vehicleType === "AUTO"}
                  onChange={()=>setVehicleType("AUTO")}
                />
                Auto
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="vehType"
                  value="MOTO"
                  checked={vehicleType === "MOTO"}
                  onChange={()=>setVehicleType("MOTO")}
                />
                Moto
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="vehType"
                  value="AUTOBUS"
                  checked={vehicleType === "AUTOBUS"}
                  onChange={()=>setVehicleType("AUTOBUS")}
                />
                Autobús
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="vehType"
                  value="CAMION_FURGON"
                  checked={vehicleType === "CAMION_FURGON"}
                  onChange={()=>setVehicleType("CAMION_FURGON")}
                />
                Camión/Furgón
              </label>
            </div>
          </div>
        )}

        {/* CAMPOS EVENTO */}
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
