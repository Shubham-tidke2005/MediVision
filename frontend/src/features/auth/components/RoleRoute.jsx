import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";


export default function RoleRoute({
  allowedRoles,
}) {
  const { user } =
    useAuth();


  if (
    !user ||
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }


  return <Outlet />;
}