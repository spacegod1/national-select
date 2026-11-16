"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { signOut } from "@/app/staff/actions";
import { Busy, Spinner } from "@/components/spinner";
import { Icon, initials, plainLink, type IconName } from "@/components/staff-ui";
import { CLINIC } from "@/lib/site-data";

/*
 * The menu around every staff page. Tablets and larger screens get a navy rail
 * down the left; phones get the logo over a row of tabs that stays in reach.
 */

type Section = "accounts" | "new" | "reports" | "users" | "activity";

const NAV: { id: Section; href: string; label: string; short: string; icon: IconName; adminOnly?: boolean }[] = [
  { id: "accounts", href: "/staff", label: "Accounts", short: "Accounts", icon: "accounts" },
  { id: "new", href: "/staff/new", label: "New patient", short: "New", icon: "plus" },
  { id: "reports", href: "/staff/reports", label: "Reports", short: "Reports", icon: "chart", adminOnly: true },
  { id: "users", href: "/staff/users", label: "Users", short: "Users", icon: "users", adminOnly: true },
  { id: "activity", href: "/staff/audit", label: "Activity", short: "Activity", icon: "activity", adminOnly: true },
];

function useNav(admin: boolean) {
  const pathname = usePathname();
  const section: Section | null =
    pathname === "/staff" || pathname.startsWith("/staff/accounts/")
      ? "accounts"
      : (NAV.find((item) => item.href !== "/staff" && pathname.startsWith(item.href))?.id ?? null);
  return { section, items: NAV.filter((item) => admin || !item.adminOnly) };
}

const railButton = `grid h-10 w-10 place-items-center rounded-[10px] text-white/65 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white ${plainLink}`;

/* The Sign out buttons. Each sits inside its form, which is how it knows the form is being sent. */

function RailSignOut() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label="Sign out" title="Sign out" className={railButton}>
      {pending ? <Spinner className="h-5 w-5" /> : <Icon name="out" />}
    </button>
  );
}

/** A Sign out button in words. Put it inside a `<form action={signOut}>`. */
export function SignOutButton({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? <Busy>Signing out</Busy> : "Sign out"}
    </button>
  );
}

export function StaffRail({ name, admin }: { name: string; admin: boolean }) {
  const { section, items } = useNav(admin);

  return (
    <aside className="hidden w-[76px] flex-none flex-col items-center bg-ink py-3.5 md:flex">
      {/* The cross from the logo. The full logo's wording is too small to read at this width. */}
      <Image src="/logo-mark.png" alt={CLINIC.name} width={44} height={44} className="h-11 w-11" />
      <nav aria-label="Staff" className="mt-4 flex flex-col gap-1">
        {items.map((item) => {
          const active = section === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={`relative flex w-[62px] flex-col items-center gap-1 rounded-[10px] py-2 text-[10.5px] font-semibold transition-colors duration-150 ease-out hover:text-white ${plainLink} ${
                active ? "bg-white/[.13] text-white" : "text-white/65 hover:bg-white/[.07]"
              }`}
            >
              {active ? (
                <span aria-hidden="true" className="absolute inset-y-2.5 -left-[7px] w-[3px] rounded-full bg-coral" />
              ) : null}
              <Icon name={item.icon} />
              {item.short}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-1">
        <Link href="/staff/password" aria-label="Change password" title="Change password" className={railButton}>
          <Icon name="lock" />
        </Link>
        <form action={signOut}>
          <RailSignOut />
        </form>
        <span
          title={`${name}, ${admin ? "Admin" : "Staff"}`}
          className="mt-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[12px] font-bold text-ink ring-[3px] ring-white/20"
        >
          <span aria-hidden="true">{initials(name)}</span>
          <span className="sr-only">
            Signed in as {name}, {admin ? "admin" : "staff"}
          </span>
        </span>
      </div>
    </aside>
  );
}

const topLink = `relative text-[13.5px] font-semibold text-muted after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:text-ink ${plainLink}`;

export function StaffTopBar({ admin }: { admin: boolean }) {
  const { section, items } = useNav(admin);

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-[clamp(16px,4vw,40px)] py-3.5 md:hidden">
        <Image src="/logo.png" alt={CLINIC.name} width={106} height={46} className="h-9 w-auto" />
        <div className="flex items-center gap-x-4">
          <Link href="/staff/password" className={topLink}>
            Password
          </Link>
          <form action={signOut} className="flex">
            <SignOutButton className={topLink} />
          </form>
        </div>
      </header>
      {/* Not inside the header, so it can stay at the top of the screen as the page scrolls. */}
      <nav
        aria-label="Staff"
        className="sticky top-0 z-10 flex gap-x-6 overflow-x-auto border-y border-ink bg-white px-[clamp(16px,4vw,40px)] md:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={section === item.id ? "page" : undefined}
            className={`whitespace-nowrap border-b-[3px] pb-2.5 pt-3 text-[15px] font-semibold hover:text-ink ${plainLink} ${
              section === item.id ? "border-brand text-ink" : "border-transparent text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
