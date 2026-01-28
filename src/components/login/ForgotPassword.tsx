import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return "Email is required";
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Invalid email format";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Validate field
    setEmailError(validateEmail(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login/forgot-password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset link sent to your email");
        setEmail("");
        setTimeout(() => navigate("/"), 3000);
      } else {
        setError(data.error || "Request failed");
      }
    } catch (error) {
      console.error("Request failed: ", error);
      setError("Connection error. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Forgot Password</h2>

              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`form-control ${emailError ? "is-invalid" : email ? "is-valid" : ""}`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {emailError && (
                    <div className="invalid-feedback d-block">{emailError}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !!emailError || !email}
                  className="btn btn-primary w-100"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center mt-3">
                Remember your password?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                  className="text-decoration-none"
                >
                  Back to Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
