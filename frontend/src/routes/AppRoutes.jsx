import {
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import PublicLayout from "@/components/public/PublicLayout";

import {
  ROLES,
} from "@/constants/roles";


// ======================================================
// AUTH
// ======================================================

import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import PublicOnlyRoute from "@/features/auth/components/PublicOnlyRoute";
import RoleRoute from "@/features/auth/components/RoleRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";


// ======================================================
// COMMON APPLICATION PAGES
// ======================================================

import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaceholderPage from "@/pages/PlaceholderPage";


// ======================================================
// PUBLIC WEBSITE
// ======================================================

import AboutPage from "@/pages/public/AboutPage";
import HomePage from "@/pages/public/HomePage";
import SafetyPage from "@/pages/public/SafetyPage";
import ServicesPage from "@/pages/public/ServicesPage";


// ======================================================
// PATIENT
// ======================================================

import PatientProfilePage from "@/features/patient/pages/PatientProfilePage";


// ======================================================
// DOCTOR
// ======================================================

import DoctorProfilePage from "@/features/doctor/pages/DoctorProfilePage";

import DoctorAvailabilityPage from "@/features/availability/pages/DoctorAvailabilityPage";


// ======================================================
// DOCTOR DISCOVERY
// ======================================================

import DoctorDiscoveryPage from "@/features/discovery/pages/DoctorDiscoveryPage";

import DoctorDetailPage from "@/features/discovery/pages/DoctorDetailPage";


// ======================================================
// APPOINTMENTS
// ======================================================

import AppointmentsPage from "@/features/appointments/pages/AppointmentsPage";



export default function AppRoutes() {
  return (
    <Routes>

      {/* ================================================= */}
      {/* PUBLIC WEBSITE                                    */}
      {/* ================================================= */}

      <Route
        element={
          <PublicLayout />
        }
      >
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="/services"
          element={
            <ServicesPage />
          }
        />

        <Route
          path="/about"
          element={
            <AboutPage />
          }
        />

        <Route
          path="/safety"
          element={
            <SafetyPage />
          }
        />
      </Route>


      {/* ================================================= */}
      {/* LOGIN / REGISTER                                  */}
      {/* ================================================= */}

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
            element={
              <LoginPage />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage />
            }
          />
        </Route>
      </Route>


      {/* ================================================= */}
      {/* AUTHENTICATED APPLICATION                         */}
      {/* ================================================= */}

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          element={
            <AppShell />
          }
        >

          {/* ============================================= */}
          {/* ALL AUTHENTICATED USERS                       */}
          {/* ============================================= */}

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


          {/* ============================================= */}
          {/* APPOINTMENTS                                   */}
          {/* PATIENT + DOCTOR                               */}
          {/* ============================================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.PATIENT,
                  ROLES.DOCTOR,
                ]}
              />
            }
          >
            <Route
              path="/appointments"
              element={
                <AppointmentsPage />
              }
            />
          </Route>


          {/* ============================================= */}
          {/* NOTIFICATIONS                                  */}
          {/* PATIENT + DOCTOR + ADMIN                       */}
          {/* ============================================= */}

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
              path="/notifications"
              element={
                <PlaceholderPage
                  title="Notifications"
                  description="Review healthcare reminders and alerts."
                />
              }
            />
          </Route>


          {/* ============================================= */}
          {/* PATIENT ROUTES                                 */}
          {/* ============================================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.PATIENT,
                ]}
              />
            }
          >

            {/* Patient Profile */}

            <Route
              path="/patient/profile"
              element={
                <PatientProfilePage />
              }
            />


            {/* Medical History */}

            <Route
              path="/medical-history"
              element={
                <PlaceholderPage
                  title="Medical History"
                  description="View your medical and clinical records."
                />
              }
            />


            {/* Health Tracking */}

            <Route
              path="/health"
              element={
                <PlaceholderPage
                  title="Health Tracking"
                  description="Track health measurements and trends."
                />
              }
            />


            {/* AI Symptom Assessment */}

            <Route
              path="/symptom-assessment"
              element={
                <PlaceholderPage
                  title="AI Symptom Assessment"
                  description="AI-assisted symptom and risk assessment."
                />
              }
            />


            {/* Medical Image AI */}

            <Route
              path="/medical-image"
              element={
                <PlaceholderPage
                  title="Medical Image AI"
                  description="AI-assisted medical-image screening."
                />
              }
            />


            {/* =========================================== */}
            {/* DOCTOR DISCOVERY                            */}
            {/* =========================================== */}

            <Route
              path="/doctors"
              element={
                <DoctorDiscoveryPage />
              }
            />

            <Route
              path="/doctors/:doctorId"
              element={
                <DoctorDetailPage />
              }
            />


            {/* Nearby Healthcare */}

            <Route
              path="/nearby"
              element={
                <PlaceholderPage
                  title="Nearby Healthcare"
                  description="Find nearby healthcare facilities."
                />
              }
            />


            {/* Diet & Routine */}

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


          {/* ============================================= */}
          {/* DOCTOR ROUTES                                  */}
          {/* ============================================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.DOCTOR,
                ]}
              />
            }
          >

            {/* Doctor Profile */}

            <Route
              path="/doctor/profile"
              element={
                <DoctorProfilePage />
              }
            />


            {/* Doctor Availability */}

            <Route
              path="/doctor/availability"
              element={
                <DoctorAvailabilityPage />
              }
            />


            {/* Patient Records */}

            <Route
              path="/doctor/patients"
              element={
                <PlaceholderPage
                  title="Patient Records"
                  description="Access authorized patient information."
                />
              }
            />
          </Route>


          {/* ============================================= */}
          {/* ADMIN ROUTES                                   */}
          {/* ============================================= */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  ROLES.ADMIN,
                ]}
              />
            }
          >

            {/* Doctor Verification */}

            <Route
              path="/admin/doctors"
              element={
                <PlaceholderPage
                  title="Doctor Verification"
                  description="Review and manage doctor verification."
                />
              }
            />


            {/* Audit Logs */}

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


      {/* ================================================= */}
      {/* 404                                               */}
      {/* ================================================= */}

      <Route
        path="*"
        element={
          <NotFoundPage />
        }
      />

    </Routes>
  );
}