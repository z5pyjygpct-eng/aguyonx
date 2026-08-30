import { createFileRoute } from "@tanstack/react-router";
import { OfficeDoorPage } from "@/components/site/office-door";
import { officeByPath } from "@/content/offices";

export const Route = createFileRoute("/senators")({ component: SenatorsPage });

function SenatorsPage() {
  const office = officeByPath("/senators");
  if (!office) return null;
  return <OfficeDoorPage office={office} />;
}
