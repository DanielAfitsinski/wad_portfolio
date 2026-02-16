// Forgot password component for requesting password reset

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ForgotPassword() {
  // State management for form and UI
  const [email, setEmail] = useState("");
  const [uiState, setUiState] = useState({
    emailError: "",
    error: "",
    success: "",
    loading: false,
  });
  const navigate = useNavigate();

  // Validate email format
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

  // Handle email input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Validate field
    setUiState((prev) => ({ ...prev, emailError: validateEmail(value) }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, error: "", success: "" }));

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setUiState((prev) => ({ ...prev, emailError: emailValidationError }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true }));

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
        setUiState((prev) => ({
          ...prev,
          success: "Password reset link sent to your email",
          loading: false,
        }));
        setEmail("");
        setTimeout(() => navigate("/"), 3000);
      } else {
        setUiState((prev) => ({
          ...prev,
          error: data.error || "Request failed",
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Request failed: ", error);
      setUiState((prev) => ({
        ...prev,
        error: "Connection error. Please try again",
        loading: false,
      }));
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Forgot Password</h2>

              {uiState.error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {uiState.error}
                </div>
              )}

              {uiState.success && (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  {uiState.success}
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
                    className={`form-control ${uiState.emailError ? "is-invalid" : email ? "is-valid" : ""}`}
                    placeholder="Enter your email"
                    disabled={uiState.loading}
                  />
                  {uiState.emailError && (
                    <div className="invalid-feedback d-block">
                      {uiState.emailError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uiState.loading || !!uiState.emailError || !email}
                  className="btn btn-primary w-100"
                >
                  {uiState.loading ? "Sending..." : "Send Reset Link"}
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
