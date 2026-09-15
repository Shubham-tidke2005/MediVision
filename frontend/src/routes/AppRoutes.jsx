import {
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import PublicLayout from "@/components/public/PublicLayout";

import {
  ROLES,
} from "@/constants/roles";

import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import PublicOnlyRoute from "@/features/auth/components/PublicOnlyRoute";
import RoleRoute from "@/features/auth/components/RoleRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";

import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaceholderPage from "@/pages/PlaceholderPage";

import AboutPage from "@/pages/public/AboutPage";
import HomePage from "@/pages/public/HomePage";
import SafetyPage from "@/pages/public/SafetyPage";
import ServicesPage from "@/pages/public/ServicesPage";


import PatientProfilePage
  from "@/features/patient/pages/PatientProfilePage";

import DoctorProfilePage
  from "@/features/doctor/pages/DoctorProfilePage";

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
      </Route>


      {/* LOGIN / REGISTER */}

      <Route
        element={
          <PublicOnlyRoute />
        }
      >
        <Route
          element={
            <PublicLayout />
          }
        >
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />
        </Route>
      </Route>


      {/* AUTHENTICATED APPLICATION */}

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          element={<AppShell />}
        >

          {/* ALL ROLES */}

          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/unauthorized"
            element={
              <UnauthorizedPage />
            }
          />


          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.PATIENT,
                  ROLES.DOCTOR,
                  ROLES.ADMIN,
                ]}
              />
            }
          >
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
              path="/notifications"
              element={
                <PlaceholderPage
                  title="Notifications"
                  description="Review healthcare reminders and alerts."
                />
              }
            />
          </Route>


          {/* PATIENT */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.PATIENT,
                ]}
              />
            }
          >
            <Route
              path="/medical-history"
              element={
                <PlaceholderPage
                  title="Medical History"
                  description="View your medical and clinical records."
                />
              }
            />

            <Route
              path="/health"
              element={
                <PlaceholderPage
                  title="Health Tracking"
                  description="Track health measurements and trends."
                />
              }
            />

            <Route
              path="/symptom-assessment"
              element={
                <PlaceholderPage
                  title="AI Symptom Assessment"
                  description="AI-assisted symptom and risk assessment."
                />
              }
            />

            <Route
              path="/medical-image"
              element={
                <PlaceholderPage
                  title="Medical Image AI"
                  description="AI-assisted medical-image screening."
                />
              }
            />

            <Route
              path="/doctors"
              element={
                <PlaceholderPage
                  title="Find Doctors"
                  description="Discover appropriate healthcare specialists."
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
                  description="Manage personalized diet and routine plans."
                />
              }
            />
          </Route>

          <Route
              path="/patient/profile"
            element={
                <PatientProfilePage />
             }
          />


          {/* DOCTOR */}

          <Route
              path="/doctor/profile"
              element={
              <DoctorProfilePage />
              }
          />

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.DOCTOR,
                ]}
              />
            }
          >
            <Route
              path="/doctor/patients"
              element={
                <PlaceholderPage
                  title="Patient Records"
                  description="Access authorized patient information."
                />
              }
            />

            <Route
              path="/doctor/availability"
              element={
                <PlaceholderPage
                  title="Doctor Availability"
                  description="Manage your consultation availability."
                />
              }
            />
          </Route>


          {/* ADMIN */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMIN,
                ]}
              />
            }
          >
            <Route
              path="/admin/doctors"
              element={
                <PlaceholderPage
                  title="Doctor Verification"
                  description="Review and manage doctor verification."
                />
              }
            />

            <Route
              path="/admin/audit"
              element={
                <PlaceholderPage
                  title="Audit Logs"
                  description="Review system and security activity."
                />
              }
            />
          </Route>

        </Route>
      </Route>


      {/* 404 */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}