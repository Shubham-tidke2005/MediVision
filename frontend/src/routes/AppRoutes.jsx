import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import NearbyHealthcarePage
  from "@/features/nearby/pages/NearbyHealthcarePage";

// ======================================================
// LAYOUTS.
// ======================================================

import AppShell from "@/components/layout/AppShell";
import PublicLayout from "@/components/public/PublicLayout";


// ======================================================
// CONSTANTS
// ======================================================

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
// PHASE 26 — MEDICAL HISTORY
// ======================================================

import PatientHistoryPage from "@/features/history/pages/PatientHistoryPage";


// ======================================================
// PHASE 27 — MEDICAL DOCUMENTS
// ======================================================

import PatientDocumentsPage from "@/features/documents/pages/PatientDocumentsPage";


// ======================================================
// PHASE 28 — MEDICAL ACCESS CONTROL
// ======================================================

import PatientAccessPage from "@/features/access/pages/PatientAccessPage";


// ======================================================
// MEDICATIONS
// ======================================================

import PatientMedicationsPage
  from "@/features/medications/pages/PatientMedicationsPage";


// ======================================================
// HEALTH TRACKING
// ======================================================

import PatientHealthPage
  from "@/features/health/pages/PatientHealthPage";


// ======================================================
// AI SYMPTOM ASSESSMENT
// ======================================================

import SymptomAssessmentPage
  from "@/features/symptomAssessment/pages/SymptomAssessmentPage";


// ======================================================
// WELLNESS
// ======================================================

import WellnessPage
  from "@/features/wellness/pages/WellnessPage";


// ======================================================
// PHASE 43 — HEALTH EDUCATION
// ======================================================

import HealthEducationPage
  from "@/features/healthEducation/pages/HealthEducationPage";

import HealthArticlePage
  from "@/features/healthEducation/pages/HealthArticlePage";


// ======================================================
// DOCTOR
// ======================================================

import DoctorProfilePage
  from "@/features/doctor/pages/DoctorProfilePage";

import DoctorAvailabilityPage
  from "@/features/availability/pages/DoctorAvailabilityPage";


// ======================================================
// DOCTOR DISCOVERY
// ======================================================

import DoctorDiscoveryPage
  from "@/features/discovery/pages/DoctorDiscoveryPage";

import DoctorDetailPage
  from "@/features/discovery/pages/DoctorDetailPage";


// ======================================================
// APPOINTMENTS
// ======================================================

import AppointmentsPage
  from "@/features/appointments/pages/AppointmentsPage";


// ======================================================
// CLINICAL ENCOUNTERS
// ======================================================

import EncounterPage
  from "@/features/encounters/pages/EncounterPage";


// ======================================================
// APP ROUTES
// ======================================================


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
          {/* APPOINTMENTS                                  */}
          {/* PATIENT + DOCTOR                              */}
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
          {/* NOTIFICATIONS                                 */}
          {/* PATIENT + DOCTOR + ADMIN                      */}
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
          {/* PATIENT ROUTES                                */}
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

            {/* =========================================== */}
            {/* PATIENT PROFILE                             */}
            {/* =========================================== */}

            <Route
              path="/patient/profile"
              element={
                <PatientProfilePage />
              }
            />


            {/* =========================================== */}
            {/* MEDICATIONS                                 */}
            {/* =========================================== */}

            <Route
              path="/patient/medications"
              element={
                <PatientMedicationsPage />
              }
            />


            {/* =========================================== */}
            {/* PHASE 26 — DIGITAL MEDICAL HISTORY          */}
            {/* =========================================== */}

            <Route
              path="/patient/history"
              element={
                <PatientHistoryPage />
              }
            />


            {/* =========================================== */}
            {/* OLD MEDICAL HISTORY URL                     */}
            {/* =========================================== */}

            <Route
              path="/medical-history"
              element={
                <Navigate
                  to="/patient/history"
                  replace
                />
              }
            />


            {/* =========================================== */}
            {/* PHASE 27 — MEDICAL DOCUMENTS                */}
            {/* =========================================== */}

            <Route
              path="/patient/documents"
              element={
                <PatientDocumentsPage />
              }
            />


            {/* =========================================== */}
            {/* PHASE 28 — MEDICAL ACCESS CONTROL           */}
            {/* =========================================== */}

            <Route
              path="/patient/access"
              element={
                <PatientAccessPage />
              }
            />


            {/* =========================================== */}
            {/* HEALTH TRACKING                             */}
            {/* =========================================== */}

            <Route
              path="/health"
              element={
                <PatientHealthPage />
              }
            />


            {/* =========================================== */}
            {/* AI SYMPTOM ASSESSMENT                       */}
            {/* =========================================== */}

            <Route
              path="/symptom-assessment"
              element={
                <SymptomAssessmentPage />
              }
            />


            {/* =========================================== */}
            {/* MEDICAL IMAGE AI                            */}
            {/* PHASE 37–40 CURRENTLY DEFERRED              */}
            {/* =========================================== */}

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


            {/* =========================================== */}
            {/* DIET & ROUTINE                              */}
            {/* PHASE 41 + PHASE 42                         */}
            {/* =========================================== */}

            <Route
              path="/wellness"
              element={
                <WellnessPage />
              }
            />


            {/* =========================================== */}
            {/* PHASE 43 — PREVENTIVE HEALTH                */}
            {/* =========================================== */}

            <Route
              path="/health-education"
              element={
                <HealthEducationPage />
              }
            />

            <Route
              path="/health-education/:slug"
              element={
                <HealthArticlePage />
              }
            />


            {/* =========================================== */}
            {/* NEARBY HEALTHCARE                           */}
            {/* PHASE 45                                    */}
            {/* =========================================== */}

            <Route
  path="/nearby"
  element={
    <NearbyHealthcarePage />
  }
/>

          </Route>


          {/* ============================================= */}
          {/* DOCTOR ROUTES                                 */}
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

            {/* =========================================== */}
            {/* DOCTOR PROFILE                              */}
            {/* =========================================== */}

            <Route
              path="/doctor/profile"
              element={
                <DoctorProfilePage />
              }
            />


            {/* =========================================== */}
            {/* DOCTOR AVAILABILITY                         */}
            {/* =========================================== */}

            <Route
              path="/doctor/availability"
              element={
                <DoctorAvailabilityPage />
              }
            />


            {/* =========================================== */}
            {/* CLINICAL ENCOUNTER                          */}
            {/* =========================================== */}

            <Route
              path="/doctor/encounters/:encounterId"
              element={
                <EncounterPage />
              }
            />


            {/* =========================================== */}
            {/* PATIENT RECORDS                             */}
            {/* =========================================== */}

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
          {/* ADMIN ROUTES                                  */}
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

            {/* =========================================== */}
            {/* DOCTOR VERIFICATION                         */}
            {/* =========================================== */}

            <Route
              path="/admin/doctors"
              element={
                <PlaceholderPage
                  title="Doctor Verification"
                  description="Review and manage doctor verification."
                />
              }
            />


            {/* =========================================== */}
            {/* AUDIT LOGS                                  */}
            {/* =========================================== */}

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