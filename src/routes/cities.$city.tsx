import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/cities/$city")({
  component: () => <Outlet />,
});
