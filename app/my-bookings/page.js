"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getToken, getFirstName } from "../utils/auth";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const BOOKING_VIEWS = {
  CONFIRMED: "confirmed",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatPrice = (value) => {
  return new Intl.NumberFormat("sv-SE").format(Number(value ?? 0));
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState(BOOKING_VIEWS.CONFIRMED);
  const [bookings, setBookings] = useState({
    confirmed: [],
    active: [],
    completed: [],
    cancelled: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      alert("Du måste logga in för att se dina bokningar.");
      router.push("/login");
      return;
    }

    setUserName(getFirstName() || "Användare");
    fetchBookings();
  }, [router]);

  const determineActualStatus = (booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.rentalStartDate);
    const endDate = new Date(booking.rentalEndDate);

    // Use rentalStatus if available
    if (booking.rentalStatus === "CANCELLED") {
      return "CANCELLED";
    }

    if (booking.rentalStatus === "COMPLETED") {
      return "COMPLETED";
    }

    // If no explicit status, determine from dates
    if (endDate < today) {
      return "COMPLETED";
    } else if (startDate <= today && endDate >= today) {
      return "ACTIVE";
    } else if (startDate > today) {
      return "CONFIRMED";
    }

    return "CONFIRMED";
  };

  const categorizeBookings = (allBookings) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const confirmed = allBookings.filter((booking) => {
      const startDate = new Date(booking.rentalStartDate);
      const status = booking.rentalStatus || determineActualStatus(booking);
      return status !== "CANCELLED" && status !== "COMPLETED" && startDate > today;
    });

    const active = allBookings.filter((booking) => {
      const startDate = new Date(booking.rentalStartDate);
      const endDate = new Date(booking.rentalEndDate);
      const status = booking.rentalStatus || determineActualStatus(booking);
      return status !== "CANCELLED" && status !== "COMPLETED" && startDate <= today && endDate >= today;
    });

    const completed = allBookings.filter((booking) => {
      const endDate = new Date(booking.rentalEndDate);
      const status = booking.rentalStatus || determineActualStatus(booking);
      return status === "COMPLETED" || endDate < today;
    });

    const cancelled = allBookings.filter((booking) => {
      return booking.rentalStatus === "CANCELLED";
    });

    return { confirmed, active, completed, cancelled };
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    const token = getToken();

    if (!token) {
      setError("Ingen token hittades");
      setLoading(false);
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rentals/my-bookings`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Kunde inte hämta bokningar");
      }

      const data = await response.json();
      console.log("Received bookings:", data); // Debug
      const organized = categorizeBookings(data);
      setBookings(organized);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Ett fel inträffade vid hämtning av bokningar");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (rentalId) => {
    if (
      !confirm(
        "Är du säker på att du vill avboka denna bokning? Denna åtgärd kan inte ångras."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Bokningen har avbokats framgångsrikt.");
        await fetchBookings();
      } else {
        const errorText = await response.text();
        alert("Kunde inte avboka bokningen: " + errorText);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Ett tekniskt fel uppstod vid avbokningen. Försök igen om en stund.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          statusText: "AKTIV",
          statusBg: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
        };
      case "CANCELLED":
        return {
          statusText: "AVBOKAD",
          statusBg: "linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)",
        };
      case "COMPLETED":
        return {
          statusText: "AVSLUTAD",
          statusBg: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
        };
      case "CONFIRMED":
        return {
          statusText: "BEKRÄFTAD",
          statusBg: "linear-gradient(135deg, #ffc107 0%, #e6a800 100%)",
        };
      default:
        return {
          statusText: "OKÄND",
          statusBg: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
        };
    }
  };

  const getCancelReasonText = (booking) => {
    const status = booking.rentalStatus || determineActualStatus(booking);
    
    if (status === "CANCELLED") {
      return "Redan avbokad";
    } else if (status === "COMPLETED") {
      return "Bokning genomförd";
    } else if (new Date(booking.rentalEndDate) < new Date()) {
      return "Bokning avslutad";
    } else if (new Date(booking.rentalStartDate) <= new Date()) {
      return "Pågående uthyrning";
    } else {
      return "Kan inte avbokas";
    }
  };

  const renderBookingCard = (booking) => {
    const actualStatus = determineActualStatus(booking);
    const { statusText, statusBg } = getStatusStyle(actualStatus);
    const days = calculateDays(booking.rentalStartDate, booking.rentalEndDate);

    const canActuallyCancel =
      actualStatus === "CONFIRMED" && new Date(booking.rentalStartDate) > new Date();

    return (
      <div
        key={booking.rentalId}
        className="booking-card"
        style={{ position: "relative", marginBottom: "20px" }}
      >
        {/* Status accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: statusBg,
          }}
        ></div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
            marginTop: "16px",
          }}
        >
          <div>
            <h4
              style={{
                margin: "0 0 4px 0",
                color: "#2c3e50",
                fontSize: "1.4rem",
                fontWeight: "700",
              }}
            >
              {booking.carBrand} {booking.carModel}
            </h4>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "0.95rem" }}>
              <i className="bi bi-card-text" style={{ marginRight: "6px" }}></i>
              {booking.carRegNr || "Registreringsnummer ej tillgängligt"}
            </p>
          </div>
          <span
            style={{
              background: statusBg,
              color: "white",
              padding: "8px 16px",
              borderRadius: "25px",
              fontSize: "0.85rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Period */}
            <div
              style={{
                background: "rgba(13, 110, 253, 0.05)",
                borderLeft: "4px solid #0d6efd",
                padding: "12px 16px",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "600",
                }}
              >
                <i
                  className="bi bi-calendar-check"
                  style={{
                    marginRight: "10px",
                    color: "#0d6efd",
                    fontSize: "1.1rem",
                  }}
                ></i>
                <span style={{ color: "#495057" }}>Hyresperiod</span>
              </p>
              <p
                style={{
                  margin: "4px 0 0 24px",
                  color: "#2c3e50",
                  fontWeight: "700",
                }}
              >
                {formatDate(booking.rentalStartDate)} → {formatDate(booking.rentalEndDate)}
              </p>
              <p
                style={{
                  margin: "2px 0 0 24px",
                  color: "#6c757d",
                  fontSize: "0.9rem",
                }}
              >
                {days} {days === 1 ? "dag" : "dagar"}
              </p>
            </div>

            {/* Booking number */}
            <div
              style={{
                background: "rgba(111, 66, 193, 0.05)",
                borderLeft: "4px solid #6f42c1",
                padding: "12px 16px",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "600",
                }}
              >
                <i
                  className="bi bi-hash"
                  style={{
                    marginRight: "10px",
                    color: "#6f42c1",
                    fontSize: "1.1rem",
                  }}
                ></i>
                <span style={{ color: "#495057" }}>Bokningsnummer</span>
              </p>
              <p
                style={{
                  margin: "4px 0 0 24px",
                  color: "#2c3e50",
                  fontWeight: "700",
                }}
              >
                {booking.rentalBookingNumber || "Genereras automatiskt"}
              </p>
            </div>

            {/* Price */}
            <div
              style={{
                background: "rgba(25, 135, 84, 0.05)",
                borderLeft: "4px solid #198754",
                padding: "12px 16px",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "600",
                }}
              >
                <i
                  className="bi bi-currency-dollar"
                  style={{
                    marginRight: "10px",
                    color: "#198754",
                    fontSize: "1.1rem",
                  }}
                ></i>
                <span style={{ color: "#495057" }}>Totalpris</span>
              </p>
              <p
                style={{
                  margin: "4px 0 0 24px",
                  color: "#2c3e50",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}
              >
                {formatPrice(booking.paymentAmount)} kr
              </p>
              <p
                style={{
                  margin: "2px 0 0 24px",
                  color: "#6c757d",
                  fontSize: "0.9rem",
                }}
              >
                {formatPrice(Math.round(booking.paymentAmount / days))} kr/dag
              </p>
            </div>

            {/* Car info */}
            <div
              style={{
                background: "rgba(253, 126, 20, 0.05)",
                borderLeft: "4px solid #fd7e14",
                padding: "12px 16px",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "600",
                }}
              >
                <i
                  className="bi bi-car-front"
                  style={{
                    marginRight: "10px",
                    color: "#fd7e14",
                    fontSize: "1.1rem",
                  }}
                ></i>
                <span style={{ color: "#495057" }}>Fordonsinformation</span>
              </p>
              <p
                style={{
                  margin: "4px 0 0 24px",
                  color: "#2c3e50",
                  fontWeight: "700",
                }}
              >
                {booking.carCategoryName} • {booking.carYear}
              </p>
              <p
                style={{
                  margin: "2px 0 0 24px",
                  color: "#6c757d",
                  fontSize: "0.9rem",
                }}
              >
                {booking.carFuel} • {booking.carTransmission}
              </p>
            </div>
          </div>

          {/* Action section */}
          <div style={{ textAlign: "center", minWidth: "140px" }}>
            {canActuallyCancel ? (
              <>
                <button
                  onClick={() => handleCancelBooking(booking.rentalId)}
                  className="btn btn-danger"
                  style={{
                    whiteSpace: "nowrap",
                    padding: "12px 20px",
                    fontWeight: "600",
                    borderRadius: "25px",
                    border: "none",
                    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                    boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)",
                    transition: "all 0.3s ease",
                    color: "white",
                  }}
                >
                  <i className="bi bi-x-circle"></i> Avboka
                </button>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "#6c757d",
                    fontSize: "0.85rem",
                  }}
                >
                  Kan avbokas fram till startdatum
                </p>
              </>
            ) : (
              <div
                style={{
                  background: "rgba(108, 117, 125, 0.1)",
                  border: "2px dashed #6c757d",
                  borderRadius: "12px",
                  padding: "16px 12px",
                  textAlign: "center",
                }}
              >
                <i
                  className="bi bi-info-circle"
                  style={{
                    color: "#6c757d",
                    fontSize: "1.2rem",
                    display: "block",
                    marginBottom: "8px",
                  }}
                ></i>
                <span
                  style={{
                    color: "#6c757d",
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                  }}
                >
                  {getCancelReasonText(booking)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = (view) => {
    const emptyStates = {
      confirmed: {
        icon: "bi-calendar-plus",
        title: "Inga bekräftade bokningar",
        message: "Du har inga bekräftade bokningar för tillfället.",
      },
      active: {
        icon: "bi-calendar-check",
        title: "Inga aktiva bokningar",
        message: "Du har inga pågående uthyrningar just nu.",
      },
      completed: {
        icon: "bi-calendar-x",
        title: "Inga avslutade bokningar",
        message: "Du har inga tidigare bokningar att visa ännu.",
      },
      cancelled: {
        icon: "bi-x-circle",
        title: "Inga avbokade bokningar",
        message: "Du har inga avbokade bokningar.",
      },
    };

    const state = emptyStates[view];

    return (
      <div className="empty-state">
        <i className={`bi ${state.icon}`}></i>
        <h3>{state.title}</h3>
        <p>{state.message}</p>
        <Link href="/all-cars" className="btn-browse-cars">
          <i className="bi bi-car-front"></i> Boka en bil nu
        </Link>
      </div>
    );
  };

  const switchView = (view) => {
    setActiveView(view);
    const bookingsContainer = document.querySelector(".bookings-container");
    bookingsContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laddar bokningar...</span>
        </div>
        <p className="mt-2">Laddar dina bokningar...</p>
      </div>
    );
  }

  return (
    <div className="container flex-grow-1" style={{ paddingTop: "2rem" }}>
      <div className="customer-header">
        <h1>
          <i className="bi bi-calendar-check"></i> Mina Bokningar
        </h1>
        <p>Hantera dina pågående och tidigare bilbokningar</p>
      </div>

      {error && (
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle"></i>
          <h5>Ett fel uppstod</h5>
          <p>{error}</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise"></i> Ladda om sidan
          </button>
        </div>
      )}

      <div className="nav-toggle-buttons">
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.CONFIRMED ? "active" : ""
          }`}
          onClick={() => switchView(BOOKING_VIEWS.CONFIRMED)}
        >
          <i className="bi bi-check-circle"></i> Bekräftade
          {bookings.confirmed.length > 0 && (
            <span className="badge bg-primary ms-2">
              {bookings.confirmed.length}
            </span>
          )}
        </button>
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.ACTIVE ? "active" : ""
          }`}
          onClick={() => switchView(BOOKING_VIEWS.ACTIVE)}
        >
          <i className="bi bi-play-circle"></i> Aktiva
          {bookings.active.length > 0 && (
            <span className="badge bg-success ms-2">{bookings.active.length}</span>
          )}
        </button>
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.COMPLETED ? "active" : ""
          }`}
          onClick={() => switchView(BOOKING_VIEWS.COMPLETED)}
        >
          <i className="bi bi-check-square"></i> Avslutade
          {bookings.completed.length > 0 && (
            <span className="badge bg-secondary ms-2">
              {bookings.completed.length}
            </span>
          )}
        </button>
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.CANCELLED ? "active" : ""
          }`}
          onClick={() => switchView(BOOKING_VIEWS.CANCELLED)}
        >
          <i className="bi bi-x-circle"></i> Avbokade
          {bookings.cancelled.length > 0 && (
            <span className="badge bg-danger ms-2">
              {bookings.cancelled.length}
            </span>
          )}
        </button>
      </div>

      <div className="bookings-container">
        {activeView === BOOKING_VIEWS.CONFIRMED && (
          <div className="bookings-list active">
            <h3>
              <i className="bi bi-check-circle"></i> Bekräftade Bokningar
            </h3>
            {bookings.confirmed.length > 0
              ? bookings.confirmed.map(renderBookingCard)
              : renderEmptyState("confirmed")}
          </div>
        )}

        {activeView === BOOKING_VIEWS.ACTIVE && (
          <div className="bookings-list active">
            <h3>
              <i className="bi bi-play-circle"></i> Aktiva Bokningar
            </h3>
            {bookings.active.length > 0
              ? bookings.active.map(renderBookingCard)
              : renderEmptyState("active")}
          </div>
        )}

        {activeView === BOOKING_VIEWS.COMPLETED && (
          <div className="bookings-list active">
            <h3>
              <i className="bi bi-check-square"></i> Avslutade Bokningar
            </h3>
            {bookings.completed.length > 0
              ? bookings.completed.map(renderBookingCard)
              : renderEmptyState("completed")}
          </div>
        )}

        {activeView === BOOKING_VIEWS.CANCELLED && (
          <div className="bookings-list active">
            <h3>
              <i className="bi bi-x-circle"></i> Avbokade Bokningar
            </h3>
            {bookings.cancelled.length > 0
              ? bookings.cancelled.map(renderBookingCard)
              : renderEmptyState("cancelled")}
          </div>
        )}
      </div>
    </div>
  );
}