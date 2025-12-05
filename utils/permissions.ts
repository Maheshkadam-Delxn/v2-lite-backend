import { ROLES } from "./constants";

export function canAccess(role: string, allowedRoles: string[]) {
  return allowedRoles.includes(role);
}

export function isAdmin(role: string) {
  return role === ROLES.ADMIN;
}

export function isManager(role: string) {
  return role === ROLES.MANAGER;
}

export function isEngineer(role: string) {
  return role === ROLES.ENGINEER;
}

export function isClient(role: string) {
  return role === ROLES.CLIENT;
}
