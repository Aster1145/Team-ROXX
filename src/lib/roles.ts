import { Profile, Role, Department } from "@/types";

export const ROLES: Record<Role, number> = {
  captain: 3,
  vice_captain: 2,
  member: 1,
  trainee: 0,
};

export function canManageMembers(profile?: Profile | null) {
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function isCaptain(profile?: Profile | null) {
  return profile?.role === "captain";
}

export function isViceCaptain(profile?: Profile | null) {
  return profile?.role === "vice_captain";
}

export function isTrainee(profile?: Profile | null) {
  return profile?.role === "trainee" || profile?.department === "Trainee";
}

export function canEditProject(profile?: Profile | null) {
  if (isTrainee(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canManageBudget(profile?: Profile | null) {
  if (isTrainee(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canRegisterEvent(profile?: Profile | null) {
  return profile?.role === "captain";
}

export function canAssignEventParticipants(profile?: Profile | null) {
  return profile?.role === "captain";
}

export function canAccessRestrictedSections(profile?: Profile | null) {
  return !isTrainee(profile);
}

export function canAccessMeetings(profile?: Profile | null) {
  if (isTrainee(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain" || profile?.role === "member";
}

export function canScheduleMeetings(profile?: Profile | null) {
  if (isTrainee(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canCreateOrEdit(profile?: Profile | null) {
  return !isTrainee(profile);
}

export function roleLabel(role?: Role, department?: Department) {
  if (role === "trainee" || department === "Trainee") {
    return "Trainee (1st Year)";
  }
  switch (role) {
    case "captain":
      return "Captain";
    case "vice_captain":
      return "Vice Captain";
    case "member":
    default:
      return "Member";
  }
}
