import {
  Activity,
  Bell,
  BrainCircuit,
  CalendarDays,
  FileHeart,
  HeartPulse,
  Home,
  Hospital,
  Image,
  Salad,
  Stethoscope,
} from "lucide-react";


export const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },

  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
  },

  {
    label: "Medical History",
    path: "/medical-history",
    icon: FileHeart,
  },

  {
    label: "Health Tracking",
    path: "/health",
    icon: Activity,
  },

  {
    label: "Symptom Assessment",
    path: "/symptom-assessment",
    icon: BrainCircuit,
  },

  {
    label: "Medical Image AI",
    path: "/medical-image",
    icon: Image,
  },

  {
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
  },

  {
    label: "Nearby Healthcare",
    path: "/nearby",
    icon: Hospital,
  },

  {
    label: "Diet & Routine",
    path: "/wellness",
    icon: Salad,
  },

  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
];


export const brandNavigationItem = {
  label: "MediVision AI",
  icon: HeartPulse,
};