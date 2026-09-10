"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/crm", label: "CRM" },
  { href: "/finanze", label: "Finanze" },
  { href: "/review", label: "Review" },
];

export default function TopBar() {
  const pathname = usePathname();

  return (
    <div className="topbar" id="id-topbar">
      <div className="topbar-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
        PersonalOS
      </div>
      <div className="topbar-nav">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
