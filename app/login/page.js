import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <section className="auth-section">
        <div className="container">
            <div className="auth-card auth-card-small">
                <div className="auth-header">
                    <i className="bi bi-box-arrow-in-right auth-icon"></i>
                    <h2>Välkommen tillbaka!</h2>
                    <p className="auth-subtitle">Logga in för att fortsätta med din bokning</p>
                </div>

                <LoginForm/>

                <div className="auth-footer">
                    <p>Har du inget konto? <a href="/register" className="link-primary fw-bold">Registrera dig här</a></p>
                </div>
            </div>
        </div>
    </section>
    )
}