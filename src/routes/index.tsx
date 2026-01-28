import type { RouteObject } from "react-router-dom";
import { Login } from "../components/login/Login";
import { Dashboard } from "../components/dashboard/Dashboard";
import { Register } from "../components/login/Register";
import { ResetPassword } from "../components/login/ResetPassword";
import { ForgotPassword } from "../components/login/ForgotPassword";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
];
