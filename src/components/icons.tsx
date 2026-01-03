import type { SVGProps } from 'react';

export function AtomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="hsl(var(--primary))"
    >
      <title>A.T.O.M Logo</title>

      <g>
        {/* Core Nucleus */}
        <circle cx="50" cy="50" r="6" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="9" strokeWidth="0.5" strokeOpacity="0.8" />

        {/* Orbital Paths */}
        <ellipse cx="50" cy="50" rx="25" ry="45" strokeWidth="1" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="50" rx="25" ry="45" strokeWidth="1" transform="rotate(-45 50 50)" />
        <circle cx="50" cy="50" r="35" strokeWidth="0.75" />

        {/* Electrons */}
        <circle cx="21.7" cy="35" r="2.5" fill="hsl(var(--primary))" stroke="none" />
        <circle cx="78.3" cy="65" r="2.5" fill="hsl(var(--primary))" stroke="none" />
        <circle cx="35" cy="78.3" r="2.5" fill="hsl(var(--primary))" stroke="none" />

        {/* Outer Ring */}
        <circle cx="50" cy="50" r="48" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
