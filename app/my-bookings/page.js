"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getToken } from "../utils/auth";
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
    
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        
        fetchBookings();
    }, [router]);
    
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
          "Authorization": token,
          "Content-Type": "application/json",
        },
      });
        
        if (!response.ok) {
            throw new Error("Kunde inte hämta bokningar");
        }
        
        const data = await response.json();
      
      // Organize bookings by status
      const organized = {
        confirmed: data.filter((b) => b.status === "CONFIRMED"),
        active: data.filter((b) => b.status === "ACTIVE"),
        completed: data.filter((b) => b.status === "COMPLETED"),
        cancelled: data.filter((b) => b.status === "CANCELLED"),
      };

      setBookings(organized);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Ett fel inträffade vid hämtning av bokningar");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Är du säker på att du vill avboka denna bokning?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/rentals/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Authorization": getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte avboka");
      }

      // Refresh bookings
      await fetchBookings();
      alert("Bokningen har avbokats");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(err.message || "Ett fel inträffade vid avbokning");
    }
  };

  const renderBookingCard = (booking) => {
    const days = calculateDays(booking.startDate, booking.endDate);
    const car = booking.car;

    return (
      <div key={booking.id} className="booking-card">
        <div className="booking-card-header">
          <div className="booking-id">
            <i className="bi bi-hash"></i> Boknings-ID: {booking.id}
          </div>
          <span className={`booking-status status-${booking.status.toLowerCase()}`}>
            {booking.status === "CONFIRMED" && "Bekräftad"}
            {booking.status === "ACTIVE" && "Aktiv"}
            {booking.status === "COMPLETED" && "Avslutad"}
            {booking.status === "CANCELLED" && "Avbokad"}
          </span>
        </div>

        <div className="booking-card-body">
          <div className="row">
            <div className="col-md-3">
              <img
                src={`/images/${car.imageUrl}`}
                alt={`${car.brand} ${car.model}`}
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-9">
              <h4>
                {car.brand} {car.model}
              </h4>
              <div className="booking-details">
                <div className="booking-detail-item">
                  <i className="bi bi-calendar-check"></i>
                  <span>
                    <strong>Upphämtning:</strong> {formatDate(booking.startDate)}
                  </span>
                </div>
                <div className="booking-detail-item">
                  <i className="bi bi-calendar-x"></i>
                  <span>
                    <strong>Återlämning:</strong> {formatDate(booking.endDate)}
                  </span>
                </div>
                <div className="booking-detail-item">
                  <i className="bi bi-clock"></i>
                  <span>
                    <strong>Hyrtid:</strong> {days} dagar
                  </span>
                </div>
                <div className="booking-detail-item">
                  <i className="bi bi-cash-stack"></i>
                  <span>
                    <strong>Totalpris:</strong> {formatPrice(booking.totalPrice)} kr
                  </span>
                </div>
              </div>

              <div className="booking-card-actions mt-3">
                <Link
                  href={`/booking-details/${booking.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-eye"></i> Visa detaljer
                </Link>
                {booking.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="btn btn-outline-danger btn-sm ms-2"
                  >
                    <i className="bi bi-x-circle"></i> Avboka
                  </button>
                )}
              </div>
            </div>
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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laddar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-grow-1" style={{ paddingTop: "2rem" }}>
      {/* Customer header */}
      <div className="customer-header">
        <h1>
          <i className="bi bi-calendar-check"></i> Mina Bokningar
        </h1>
        <p>Hantera dina pågående och tidigare bilbokningar</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="nav-toggle-buttons">
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.CONFIRMED ? "active" : ""
          }`}
          onClick={() => setActiveView(BOOKING_VIEWS.CONFIRMED)}
        >
          <i className="bi bi-check-circle"></i> Bekräftade
          {bookings.confirmed.length > 0 && (
            <span className="badge bg-primary ms-2">{bookings.confirmed.length}</span>
          )}
        </button>
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.ACTIVE ? "active" : ""
          }`}
          onClick={() => setActiveView(BOOKING_VIEWS.ACTIVE)}
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
          onClick={() => setActiveView(BOOKING_VIEWS.COMPLETED)}
        >
          <i className="bi bi-check-square"></i> Avslutade
          {bookings.completed.length > 0 && (
            <span className="badge bg-secondary ms-2">{bookings.completed.length}</span>
          )}
        </button>
        <button
          className={`nav-toggle-btn ${
            activeView === BOOKING_VIEWS.CANCELLED ? "active" : ""
          }`}
          onClick={() => setActiveView(BOOKING_VIEWS.CANCELLED)}
        >
          <i className="bi bi-x-circle"></i> Avbokade
          {bookings.cancelled.length > 0 && (
            <span className="badge bg-danger ms-2">{bookings.cancelled.length}</span>
          )}
        </button>
      </div>

      {/* Bookings container */}
      <div className="bookings-container">
        {/* Confirmed bookings */}
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

        {/* Active bookings */}
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

        {/* Completed bookings */}
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

        {/* Cancelled bookings */}
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