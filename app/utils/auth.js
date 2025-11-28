
export const isAuthenticated = () => {
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
};

export const getUserRole = () => {
  return localStorage.getItem("role") || sessionStorage.getItem("role") || "USER";
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("firstName");
  sessionStorage.clear();
  window.location.href = "/login"; // redirect after logout
};