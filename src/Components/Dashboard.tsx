import { useEffect, useState } from "react";

export function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify authentication
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/verify-auth.php", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout.php", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error: ", error);
    }

    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  const isAdmin = user.role === "admin";

  return (
    <div className="container-fluid py-5">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3">Dashboard</h1>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">User Information</h5>
              <p className="card-text">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="card-text">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="card-text">
                <strong>Role:</strong>{" "}
                <span className="badge bg-primary">{user.role}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
