import {
  ROLES,
} from "@/constants/roles";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import DoctorDashboardPage from "@/features/dashboard/pages/DoctorDashboardPage";

import PlaceholderPage from "@/pages/PlaceholderPage";


export default function DashboardPage() {
  const {
    user,
  } = useAuth();


  if (!user) {
    return null;
  }


  if (
    user.role
    === ROLES.DOCTOR
  ) {
    return (
      <DoctorDashboardPage />
    );
  }


  if (
    user.role
    === ROLES.PATIENT
  ) {
    return (
      <PlaceholderPage
        title="Patient Dashboard"
        description="Your health overview, upcoming appointments and personal healthcare activity."
      />
    );
  }


  if (
    user.role
    === ROLES.ADMIN
  ) {
    return (
      <PlaceholderPage
        title="Admin Dashboard"
        description="Review platform activity, doctor verification and administrative information."
      />
    );
  }


  return null;
}