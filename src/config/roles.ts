export type UserRole = "doctor" | "nurse" | "pharmacist" | "admin";

export interface RoleConfig {
  role: UserRole;
  displayName: string;
  department: string;
  userName: string;
  initials: string;
  email: string;
  allowedViews: string[];
}

/**
 * Role Permission Matrix:
 * 
 * | View        | Doctor | Nurse | Pharmacist | Admin |
 * |-------------|--------|-------|------------|-------|
 * | Dashboard   |   ✅   |  ✅   |     ✅     |  ✅   |
 * | AI Scribe   |   ✅   |  ❌   |     ❌     |  ✅   |
 * | Inventory   |   ❌   |  ✅   |     ✅     |  ✅   |
 * | Beds        |   ✅   |  ✅   |     ❌     |  ✅   |
 * | Ambulance   |   ✅   |  ✅   |     ❌     |  ✅   |
 * | Staff       |   ❌   |  ❌   |     ❌     |  ✅   |
 * | AI What-If  |   ✅   |  ❌   |     ❌     |  ✅   |
 */
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  doctor: {
    role: "doctor",
    displayName: "Dr. Sarah Lin, MD",
    department: "Internal Medicine & Cardiology",
    userName: "sarah.lin",
    initials: "SL",
    email: "s.lin@metrogeneral.health",
    allowedViews: ["dashboard", "overview", "scribe", "beds", "ambulance", "what-if"],
  },
  nurse: {
    role: "nurse",
    displayName: "Nurse Davis, RN",
    department: "ICU & Critical Care",
    userName: "j.davis",
    initials: "JD",
    email: "j.davis@metrogeneral.health",
    allowedViews: ["dashboard", "overview", "inventory", "beds", "ambulance"],
  },
  pharmacist: {
    role: "pharmacist",
    displayName: "Dr. Raj Patel, PharmD",
    department: "Central Pharmacy Unit",
    userName: "r.patel",
    initials: "RP",
    email: "r.patel@metrogeneral.health",
    allowedViews: ["dashboard", "overview", "inventory"],
  },
  admin: {
    role: "admin",
    displayName: "Alex Chen, CTO",
    department: "Hospital IT Administration",
    userName: "a.chen",
    initials: "AC",
    email: "a.chen@metrogeneral.health",
    allowedViews: ["dashboard", "overview", "scribe", "inventory", "beds", "ambulance", "staff", "what-if"],
  },
};

/** Check if a role has access to a specific view */
export function hasAccess(role: UserRole, viewId: string): boolean {
  return ROLE_CONFIGS[role].allowedViews.includes(viewId);
}

/** Get the display label for a role */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "doctor": return "Physician";
    case "nurse": return "Registered Nurse";
    case "pharmacist": return "Pharmacist";
    case "admin": return "Administrator";
  }
}
