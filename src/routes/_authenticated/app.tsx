import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { MessageSquare, FileText, Search, LayoutDashboard, Building2, BellRing, Scale, ClipboardList, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

const items = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/chat", label: "AI Assistant", icon: MessageSquare, exact: false },
  { to: "/app/schemes", label: "Schemes", icon: Search, exact: false },
  { to: "/app/rights", label: "Rights", icon: Scale, exact: false },
  { to: "/app/complaints", label: "Complaints / RTI", icon: FileText, exact: false },
  { to: "/app/departments", label: "Departments", icon: Building2, exact: false },
  { to: "/app/tracker", label: "Tracker", icon: ClipboardList, exact: false },
  { to: "/app/legal-aid", label: "Legal Aid", icon: LifeBuoy, exact: false },
  { to: "/app/policy", label: "Policy Updates", icon: BellRing, exact: false },
] as const;


function AppLayout() {
  const loc = useLocation();
  return (
    <div className="border-b bg-muted/30">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {items.map((i) => {
          const active = i.exact ? loc.pathname === i.to : loc.pathname.startsWith(i.to);
          return (
            <Link
              key={i.to}
              to={i.to}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <i.icon className="h-4 w-4" />
              {i.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
