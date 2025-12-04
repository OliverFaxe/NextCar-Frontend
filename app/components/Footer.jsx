"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5>
              <i className="bi bi-car-front-fill"></i> NextCar
            </h5>
            <p style={{ lineHeight: "1.8" }}>
              Din pålitlig partner för biluthyrning. Vi erbjuder ett brett utbud
              av högkvalitativa fordon för alla dina behov.
            </p>
            <div className="social-icons mt-3">
              <Link href="#">
                <i className="bi bi-facebook"></i>
              </Link>
              <Link href="#">
                <i className="bi bi-instagram"></i>
              </Link>
              <Link href="#">
                <i className="bi bi-twitter"></i>
              </Link>
              <Link href="#">
                <i className="bi bi-linkedin"></i>
              </Link>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <h5>Snabblänkar</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Om oss
                </Link>
              </li>
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Våra bilar
                </Link>
              </li>
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Priser
                </Link>
              </li>
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Villkor
                </Link>
              </li>
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-3 mb-4">
            <h5>Kundservice</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Support
                </Link>
              </li>
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Kontakt
                </Link>
              </li>
              <li className="mb-2">
                <Link href="#">
                  <i className="bi bi-chevron-right"></i> Försäkring
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-2 mb-4">
            <h5>Kontakt</h5>
            <p>
              <i
                className="bi bi-telephone-fill"
                style={{ color: "var(--golden-yellow)" }}
              ></i>{" "}
              08-123 456 78
            </p>
            <p>
              <i
                className="bi bi-envelope-fill"
                style={{ color: "var(--golden-yellow)" }}
              ></i>{" "}
              info@nextcar.se
            </p>
            <p>
              <i
                className="bi bi-geo-alt-fill"
                style={{ color: "var(--golden-yellow)" }}
              ></i>{" "}
              Storgatan 123&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stockholm, Sverige
            </p>
            <p>
              <i
                className="bi bi-clock-fill"
                style={{ color: "var(--golden-yellow)" }}
              ></i>{" "}
              Mån-Fre: 08:00-18:00&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lör-Sön:
              10:00-16:00
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2025 NextCar. Alla rättigheter reserverade. |{" "}
            <Link href="#">Integritetspolicy</Link> |{" "}
            <Link href="#">Användarvillkor</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
