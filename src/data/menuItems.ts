import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Home,
  MessageCircle,
  Paperclip,
  Settings,
  Users,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ElementType;
  group?: string; // Optional grouping
}

export const sidebarMenu: Record<string, SidebarItem[]> = {
  mentee: [
    { title: "Home", url: "/mentee", icon: Home },
    { title: "Find a Mentor", url: "/mentee/mentors", icon: Users },
    { title: "Sessions", url: "/mentee/sessions", icon: Users },
    { title: "Messages", url: "/mentee/messages", icon: MessageCircle },
    { title: "Opportunities", url: "/mentee/jobs", icon: Briefcase },
    { title: "Resources", url: "/mentee/resources", icon: BookOpen },
    // { title: "Settings", url: "/settings", icon: Settings },
  ],
  mentor: [
    { title: "Home", url: "/", icon: Home },
    { title: "Sessions", url: "/mentor/sessions", icon: Users },
    { title: "My Mentees", url: "/mentor/my-mentees", icon: Users },
    { title: "Messages", url: "/mentor/messages", icon: MessageCircle },
    { title: "Resources", url: "/mentor/resources", icon: BookOpen },
    // { title: "Career Opportunities", url: "/careers", icon: Briefcase },
    // { title: "Settings", url: "/settings", icon: Settings },
  ],
  org: [
    { title: "Home", url: "/", icon: Home },
    { title: "Jobs", url: "/org/opportunities/jobs", icon: Briefcase }, // Briefcase represents jobs
    {
      title: "Internships",
      url: "/org/opportunities/internships",
      icon: GraduationCap,
    }, // GraduationCap fits internships
    {
      title: "Attachments",
      url: "/org/opportunities/attachments",
      icon: Paperclip,
    }, // Paperclip for document-based attachments
  ],
  admin: [
    { title: "Home", url: "/", icon: Home },
    { title: "User Management", url: "/users", icon: Users },
    { title: "Messages", url: "/messages", icon: MessageCircle },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  guest: [
    { title: "Home", url: "/", icon: Home },
    { title: "Resources", url: "/resources", icon: BookOpen },
  ],
};
