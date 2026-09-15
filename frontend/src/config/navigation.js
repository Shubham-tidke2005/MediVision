import {
  Activity,
  Bell,
  BrainCircuit,
  CalendarDays,
  ClipboardCheck,
  FileHeart,
  History,
  Home,
  Hospital,
  Image,
  Salad,
  Stethoscope,
  Users,
  UserRound,
} from "lucide-react";

import {
  ROLES,
} from "@/constants/roles";




export const navigationItems = [
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
      ROLES.DOCTOR,
      ROLES.ADMIN,
    ],
  },


  {
    label: "Medical History",
    path: "/medical-history",
    icon: FileHeart,

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
    label: "Find Doctors",
    path: "/doctors",
    icon: Stethoscope,

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
    label: "Diet & Routine",
    path: "/wellness",
    icon: Salad,

    roles: [
      ROLES.PATIENT,
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


  {
    label: "Availability",
    path: "/doctor/availability",
    icon: CalendarDays,

    roles: [
      ROLES.DOCTOR,
    ],
  },


  {
    label: "Doctor Verification",
    path: "/admin/doctors",
    icon: ClipboardCheck,

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

  {
  label: "My Profile",
  path: "/doctor/profile",
  icon: UserRound,

  roles: [
    ROLES.DOCTOR,
  ],
  },

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

