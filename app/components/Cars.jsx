"use client";

import { useEffect, useState } from "react";
import CarCard from "./Car";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function Cars() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchCars = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/cars`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const carsList = await res.json();
        if (mounted) setCars(carsList);
      } catch (err) {
        console.error("Failed to fetch cars:", err);
        if (mounted) setCars([]);
      }
    };
    fetchCars();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="row g-4" id="cars-container">
      {cars.map((car, idx) => (
        <CarCard key={car.id ?? car._id ?? idx} car={car} />
      ))}
    </div>
  );
}
