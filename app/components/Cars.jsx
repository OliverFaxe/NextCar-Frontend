"use client";

import CarCard from "./Car";
import { useState, useEffect } from "react";

export default function Cars() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchCars = async () => {
      try {
        const res = await fetch("http://localhost:8080/cars");
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
