"use client";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Example validation
    if (!email || !password) {
      setError("Fyll i alla fält");
      return;
    }

    const loginData = { email: email.trim(), password };

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (res.ok) {
        const data = await res.json();
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("jwtToken", data.token);
        storage.setItem("userId", data.userId);
        storage.setItem("userRole", data.role);
        storage.setItem("firstName", data.firstName);
        storage.setItem("lastName", data.lastName);

        // redirect function placeholder
        window.location.href = "/"; 
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Fel e-post eller lösenord");
      }
    } catch (err) {
      console.error(err);
      setError("Ett tekniskt fel uppstod. Försök igen senare.");
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
            <i className="bi bi-envelope"></i> E-postadress <span className="required">*</span>
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
            <i className="bi bi-lock"></i> Lösenord <span className="required">*</span>
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
            <a href="#" className="link-primary">Glömt lösenord?</a>
          </div>
        </div>

        {/* Submit button */}
        <div className="col-12 mt-4">
          <button type="submit" className="btn-auth-submit">
            <i className="bi bi-box-arrow-in-right"></i> Logga in
          </button>
        </div>
      </div>
    </form>
  );
}
