import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATA = [
  { month: "Jan", hearings: 2 },
  { month: "Feb", hearings: 3 },
  { month: "Mar", hearings: 2 },
  { month: "Apr", hearings: 4 },
  { month: "May", hearings: 3 },
  { month: "Jun", hearings: 2 },
  { month: "Jul", hearings: 3 },
  { month: "Aug", hearings: 2 },
];

export function HearingsChart() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <figure className="border border-border bg-card p-4 sm:p-6">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Public hearing items · sample series
      </p>
      <div className="mt-4 h-64 w-full">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: "var(--color-wash)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="hearings" fill="var(--color-forest)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="size-full bg-wash" aria-hidden="true" />
        )}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Illustrative counts from public calendars, to show the method. Download the CSV in the
        source packet.
      </figcaption>
    </figure>
  );
}
