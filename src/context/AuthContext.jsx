import { createContext, useContext, useEffect, useState } from "react";
import { apiMe, apiLogin } from "../lib/api.js";
import { saveSession, clearSession, getUser, getTeam } from "../lib/auth.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);   // ✅ export nombrado

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [team, setTeam] = useState(getTeam());
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;

  async function login({ email, accessCode }) {
    setLoading(true);
    try {
      const data = await apiLogin({ email, accessCode });
      saveSession(data);
      setUser(data.user);
      setTeam(data.team);
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function reloadMe() {
    try {
      const data = await apiMe();
      setUser(data.user);
      setTeam(data.team);
    } catch {
      logout();
    }
  }

  function logout() {
    clearSession();
    setUser(null);
    setTeam(null);
  }

  useEffect(() => { if (user) reloadMe(); }, []);  // valida token al montar

  return (
    <AuthCtx.Provider value={{ user, team, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}
