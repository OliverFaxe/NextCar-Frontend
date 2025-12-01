
export const isAuthenticated = () => {
  return !!(localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken"));
};

export const getUserRole = () => {
  return localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "USER";
};

export const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("firstName");
  sessionStorage.clear();
  window.location.href = "/login"; // redirect after logout
};