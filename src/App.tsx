// Main application component with routing configuration

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/login/Login";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ResetPassword } from "./components/login/ResetPassword";
import { ForgotPassword } from "./components/login/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
