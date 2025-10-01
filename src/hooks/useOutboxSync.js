import { useCallback, useEffect, useState } from "react";
import { pendingCounts, syncAll } from "../lib/offline.js";

export default function useOutboxSync() {
  const [status, setStatus] = useState(navigator.onLine ? "online" : "offline");
  const [counts, setCounts] = useState({ events: 0, vehicles: 0 });
  const [busy, setBusy] = useState(false);

  const refreshCounts = useCallback(async () => {
    setCounts(await pendingCounts());
  }, []);

  const runNow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const r = await syncAll();
    setBusy(false);
    setStatus(navigator.onLine ? (r.status === "ok" ? "online" : "error") : "offline");
    await refreshCounts();
    return r;
  }, [busy, refreshCounts]);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  useEffect(() => {
    const onOnline = () => { setStatus("online"); runNow(); };
    const onOffline = () => setStatus("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const t = setInterval(() => { if (navigator.onLine) runNow(); }, 15000); // cada 15s
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); clearInterval(t); };
  }, [runNow]);

  return { status, counts, busy, runNow };
}
