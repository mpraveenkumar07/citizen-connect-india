import { createFileRoute, Outlet } from "@tanstack/react-router";

// Authentication temporarily disabled for demo — this layout is now a pass-through.
export const Route = createFileRoute("/_authenticated")({
  component: () => <Outlet />,
});
