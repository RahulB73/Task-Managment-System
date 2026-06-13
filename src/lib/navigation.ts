import {
  LayoutDashboard,
  Briefcase,
  Target,
  CalendarDays,
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
