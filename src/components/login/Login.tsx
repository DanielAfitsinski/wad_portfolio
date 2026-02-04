import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { authService } from "../../services/authService";
import type { ApiError } from "../../types";

export function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLocked(false);

    try {
      await authService.login(formData.email, formData.password);
      window.location.href = "/dashboard";
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 429) {
        console.error("Account locked:", error.response.data?.message);
        setIsLocked(true);
        setLockTimeRemaining(error.response.data?.lockedUntil || 5);
        setError(
          error.response.data?.message ||
            "Too many failed attempts. Please try again later.",
        );
      } else {
        console.error("Login failed:", error.response?.data?.error);
        setError(error.response?.data?.error || "Login failed");
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        await authService.googleLogin(codeResponse.access_token);
        window.location.href = "/dashboard";
      } catch (err) {
        const error = err as ApiError;
        console.error("Google login failed: ", error.response?.data?.error);
        setError(error.response?.data?.error || "Google login failed");
      }
    },
    onError: (error) => {
      console.error("Google OAuth failed: ", error);
      setError("Google login failed. Please try again.");
    },
    flow: "implicit",
  });

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>

              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form className="mb-4" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="form-control"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="text-end mb-3">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/forgot-password");
                    }}
                    className="text-decoration-none"
                  >
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLocked}
                  className={`btn w-100 ${isLocked ? "btn-secondary" : "btn-primary"}`}
                >
                  {isLocked ? `Locked (${lockTimeRemaining}m)` : "Sign In"}
                </button>
              </form>

              <div className="text-center my-3">
                <span className="text-muted">OR</span>
              </div>

              <button
                onClick={() => googleLogin()}
                className="btn btn-outline-dark w-100"
              >
                <svg
                  className="me-2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
