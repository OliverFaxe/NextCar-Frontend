export default function CarCard({ car }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="car-card-grid">
        <div className="car-img-section">
          <img
            src={`/images/${car.imageUrl}`} // path relative to public/
            alt={`${car.brand} ${car.model}`} // dynamic alt text
            className="img-fluid" // Bootstrap responsive
          />
        </div>

        <div className="car-info">
          <div className="car-header">
            <h3>
              {car.brand} {car.model}
            </h3>
          </div>
          <div className="car-meta">
            <span className="badge">{car.category.name}</span>
            <i className="bi bi-calendar3"></i> {car.year}
          </div>
          <div className="car-specs">
            <span className="car-spec-item">
              <i className="bi bi-fuel-pump"></i> {car.fuel}
            </span>
            <span className="car-spec-item">
              <i className="bi bi-gear"></i> {car.transmission}
            </span>
            <span className="car-spec-item">
              <i className="bi bi-people"></i> {car.seats} sits
            </span>
          </div>
          <div className="car-footer">
            <div className="price-info-simple">
              <div className="price-display">
                <span className="price-per-day-large">
                  {car.price} kr / dag
                </span>
              </div>
              <a href="/" className="btn-book-now">
                Välj datum & Boka
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
