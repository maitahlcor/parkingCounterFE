export function saveSession({ accessToken, user, team }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("team", JSON.stringify(team));
}
export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("team");
}
export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
export function getTeam() {
  const t = localStorage.getItem("team");
  return t ? JSON.parse(t) : null;
}
