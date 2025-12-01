"use client";

import Link from "next/link";
import Cars from "./components/Cars";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const FALLBACK_IMAGE = "/images/volvo-xc60-2021.jpg";

const todayISO = new Date().toISOString().split("T")[0];

const addDays = (dateString, days) => {
  const base = dateString ? new Date(dateString) : new Date();
  const target = new Date(base);
  target.setDate(target.getDate() + days);
  return target.toISOString().split("T")[0];
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

const sortCars = (cars, order) => {
  const copy = [...cars];
  return copy.sort((a, b) =>
    order === "price-desc"
      ? Number(b.price ?? 0) - Number(a.price ?? 0)
      : Number(a.price ?? 0) - Number(b.price ?? 0)
  );
};

const getImagePath = (image) => {
  if (!image) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `/images/${image}`;
};

export default function Home() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysCount, setDaysCount] = useState(0);
  const [availableCars, setAvailableCars] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [sortOrder, setSortOrder] = useState("price-asc");

  const minEndDate = startDate || todayISO;
  const maxEndDate = addDays(startDate || todayISO, 14);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedStart = window.sessionStorage.getItem("startDate") ?? "";
    const storedEnd = window.sessionStorage.getItem("endDate") ?? "";
    const storedCars = window.sessionStorage.getItem("availableCars");
    setStartDate(storedStart);
    setEndDate(storedEnd);
    if (storedCars) {
      try {
        const parsedCars = JSON.parse(storedCars);
        if (Array.isArray(parsedCars) && parsedCars.length > 0) {
          setAvailableCars(sortCars(parsedCars, sortOrder));
          setHasSearched(true);
        }
      } catch (error) {
        console.warn("Kunde inte läsa sparade bilar:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (startDate) {
      window.sessionStorage.setItem("startDate", startDate);
    } else {
      window.sessionStorage.removeItem("startDate");
    }
  }, [startDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (endDate) {
      window.sessionStorage.setItem("endDate", endDate);
    } else {
      window.sessionStorage.removeItem("endDate");
    }
  }, [endDate]);

  useEffect(() => {
    if (!hasSearched || typeof window === "undefined") return;
    window.sessionStorage.setItem(
      "availableCars",
      JSON.stringify(availableCars)
    );
  }, [availableCars, hasSearched]);

  useEffect(() => {
    if (startDate && endDate) {
      setDaysCount(calculateDays(startDate, endDate));
    } else {
      setDaysCount(0);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!hasSearched) return;
    setAvailableCars((prev) => sortCars(prev, sortOrder));
  }, [sortOrder, hasSearched]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const adjustedMax = addDays(startDate, 14);
    if (endDate > adjustedMax) {
      setEndDate(adjustedMax);
    }
  }, [startDate]);

  const validateDates = () => {
    if (!startDate || !endDate) {
      return "Både start- och slutdatum måste anges.";
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 14);

    if (start < today) {
      return "Startdatum kan tidigast vara idag.";
    }
    if (end <= start) {
      return "Slutdatum måste vara efter startdatum.";
    }
    if (end > maxEnd) {
      return "Slutdatum kan som mest vara 14 dagar efter startdatum.";
    }
    return "";
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const validationMessage = validateDates();
    if (validationMessage) {
      setSearchError(validationMessage);
      return;
    }
    setSearchError("");
    setSearching(true);
    try {
      const sortParam = sortOrder === "price-desc" ? "desc" : "asc";
      const response = await fetch(
        `${API_BASE_URL}/cars/available?startDate=${startDate}&endDate=${endDate}&sort=${sortParam}`
      );
      if (!response.ok) {
        throw new Error("Kunde inte hämta tillgängliga bilar.");
      }
      const cars = await response.json();
      const sorted = sortCars(cars, sortOrder);
      setAvailableCars(sorted);
      setHasSearched(true);
      setDaysCount(calculateDays(startDate, endDate));
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(
        error.message || "Ett fel inträffade vid sökning. Försök igen."
      );
    } finally {
      setSearching(false);
    }
  };

  const resultsCountLabel = useMemo(() => {
    if (!hasSearched) return "";
    if (availableCars.length === 0) {
      return "Inga bilar tillgängliga";
    }
    return `Visar ${availableCars.length} bilar för ${daysCount} dagar`;
  }, [hasSearched, availableCars.length, daysCount]);

  return (
    <div>
      <section className="hero-search-section">
        <div className="container">
          <div className="text-center mb-4">
            <h1>Hyr din nästa bil här!</h1>
            <p className="hero-subtitle">
              Från ekonomiska stadbilar till lyxiga SUV:ar - vi har det perfekta
              alternativet för din resa.
            </p>
          </div>
          <div className="search-card">
            <h3>
              <i className="bi bi-calendar-range"></i> Boka din bil
            </h3>
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="startDate" className="form-label">
                    <i className="bi bi-calendar-check"></i> Från datum
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    min={todayISO}
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="endDate" className="form-label">
                    <i className="bi bi-calendar-x"></i> Till datum
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    min={minEndDate}
                    max={maxEndDate}
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-search-red">
                <i className="bi bi-search"></i> Sök Tillgängliga Bilar
              </button>
              {searchError && (
                <div className="alert alert-danger mt-3" role="alert">
                  {searchError}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="cars-section">
        <div className="container">
          <div className="section-header">
            <h2 id="sectionTitle">
              {hasSearched ? "Tillgängliga bilar" : "Våra Bilar"}
            </h2>
            <div className="underline"></div>
            <p id="sectionSubtitle">
              {hasSearched
                ? "Resultat baserat på dina valda datum"
                : "Utforska vårt breda utbud av välskötta fordon"}
            </p>
          </div>

          {!hasSearched && <Cars />}

          {hasSearched && (
            <>
              <div
                className={`filter-bar ${availableCars.length ? "active" : ""}`}
              >
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <i
                      className="bi bi-funnel-fill"
                      style={{
                        color: "var(--golden-yellow)",
                        fontSize: "1.2rem",
                      }}
                    ></i>
                    <span className="filter-label ms-2">Sortera:</span>
                    <select
                      className="form-select d-inline-block w-auto ms-3"
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value)}
                    >
                      <option value="price-asc">Lägsta pris först</option>
                      <option value="price-desc">Högsta pris först</option>
                    </select>
                  </div>
                  <div className="col-md-6 text-end">
                    <span className="results-count">
                      {resultsCountLabel || "Välj datum för att se resultat"}
                    </span>
                  </div>
                </div>
              </div>

              {searching && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              )}

              <div
                className={`grid-view ${availableCars.length ? "active" : ""}`}
              >
                <div className="row g-4">
                  {availableCars.map((car) => {
                    const totalPrice = calculateTotalPrice(
                      car.price,
                      startDate,
                      endDate
                    );
                    return (
                      <div
                        className="col-md-6 col-lg-4"
                        key={car.id ?? car._id ?? `${car.brand}-${car.model}`}
                      >
                        <div className="car-card-grid">
                          <div className="car-img-section">
                            <img
                              src={getImagePath(car.imageUrl)}
                              alt={`${car.brand} ${car.model}`}
                              className="img-fluid"
                            />
                          </div>
                          <div className="car-info">
                            <div className="car-header">
                              <h3>
                                {car.brand} {car.model}
                              </h3>
                            </div>
                            <div className="car-meta">
                              <span className="badge">
                                {car.category?.name}
                              </span>
                              <i className="bi bi-calendar3"></i> {car.year}
                            </div>
                            <div className="car-specs">
                              <span className="car-spec-item">
                                <i className="bi bi-fuel-pump"></i> {car.fuel}
                              </span>
                              <span className="car-spec-item">
                                <i className="bi bi-gear"></i>{" "}
                                {car.transmission}
                              </span>
                              <span className="car-spec-item">
                                <i className="bi bi-people"></i> {car.seats}{" "}
                                sits
                              </span>
                            </div>
                            <div className="car-footer">
                              <div className="price-info">
                                <div className="price-left">
                                  <span className="small-text">
                                    Totalt {daysCount} dagar
                                  </span>
                                  <span className="price-large">
                                    {formatPrice(totalPrice)} kr
                                  </span>
                                  <span className="price-sub">
                                    ({formatPrice(car.price)} kr / dag)
                                  </span>
                                </div>
                                <div className="price-right">
                                  <Link
                                    className="btn-book-now"
                                    href={`/booking-confirmation?carId=${car.id}&startDate=${startDate}&endDate=${endDate}`}
                                  >
                                    Boka nu
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!searching && availableCars.length === 0 && (
                <div className="no-results-message active">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <h3>Inga bilar tillgängliga</h3>
                  <p>
                    Tyvärr hittade vi inga bilar mellan {startDate} och{" "}
                    {endDate}. Justera dina datum och försök igen.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
