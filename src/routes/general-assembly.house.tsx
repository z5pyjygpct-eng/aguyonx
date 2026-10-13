import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/general-assembly/house")({
  component: () => <Outlet />,
});
