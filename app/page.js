"use client";
import Link from "next/link";
import CarCard from "./components/Car";
import Cars from "./components/Cars";
import { use } from "react";

export default function Home() {
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
            <form id="searchForm">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="startDate" className="form-label">
                    <i className="bi bi-calendar-check"></i> Från datum
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
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
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-search-red">
                <i className="bi bi-search"></i> Sök Tillgängliga Bilar
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="cars-section">
        <div className="container">
          <div className="section-header">
            <h2 id="sectionTitle">Våra Bilar</h2>
            <div className="underline"></div>
            <p id="sectionSubtitle">
              Utforska vårt breda utbud av välskötta fordon
            </p>
          </div>
            <Cars />

          <div className="filter-bar" id="filterBar">
            <div className="row align-items-center">
              <div className="col-md-6">
                <i
                  className="bi bi-funnel-fill"
                  style={{ color: "var(--golden-yellow)", fontSize: "1.2rem" }}
                ></i>
                <span className="filter-label ms-2">Sortera:</span>
                <select
                  className="form-select d-inline-block w-auto ms-3"
                  id="sortSelect"
                >
                  <option value="price-asc">Lägsta pris först</option>
                  <option value="price-desc">Högsta pris först</option>
                </select>
              </div>
              <div className="col-md-6 text-end">
                <span className="results-count" id="resultsCount">
                  Visar <strong>6 bilar</strong> för{" "}
                  <strong id="daysCount">5 dagar</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="grid-view" id="gridView">
            <div className="row g-4" id="gridContainer"></div>
          </div>

          <div className="no-results-message" id="noResults">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <h3>Inga bilar tillgängliga</h3>
            <p>
              Tyvärr hittade vi inga tillgängliga bilar för dina valda datum.
              Försök med andra datum.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
