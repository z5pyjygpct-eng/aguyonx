import { Link } from "@tanstack/react-router";

/** Small "All Find the Moment" link shown on every FTM section. */
export function AllFtmLink({ className = "" }: { className?: string }) {
  return (
    <p className={`font-mono text-[11px] tracking-widest uppercase ${className}`}>
      <Link to="/find-the-moment" className="text-[#1E4B8E] underline-offset-2 hover:underline">
        All Find the Moment →
      </Link>
    </p>
  );
}
