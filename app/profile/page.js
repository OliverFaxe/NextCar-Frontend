"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  country: "",
};

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) {
        setStatus({
          type: "warning",
          message: "Du behöver logga in för att se din profil.",
        });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/customers/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          postalCode: data.postalCode ?? "",
          city: data.city ?? "",
          country: data.country ?? "",
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setStatus({
          type: "error",
          message: "Kunde inte ladda din profil just nu.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.token) {
      setStatus({
        type: "warning",
        message: "Ingen token hittades. Logga in igen.",
      });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/customers/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setProfile({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        address: updated.address ?? "",
        postalCode: updated.postalCode ?? "",
        city: updated.city ?? "",
        country: updated.country ?? "",
      });
      updateUser({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
      });
      setStatus({ type: "success", message: "Profilen uppdaterades." });
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Kunde inte spara profilen. Försök igen senare.",
      });
    }
  };

  return (
    <section className="profile-section py-5">
      <div className="container">
        {status.message && (
          <div
            className={`alert ${
              status.type === "error"
                ? "alert-danger"
                : status.type === "success"
                ? "alert-success"
                : "alert-warning"
            }`}
            role="alert"
          >
            {status.message}
          </div>
        )}
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-center mb-4">
                  <i className="bi bi-person-circle profile-icon"></i>
                  <h5 className="mt-2 user-name">
                    {loading
                      ? "Laddar..."
                      : `${profile.firstName} ${profile.lastName}`.trim() ||
                        "Användare"}
                  </h5>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item active">
                    <i className="bi bi-person"></i> Min profil
                  </li>
                  <li className="list-group-item">
                    <Link href="/booking" className="text-decoration-none">
                      <i className="bi bi-calendar-check"></i> Mina bokningar
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4>
                  <i className="bi bi-person"></i> Min profil
                </h4>
                <p className="mb-0">
                  Här kan du uppdatera dina personuppgifter
                </p>
              </div>
              <div className="card-body">
                {loading ? (
                  <p>Laddar profil...</p>
                ) : (
                  <form id="profileForm" onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">
                          Förnamn
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">
                          Efternamn
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                          E-post
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={profile.email}
                          readOnly
                          disabled
                        />
                        <small className="text-muted">
                          E-post kan inte ändras
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12">
                        <label htmlFor="address" className="form-label">
                          Adress
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          name="address"
                          value={profile.address}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="postalCode" className="form-label">
                          Postnummer
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="postalCode"
                          name="postalCode"
                          value={profile.postalCode}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="city" className="form-label">
                          Stad
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          value={profile.city}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="country" className="form-label">
                          Land
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="country"
                          name="country"
                          value={profile.country}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary">
                          <i className="bi bi-check-circle"></i> Spara ändringar
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
