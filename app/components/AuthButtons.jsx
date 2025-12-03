"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function AuthButtons() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <span className="text-white-50 small" aria-live="polite">
        Kontrollerar...
      </span>
    );
  }

  if (!user) {
    return (
      <>
        <Link href="/register" className="btn-register text-decoration-none">
          Registrera
        </Link>
        <Link href="/login" className="btn-login-red text-decoration-none">
          <i className="bi bi-box-arrow-in-right"></i> Logga in
        </Link>
      </>
    );
  }

  const profileHref = user.role === "ADMIN" ? "/admin/dashboard" : "/profile";
  const displayName = user.firstName || (user.role === "ADMIN" ? "Admin" : "Profil");

  return (
    <>
      <Link href={profileHref} className="btn-register text-decoration-none">
        <i className="bi bi-person-circle"></i> {displayName}
      </Link>
      <button
        className="btn-login-red"
        type="button"
        onClick={logout}
      >
        <i className="bi bi-box-arrow-right"></i> Logga ut
      </button>
    </>
  );
}
