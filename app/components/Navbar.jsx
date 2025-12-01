"use client";

import { useEffect } from "react";
import Link from "next/link";
import AuthButtons from "./AuthButtons";

export default function Navbar() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
          <Link className="navbar-brand" href="/">
            <i className="bi bi-car-front-fill"></i> NextCar
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            style={{ borderColor: "var(--golden-yellow)" }}
          >
            <span
              className="navbar-toggler-icon"
              style={{ filter: "brightness(0) invert(1)" }}
            ></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link active" href="/">
                  Hem
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="/all-cars">
                  Våra Bilar
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="/about">
                  Om Oss
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="/contact">
                  Kontakt
                </Link>
              </li>

              <li className="nav-item ms-3" id="authButtons"></li>
            </ul>
            <AuthButtons />
          </div>
        </div>
      </nav>
    </>
  );
}
