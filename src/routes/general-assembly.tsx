import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/general-assembly")({
  component: () => <Outlet />,
});
