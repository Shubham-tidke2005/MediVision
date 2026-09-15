import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  HeartPulse,
} from "lucide-react";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";


function AuthLoadingScreen() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
        p-6
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-blue-600
            text-white
          "
        >
          <HeartPulse
            className="
              h-6
              w-6
              animate-pulse
            "
          />
        </div>

        <p
          className="
            mt-4
            text-sm
            font-medium
            text-slate-700
          "
        >
          Loading MediVision...
        </p>
      </div>
    </main>
  );
}


export default function ProtectedRoute() {
  const {
    isAuthenticated,
    initializing,
  } = useAuth();

  const location =
    useLocation();


  if (initializing) {
    return <AuthLoadingScreen />;
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }


  return <Outlet />;
}