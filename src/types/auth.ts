import type { UserRole } from "./user";

export type UserProfile = {
  name: string;
  email: string;
  role: UserRole;
};
