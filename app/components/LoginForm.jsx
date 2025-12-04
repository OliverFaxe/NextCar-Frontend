"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Fyll i alla fält");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Fel e-post eller lösenord");
      }

      const data = await res.json();
      login(
        {
          token: data.token,
          role: data.role,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
        },
        rememberMe
      );

      router.replace(data.role === "ADMIN" ? "/admin/dashboard" : "/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Ett tekniskt fel uppstod. Försök igen senare.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3">
        {/* E-post */}
        <div className="col-12">
          <label htmlFor="email" className="form-label">
            <i className="bi bi-envelope"></i> E-postadress{" "}
            <span className="required">*</span>
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="exempel@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Lösenord */}
        <div className="col-12">
          <label htmlFor="password" className="form-label">
            <i className="bi bi-lock"></i> Lösenord{" "}
            <span className="required">*</span>
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Ditt lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Remember me & Forgot password */}
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Kom ihåg mig
              </label>
            </div>
            <a href="#" className="link-primary">
              Glömt lösenord?
            </a>
          </div>
        </div>

        {/* Submit button */}
        <div className="col-12 mt-4">
          <button
            type="submit"
            className="btn-auth-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Loggar in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Logga in
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
