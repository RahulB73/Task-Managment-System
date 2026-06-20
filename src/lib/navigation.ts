import {
  LayoutDashboard,
  Briefcase,
  Target,
  CalendarDays,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

export const mainNav: NavItem[] = [
  {
    label: "Today",
    href: "/today",
    icon: Sun,
    match: (pathname) => pathname.startsWith("/today"),
  },
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    match: (pathname) => pathname === "/",
  },
  {
    label: "Office",
    href: "/office",
    icon: Briefcase,
    match: (pathname) => pathname.startsWith("/office"),
  },
  {
    label: "Personal",
    href: "/personal",
    icon: Target,
    match: (pathname) => pathname.startsWith("/personal"),
  },
  {
    label: "Monthly Progress",
    href: "/monthly",
    icon: CalendarDays,
    match: (pathname) => pathname.startsWith("/monthly"),
  },
];
