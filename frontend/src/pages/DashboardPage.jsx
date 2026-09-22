import {
  ROLES,
} from "@/constants/roles";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import AdminDashboardPage
  from "@/features/admin/pages/AdminDashboardPage";

import DoctorDashboardPage
  from "@/features/dashboard/pages/DoctorDashboardPage";

import PatientDashboardPage
  from "@/features/dashboard/pages/PatientDashboardPage";


export default function DashboardPage() {
  const {
    user,
  } = useAuth();


  if (!user) {
    return null;
  }


  // ====================================================
  // PATIENT DASHBOARD
  // ====================================================

  if (
    user.role
    === ROLES.PATIENT
  ) {
    return (
      <PatientDashboardPage />
    );
  }


  // ====================================================
  // DOCTOR DASHBOARD
  // ====================================================

  if (
    user.role
    === ROLES.DOCTOR
  ) {
    return (
      <DoctorDashboardPage />
    );
  }


  // ====================================================
  // ADMIN DASHBOARD
  // ====================================================

  if (
    user.role
    === ROLES.ADMIN
  ) {
    return (
      <AdminDashboardPage />
    );
  }


  return null;
}