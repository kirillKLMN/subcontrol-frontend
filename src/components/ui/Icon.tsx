import type { ReactNode } from "react";

export default function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    people: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    approvals: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 3h6v4H9zm0 11 2 2 4-4" />
      </>
    ),
    exit: (
      <>
        <path d="M10 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5m5 5 5 4-5 4m-7-4h12" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    down: <path d="m6 9 6 6 6-6" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5m0 3v1" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3v1" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10m-7 5h4" />
        <circle cx="8" cy="7" r="2" fill="currentColor" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v16m0-16C8 2 3 4 3 4v15s5-2 9 2c4-4 9-2 9-2V4s-5-2-9 1Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.layers}
    </svg>
  );
}