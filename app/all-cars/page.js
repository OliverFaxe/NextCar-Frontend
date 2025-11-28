import CarCard from "../components/Car";

export default async function CarsPage() {
  const response = await fetch("http://localhost:8080/cars", {
    cache: "no-store",
  });

  const cars = await response.json();

  return (
    <>
    <section className="page-header">
        <div className="container">
            <h1>Våra Bilar</h1>
            <p className="subtitle">Utforska vårt fullständiga utbud av välskötta fordon</p>
        </div>
    </section>
    <section className="cars-section">
    <div className="container">
      <div className="row g-4">
        {cars.map((car) => (
          <CarCard key={car.id ?? car._id} car={car} />
        ))}
      </div>
    </div>
  </section>
    </>
  );
}
