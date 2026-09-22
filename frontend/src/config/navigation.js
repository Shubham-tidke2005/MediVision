import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  Building2,
  CalendarDays,
  FileHeart,
  FileText,
  History,
  Home,
  Hospital,
  Image,
  Pill,
  Salad,
  Share2,
  ShieldAlert,
  Stethoscope,
  Tags,
  Users,
  UserRound,
} from "lucide-react";

import {
  ROLES,
} from "@/constants/roles";


export const navigationItems = [

  // =====================================================
  // SHARED DASHBOARD
  // =====================================================

  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,

    roles: [
      ROLES.PATIENT,
      ROLES.DOCTOR,
      ROLES.ADMIN,
    ],
  },


  // =====================================================
  // PATIENT NAVIGATION
  // =====================================================

  {
    label: "My Profile",
    path: "/patient/profile",
    icon: UserRound,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Find Doctors",
    path: "/doctors",
    icon: Stethoscope,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Medical History",
    path: "/patient/history",
    icon: FileHeart,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Medical Documents",
    path: "/patient/documents",
    icon: FileText,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Medical Access",
    path: "/patient/access",
    icon: Share2,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Medications",
    path: "/patient/medications",
    icon: Pill,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Health Tracking",
    path: "/health",
    icon: Activity,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Symptom Assessment",
    path: "/symptom-assessment",
    icon: BrainCircuit,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Medical Image AI",
    path: "/medical-image",
    icon: Image,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Diet & Routine",
    path: "/wellness",
    icon: Salad,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Health Education",
    path: "/health-education",
    icon: BookOpen,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Nearby Healthcare",
    path: "/nearby",
    icon: Hospital,

    roles: [
      ROLES.PATIENT,
    ],
  },


  {
    label: "Emergency SOS",
    path: "/sos",
    icon: ShieldAlert,

    roles: [
      ROLES.PATIENT,
    ],
  },


  // =====================================================
  // DOCTOR NAVIGATION
  // =====================================================

  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,

    roles: [
      ROLES.DOCTOR,
    ],
  },


  {
    label: "My Profile",
    path: "/doctor/profile",
    icon: UserRound,

    roles: [
      ROLES.DOCTOR,
    ],
  },


  {
    label: "Availability",
    path: "/doctor/availability",
    icon: CalendarDays,

    roles: [
      ROLES.DOCTOR,
    ],
  },


  {
    label: "Patient Records",
    path: "/doctor/patients",
    icon: Users,

    roles: [
      ROLES.DOCTOR,
    ],
  },


  // =====================================================
  // ADMIN NAVIGATION
  // =====================================================

  {
    label: "Users",
    path: "/admin/users",
    icon: Users,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Patients",
    path: "/admin/patients",
    icon: UserRound,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Doctors",
    path: "/admin/doctors",
    icon: Stethoscope,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Specialties",
    path: "/admin/specialties",
    icon: Tags,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Facilities",
    path: "/admin/facilities",
    icon: Building2,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Appointments",
    path: "/admin/appointments",
    icon: CalendarDays,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Health Articles",
    path: "/admin/health-articles",
    icon: BookOpen,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "AI Assessments",
    path: "/admin/ai-assessments",
    icon: BrainCircuit,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "SOS Events",
    path: "/admin/sos",
    icon: ShieldAlert,

    roles: [
      ROLES.ADMIN,
    ],
  },


  {
    label: "Audit Logs",
    path: "/admin/audit",
    icon: History,

    roles: [
      ROLES.ADMIN,
    ],
  },


  // =====================================================
  // SHARED NOTIFICATIONS
  // =====================================================

  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,

    roles: [
      ROLES.PATIENT,
      ROLES.DOCTOR,
      ROLES.ADMIN,
    ],
  },
];