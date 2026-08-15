import { Department } from "@/types";

export const DEPARTMENTS: Department[] = [
  "Aero Mechanics",
  "Electronics",
  "System Integration",
  "Software",
  "Implementation",
  "Research",
  "Drone Controller",
  "Trainee",
  "General",
];

export const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export const ROLES = [
  { value: "captain", label: "Captain" },
  { value: "vice_captain", label: "Vice Captain" },
  { value: "member", label: "Member" },
  { value: "trainee", label: "Trainee (1st Year)" },
];
