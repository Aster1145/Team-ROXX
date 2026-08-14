import { Profile, Role } from "@/types";

export const ROLES: Record<Role, number> = {
  captain: 3,
  vice_captain: 2,
  member: 1,
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

export function canEditProject(profile?: Profile | null) {
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canManageBudget(profile?: Profile | null) {
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canRegisterEvent(profile?: Profile | null) {
  return profile?.role === "captain";
}

export function canAssignEventParticipants(profile?: Profile | null) {
  return profile?.role === "captain";
}

export function roleLabel(role: Role) {
  return role === "captain" ? "Captain" : role === "vice_captain" ? "Vice Captain" : "Member";
}
