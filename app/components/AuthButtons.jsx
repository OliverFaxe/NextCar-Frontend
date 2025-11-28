"use client";
import { useState, useEffect } from "react";
import { isAuthenticated, getUserRole, logout } from "../utils/auth";

export default function AuthButtons() {
  const [auth, setAuth] = useState({ loggedIn: false, firstName: "", role: "" });

  useEffect(() => {
    if (isAuthenticated()) {
      let firstName = localStorage.getItem("firstName") || sessionStorage.getItem("firstName");
      const role = getUserRole();
      if (role === "ADMIN") firstName = "Admin";
      setAuth({ loggedIn: true, firstName, role });
    } else {
      setAuth({ loggedIn: false, firstName: "", role: "" });
    }
  }, []);

  if (auth.loggedIn) {
    return (
      <>
        <a href={auth.role === "ADMIN" ? "/admin/dashboard" : "/profile"} className="btn-profile">
          <i className="bi bi-person-circle"></i> {auth.firstName || "Profil"}
        </a>
        <button
          className="btn-logout"
          style={{ marginLeft: "10px" }}
          onClick={() => logout()}
        >
          <i className="bi bi-box-arrow-right"></i> Logga ut
        </button>
      </>
    );
  } else {
    return (
      <>
        <a href="/register" className="btn-register">Registrera</a>
        <a href="/login" className="btn-login-red">
          <i className="bi bi-box-arrow-in-right"></i> Logga in
        </a>
      </>
    );
  }
}
