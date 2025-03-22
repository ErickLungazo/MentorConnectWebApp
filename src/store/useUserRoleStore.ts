import { create } from "zustand";

interface UserRoleState {
  role: "mentee" | "mentor" | "admin" | "guest" | "org"; // Strict role types
  setRole: (role: UserRoleState["role"]) => void;
}

export const useUserRoleStore = create<UserRoleState>((set) => ({
  role: "guest",
  setRole: (role) => set({ role }),
}));
