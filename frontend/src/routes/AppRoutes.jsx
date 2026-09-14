import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import PublicLayout from "@/components/public/PublicLayout";

import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaceholderPage from "@/pages/PlaceholderPage";

import AboutPage from "@/pages/public/AboutPage";
import AuthPlaceholderPage from "@/pages/public/AuthPlaceholderPage";
import HomePage from "@/pages/public/HomePage";
import SafetyPage from "@/pages/public/SafetyPage";
import ServicesPage from "@/pages/public/ServicesPage";


export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC WEBSITE */}

      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/services"
          element={<ServicesPage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/safety"
          element={<SafetyPage />}
        />

        <Route
          path="/login"
          element={
            <AuthPlaceholderPage
              mode="login"
            />
          }
        />

        <Route
          path="/register"
          element={
            <AuthPlaceholderPage
              mode="register"
            />
          }
        />
      </Route>


      {/* APPLICATION */}

      <Route element={<AppShell />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/appointments"
          element={
            <PlaceholderPage
              title="Appointments"
              description="Manage healthcare appointments and schedules."
            />
          }
        />

        <Route
          path="/medical-history"
          element={
            <PlaceholderPage
              title="Medical History"
              description="View medical and clinical records."
            />
          }
        />

        <Route
          path="/health"
          element={
            <PlaceholderPage
              title="Health Tracking"
              description="Monitor health measurements and trends."
            />
          }
        />

        <Route
          path="/symptom-assessment"
          element={
            <PlaceholderPage
              title="AI Symptom Assessment"
              description="AI-assisted assessment of symptoms and possible conditions."
            />
          }
        />

        <Route
          path="/medical-image"
          element={
            <PlaceholderPage
              title="Medical Image AI"
              description="AI-assisted screening of supported medical images."
            />
          }
        />

        <Route
          path="/doctors"
          element={
            <PlaceholderPage
              title="Doctors"
              description="Discover specialists and healthcare professionals."
            />
          }
        />

        <Route
          path="/nearby"
          element={
            <PlaceholderPage
              title="Nearby Healthcare"
              description="Find nearby healthcare facilities."
            />
          }
        />

        <Route
          path="/wellness"
          element={
            <PlaceholderPage
              title="Diet & Routine"
              description="Manage diet and routine plans."
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <PlaceholderPage
              title="Notifications"
              description="Review reminders, alerts and system updates."
            />
          }
        />
      </Route>


      {/* LEGACY REDIRECT IF NEEDED */}

      <Route
        path="/app"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* 404 */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}