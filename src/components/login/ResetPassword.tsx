// Password reset component for setting new password via reset token

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function ResetPassword() {
  // Get reset token from URL parameters
  const [searchParams] = useSearchParams();

  // State management for form and UI
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [uiState, setUiState] = useState({
    error: "",
    loading: false,
    tokenValid: true,
  });
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setUiState((prev) => ({
        ...prev,
        tokenValid: false,
        error: "Invalid reset link",
      }));
    }
  }, [token]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password reset form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, error: "" }));

    if (!formData.password || !formData.confirmPassword) {
      setUiState((prev) => ({
        ...prev,
        error: "Both password fields are required",
      }));
      return;
    }

    if (formData.password.length < 6) {
      setUiState((prev) => ({
        ...prev,
        error: "Password must be at least 6 characters",
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setUiState((prev) => ({
        ...prev,
        error: "Passwords do not match",
      }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch("/api/login/reset-password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/", {
          state: { message: "Password reset successfully. Please login." },
        });
      } else {
        setUiState((prev) => ({
          ...prev,
          error: data.error || "Password reset failed",
        }));
      }
    } catch (error) {
      console.error("Request failed:", error);
      setUiState((prev) => ({
        ...prev,
        error: "Connection error. Please try again.",
      }));
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Reset Password</h2>

              {uiState.error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {uiState.error}
                </div>
              )}

              {!uiState.tokenValid ? (
                <p className="text-danger">Invalid or expired reset link</p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      New Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Confirm password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uiState.loading}
                    className="btn btn-primary w-100"
                  >
                    {uiState.loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
