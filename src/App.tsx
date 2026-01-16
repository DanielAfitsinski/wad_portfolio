import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./Components/Login";
import { Dashboard } from "./Components/Dashboard";
import { Register } from "./Components/Register";
import { ResetPassword } from "./Components/ResetPassword";
import { ForgotPassword } from "./Components/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
