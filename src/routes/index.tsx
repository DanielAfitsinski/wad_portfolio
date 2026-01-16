import type { RouteObject } from "react-router-dom";
import { Login } from "../components/Login";
import { Dashboard } from "../components/Dashboard";
import { Register } from "../components/Register";
import { ResetPassword } from "../components/ResetPassword";
import { ForgotPassword } from "../components/ForgotPassword";

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
