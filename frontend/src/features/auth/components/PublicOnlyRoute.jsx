import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";


export default function PublicOnlyRoute() {
  const {
    isAuthenticated,
    initializing,
  } = useAuth();


  if (initializing) {
    return null;
  }


  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return <Outlet />;
}