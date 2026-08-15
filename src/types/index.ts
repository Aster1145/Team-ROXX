export type Role = "captain" | "vice_captain" | "member" | "trainee";

export type Department =
  | "Aero Mechanics"
  | "Electronics"
  | "System Integration"
  | "Software"
  | "Implementation"
  | "Research"
  | "Drone Controller"
  | "Trainee"
  | "General";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  department: Department;
  project_id: string | null;
  phone_number?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planned" | "ongoing" | "on_hold" | "completed";
  department: Department;
  progress: number;
  created_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  assigned_by: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  project?: { name: string };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  max_participants: number;
  location: string;
  registered_by: string | null;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  profile_id: string;
  created_at: string;
  profile?: { full_name: string; email: string };
}

export interface ResearchDoc {
  id: string;
  project_id: string | null;
  title: string;
  content: string;
  author_id: string | null;
  created_at: string;
  author?: { full_name: string };
}

export interface WeeklyReport {
  id: string;
  profile_id: string;
  week_ending: string;
  summary: string;
  accomplishments: string;
  blockers: string;
  next_steps: string;
  rating_stars?: number | null;
  points?: number | null;
  rated_by?: string | null;
  rating_feedback?: string | null;
  created_at: string;
  profile?: { full_name: string; department: Department; role?: string };
}

export interface InventoryLog {
  id: string;
  item_name: string;
  purpose?: string | null;
  taken_by: string;
  taken_at: string;
  returned_at: string | null;
  condition_notes: string;
  profile?: { full_name: string };
}

export interface BudgetItem {
  id: string;
  project_id: string | null;
  item: string;
  amount: number;
  quantity: number;
  category: string;
  purchased_by: string | null;
  purchased_at: string;
  profile?: { full_name: string };
}

export type RequestStatus = "pending" | "approved" | "rejected" | "ordered";
export type RequestPriority = "low" | "medium" | "high" | "urgent";

export interface BudgetItemRequest {
  id: string;
  requested_by: string;
  project_id: string | null;
  item: string;
  amount: number;
  quantity: number;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  justification?: string | null;
  link?: string | null;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
  requester?: { full_name: string; email: string };
  reviewer?: { full_name: string };
}

export interface Comment {
  id: string;
  task_id: string | null;
  report_id: string | null;
  author_id: string;
  content: string;
  created_at: string;
  author?: { full_name: string };
}

export type ResourceType = "youtube" | "drive" | "link";

export interface LearningResource {
  id: string;
  title: string;
  description?: string | null;
  resource_type: ResourceType;
  url: string;
  category: string;
  added_by?: string | null;
  created_at: string;
  author?: { full_name: string };
}
