"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const FALLBACK_IMAGE = "/images/volvo-xc60-2021.jpg";

const getImagePath = (image) => {
  if (!image) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `/images/${image}`;
};

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.valueOf()) || isNaN(end.valueOf())) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const calculateTotalPrice = (pricePerDay, startDate, endDate) => {
  const days = calculateDays(startDate, endDate);
  if (days === 0) return 0;
  return Math.round(Number(pricePerDay ?? 0) * days);
};

const formatPrice = (value) =>
  new Intl.NumberFormat("sv-SE").format(Number(value ?? 0));

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const carId = searchParams.get("carId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [car, setCar] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [bookingResult, setBookingResult] = useState(null);
  const [loadingCar, setLoadingCar] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Check auth status FIRST - redirect before rendering anything
  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (!user?.token) {
      // Save pending booking to sessionStorage
      const pendingBooking = {
        carId,
        startDate: startDateParam,
        endDate: endDateParam,
      };
      window.sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify(pendingBooking)
      );

      // Redirect immediately - don't show the modal
      const searchQuery = new URLSearchParams();
      if (carId) searchQuery.set("carId", carId);
      if (startDateParam) searchQuery.set("startDate", startDateParam);
      if (endDateParam) searchQuery.set("endDate", endDateParam);
      const redirectTarget = searchQuery.toString()
        ? `/booking-confirmation?${searchQuery.toString()}`
        : "/booking-confirmation";
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    // User is logged in, clear pending booking
    window.sessionStorage.removeItem("pendingBooking");
  }, [loading, user?.token, carId, startDateParam, endDateParam, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <section className="booking-section py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Kontrollerar din inloggning...</p>
        </div>
      </section>
    );
  }

  // If not logged in, this won't render (redirect happens above)
  if (!user?.token) {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedStart = window.sessionStorage.getItem("startDate") ?? "";
    const storedEnd = window.sessionStorage.getItem("endDate") ?? "";
    setStartDate(startDateParam || storedStart || "");
    setEndDate(endDateParam || storedEnd || "");
  }, [startDateParam, endDateParam]);

  useEffect(() => {
    if (!carId) {
      setStatus({ type: "error", message: "Ingen bil angavs." });
      return;
    }
    setLoadingCar(true);
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Kunde inte hämta bilinformation.");
        const data = await response.json();
        setCar(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus({ type: "error", message: error.message });
        }
      } finally {
        setLoadingCar(false);
      }
    })();
    return () => controller.abort();
  }, [carId]);

  useEffect(() => {
    if (!user?.token) return;
    setLoadingCustomer(true);
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/customers/me`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Kunde inte hämta kunduppgifterna.");
        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus({ type: "error", message: error.message });
        }
      } finally {
        setLoadingCustomer(false);
      }
    })();
    return () => controller.abort();
  }, [user?.token]);

  const validationMessage = useMemo(() => {
    if (!startDate || !endDate) return "Både start- och slutdatum måste anges.";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 14);

    if (start < today) return "Startdatum kan tidigast vara idag.";
    if (end <= start) return "Slutdatum måste vara efter startdatum.";
    if (end > maxEnd)
      return "Slutdatum kan som mest vara 14 dagar efter startdatum.";
    return "";
  }, [startDate, endDate]);

  const daysSelected = calculateDays(startDate, endDate);
  const totalPrice = calculateTotalPrice(car?.price, startDate, endDate);

  const handleConfirm = async () => {
    if (!carId || !customer?.email || !user?.token) return;
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          carId: Number(carId),
          customerEmail: customer.email,
          startDate,
          endDate,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Kunde inte skapa bokning.");
      }
      const confirmation = await response.json();
      setBookingResult(confirmation);
      setStatus({ type: "success", message: "Bokningen bekräftades!" });
      window.sessionStorage.removeItem("pendingBooking");
    } catch (error) {
      console.error("Booking error:", error);
      setStatus({
        type: "error",
        message: error.message || "Ett fel uppstod vid bokning.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading =
    loading || loadingCar || loadingCustomer || !startDate || !endDate;

  const disableConfirm =
    submitting ||
    !!validationMessage ||
    !agreeTerms ||
    !car ||
    !customer ||
    Boolean(bookingResult);

  return (
    <section className="booking-section py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {status.message && (
              <div
                className={`alert ${
                  status.type === "error"
                    ? "alert-danger"
                    : status.type === "success"
                    ? "alert-success"
                    : "alert-info"
                }`}
                role="alert"
              >
                {status.message}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">Hämtar bokningsinformation...</p>
              </div>
            ) : validationMessage ? (
              <div className="alert alert-warning" role="alert">
                {validationMessage}
                <div className="mt-3">
                  <Link href="/" className="btn btn-outline-primary">
                    Tillbaka till startsidan
                  </Link>
                </div>
              </div>
            ) : bookingResult ? (
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h3>Bokning bekräftad</h3>
                </div>
                <div className="card-body">
                  <p>
                    Tack {customer?.firstName}! Din bokning är nu bekräftad.
                  </p>
                  <p>
                    <strong>Bokningsnummer:</strong>{" "}
                    {bookingResult.bookingNumber}
                  </p>
                  <p>
                    <strong>Bil:</strong> {bookingResult.carBrand}{" "}
                    {bookingResult.carModel}
                  </p>
                  <p>
                    <strong>Datum:</strong> {bookingResult.startDate} →{" "}
                    {bookingResult.endDate}
                  </p>
                  <p>
                    <strong>Totalt pris:</strong>{" "}
                    {formatPrice(bookingResult.totalPrice)} kr
                  </p>
                  <div className="mt-4 d-flex gap-2">
                    <Link href="/" className="btn btn-primary">
                      Till startsidan
                    </Link>
                    <Link href="/profile" className="btn btn-outline-secondary">
                      Visa mina bokningar
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h3>Bokningssammanfattning</h3>
                </div>
                <div className="card-body">
                  <div className="d-flex gap-3 flex-column flex-md-row">
                    <div className="flex-shrink-0">
                      <img
                        src={getImagePath(car?.imageUrl)}
                        alt={`${car?.brand} ${car?.model}`}
                        className="img-fluid rounded"
                        style={{ maxWidth: 240 }}
                      />
                    </div>
                    <div>
                      <h5>
                        {car?.brand} {car?.model} ({car?.year})
                      </h5>
                      <p className="mb-1">
                        Kategori: {car?.category?.name || "—"}
                      </p>
                      <p className="mb-1">
                        Datum: {startDate} → {endDate} ({daysSelected} dagar)
                      </p>
                      <p className="mb-1">
                        Pris / dag: {formatPrice(car?.price)} kr
                      </p>
                      <p className="fw-semibold">
                        Totalpris: {formatPrice(totalPrice)} kr
                      </p>
                    </div>
                  </div>

                  <hr />

                  <h6>Dina uppgifter</h6>
                  <p className="mb-1">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                  <p className="mb-3">{customer?.email}</p>

                  <div className="form-check mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(event) => setAgreeTerms(event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="agreeTerms">
                      Jag godkänner bokningsvillkoren
                    </label>
                  </div>

                  <div className="mt-4 d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={disableConfirm}
                      onClick={handleConfirm}
                    >
                      {submitting ? "Skickar..." : "Slutför bokning"}
                    </button>
                    <Link href="/" className="btn btn-outline-secondary">
                      Avbryt
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <section className="booking-section py-5">
          <div className="container text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 text-muted">Laddar bokningssidan...</p>
          </div>
        </section>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
