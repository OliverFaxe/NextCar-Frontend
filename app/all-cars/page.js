import Link from "next/link";

export default async function Cars() {
  const response = await fetch("http://localhost:8080/cars", {
    cache: "no-store", // så du alltid får senaste datan
  });

  const cars = await response.json();

  return (
    <div>
      <h1>Here are all cars</h1>

      <ul>
        {cars.map((car) => (
          <div className="car-card-grid" key={car.id}>
            <div className="car-img-section">
              <img
                src={`/images/${car.imageUrl}`}
                alt="${car.brand} ${car.model}"
                className="img-fluid"
              />
            </div>
            <div className="car-info">
              <div className="car-header">
                <h3>
                  ${car.brand} ${car.model}
                </h3>
              </div>
              <div className="car-meta">
                <span className="badge">${car.category.name}</span>
                <i className="bi bi-calendar3"></i> ${car.year}
              </div>
              <div className="car-specs">
                <span className="car-spec-item">
                  <i className="bi bi-fuel-pump"></i> ${car.fuel}
                </span>
                <span className="car-spec-item">
                  <i className="bi bi-gear"></i> ${car.transmission}
                </span>
                <span className="car-spec-item">
                  <i className="bi bi-people"></i> ${car.seats} sits
                </span>
              </div>
              <div className="car-footer">
                <div className="price-info-simple">
                  <div className="price-display">
                    <span className="price-per-day-large">
                      ${car.price} kr / dag
                    </span>
                  </div>
                  <Link href="/" className="btn-book-now">
                    Välj datum & Boka
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}
