import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/login/Login";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ResetPassword } from "./components/login/ResetPassword";
import { ForgotPassword } from "./components/login/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
