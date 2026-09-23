import { Profile, Role, Department } from "@/types";

export const ROLES: Record<Role, number> = {
  captain: 4,
  vice_captain: 3,
  mentor: 2,
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

export function isMentor(profile?: Profile | null) {
  return profile?.role === "mentor";
}

export function isTrainee(profile?: Profile | null) {
  return profile?.role === "trainee" || profile?.department === "Trainee";
}

export function canEditProject(profile?: Profile | null) {
  if (isTrainee(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canManageBudget(profile?: Profile | null) {
  if (isTrainee(profile) || isMentor(profile)) return false;
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
  if (isTrainee(profile) || isMentor(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain" || profile?.role === "member";
}

export function canScheduleMeetings(profile?: Profile | null) {
  if (isTrainee(profile) || isMentor(profile)) return false;
  return profile?.role === "captain" || profile?.role === "vice_captain";
}

export function canCreateOrEdit(profile?: Profile | null) {
  return !isTrainee(profile);
}

export function canRateTrainees(profile?: Profile | null, targetProjectId?: string | null) {
  if (!profile) return false;
  if (profile.role === "captain" || profile.role === "vice_captain") return true;
  if (profile.role === "mentor") {
    return !!profile.project_id && (!targetProjectId || profile.project_id === targetProjectId);
  }
  return false;
}

export function canDeleteTask(profile?: Profile | null, targetProjectId?: string | null) {
  if (!profile) return false;
  if (profile.role === "captain" || profile.role === "vice_captain") return true;
  if (profile.role === "mentor") {
    return !!profile.project_id && (!targetProjectId || profile.project_id === targetProjectId);
  }
  return false;
}

export function canAssignTasksForProject(profile?: Profile | null, projectId?: string | null) {
  if (!profile) return false;
  if (profile.role === "captain" || profile.role === "vice_captain") return true;
  if (profile.role === "mentor") {
    return !!profile.project_id && profile.project_id === projectId;
  }
  return false;
}

export function canRateReportForMember(profile?: Profile | null, reportMemberProjectId?: string | null) {
  if (!profile) return false;
  if (profile.role === "captain") return true;
  if (profile.role === "mentor") {
    return !!profile.project_id && profile.project_id === reportMemberProjectId;
  }
  return false;
}

export function canApproveBudgetRequests(profile?: Profile | null, requestProjectId?: string | null) {
  if (!profile) return false;
  if (profile.role === "captain") return true;
  if (profile.role === "mentor") {
    return !requestProjectId || !profile.project_id || profile.project_id === requestProjectId;
  }
  return false;
}

export function roleLabel(role?: Role, department?: Department) {
  if (role === "trainee" || department === "Trainee") {
    return "Trainee (1st Year)";
  }
  switch (role) {
    case "captain":
      return "Captain (Team Lead)";
    case "vice_captain":
      return "Vice Captain";
    case "mentor":
      return "Project Mentor";
    case "member":
    default:
      return "Member";
  }
}
