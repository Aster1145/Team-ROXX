import { Department } from "@/types";

export const DEPARTMENTS: Department[] = [
  "Aero Mechanics",
  "Electronics",
  "System Integration",
  "Software",
  "Research",
  "Drone Controller",
  "Trainee",
  "Social Media",
  "Documentation",
  "CAD/CAM",
  "Technical Integration",
  "Avionics",
  "Autonomy Stack",
  "Testing & Flight Operations",
  "General",
];

export const ACADEMIC_DEPARTMENTS: Department[] = [
  "Computer Science & Engineering (CSE)",
  "Computer Science & Engineering (CSE)-DS",
  "Computer Science & Engineering (CSE)-AIML",
  "Computer Science & Engineering (CSE)-AIDS",
  "Computer Science & Engineering (CSE)-CY",
  "Computer Science & Engineering (CSE)- AI & Robotics",
  "ECE",
  "Aero space",
  "Mechanical",
  "Computer Science & Technology (CST)",
];

export const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export const ROLES = [
  { value: "captain", label: "Captain (Team Lead)" },
  { value: "vice_captain", label: "Vice Captain" },
  { value: "mentor", label: "Project Mentor" },
  { value: "member", label: "Member" },
  { value: "trainee", label: "Trainee (1st Year)" },
];
