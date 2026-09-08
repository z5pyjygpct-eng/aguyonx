import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/counties/loudoun")({
  component: () => <Outlet />,
});
