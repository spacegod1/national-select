"use client";

import { useState } from "react";
import {
  balanceOf,
  ChargeForm,
  ChargeList,
  Chip,
  dollars,
  fullDate,
  Icon,
  initials,
  Logo,
  matches,
  ME,
  NAV,
  PaymentList,
  SecondaryScreen,
  SignedOut,
  TODAY_LABEL,
  usePortalView,
  type Account,
  type Go,
  type Portal,
  type Skin,
} from "../shared";

/**
 * Console: a navy sidebar and an overview. The home screen answers "how are we
 * doing" in four numbers before it lists anyone. On a phone the sidebar
 * becomes a tab bar along the bottom.
 */

const skin: Skin = {
  title: "font-display text-[clamp(26px,3.2vw,34px)] font-extrabold leading-[1.05] tracking-[-.03em]",
  lead: "mt-2 max-w-[640px] text-[15.5px] leading-[1.55] text-muted",
  card: "rounded-[18px] border border-line bg-white p-[clamp(18px,2.4vw,26px)]",
  heading: "font-display text-[19px] font-bold tracking-[-.02em]",
  label: "flex flex-col gap-1.5 text-[13.5px] font-semibold",
  input: "w-full rounded-[10px] border-[1.5px] border-field bg-mist px-3 py-2.5 text-[16px] font-normal",
  primary: "portal-press rounded-[10px] bg-brand px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-brand-press",
  quiet: "text-[14px] font-semibold text-brand hover:text-brand-dark relative after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-['']",
  list: "overflow-hidden rounded-[18px] border border-line bg-white",
  row: "border-b border-line-soft px-[clamp(14px,2vw,22px)] py-3.5 last:border-0",
  meta: "text-[13.5px] text-muted",
  code: "font-mono text-[13.5px]",
};

const columns = "sm:grid-cols-[minmax(0,1.6fr)_130px_120px_150px]";
const sideAction =
  "flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[14px] font-semibold text-cloud-soft transition-colors duration-150 ease-out hover:bg-white/8 hover:text-white";

export function ConsolePortal() {
  const { portal, view, go, account, section, scrollRef } = usePortalView();

  if (view.name === "signedOut") return <SignedOut onBack={() => go({ name: "accounts" })} />;

  return (
    <div className="flex h-full flex-col bg-mist text-[15.5px] leading-[1.5] lg:flex-row">
      <aside className="hidden w-[244px] flex-none flex-col bg-ink px-3.5 py-5 text-cloud lg:flex">
        <div className="px-2.5">
          <Logo light className="h-10 w-auto" />
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[.13em] text-navy-label">Staff console</div>
        </div>
        <nav aria-label="Staff" className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go({ name: item.id })}
              aria-current={section === item.id ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[15px] font-semibold transition-colors duration-150 ease-out ${
                section === item.id ? "bg-white/12 text-white" : "text-cloud-soft hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 px-1 pt-4">
          <div className="flex items-center gap-3 px-1.5">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-coral/20 text-[13px] font-bold text-coral">
              {initials(ME.name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[14.5px] font-semibold text-white">{ME.name}</div>
              <div className="text-[12.5px] text-navy-label">{ME.role}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-0.5">
            <button type="button" onClick={() => go({ name: "password" })} className={sideAction}>
              <Icon name="lock" className="h-[18px] w-[18px]" />
              Change password
            </button>
            <button type="button" onClick={() => go({ name: "signedOut" })} className={sideAction}>
              <Icon name="out" className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <header className="flex items-center justify-between gap-3 bg-ink px-4 py-2.5 text-cloud lg:hidden">
        <Logo light className="h-8 w-auto" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Change password"
            onClick={() => go({ name: "password" })}
            className="grid h-10 w-10 place-items-center rounded-full text-cloud-soft hover:bg-white/10 hover:text-white"
          >
            <Icon name="lock" />
          </button>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => go({ name: "signedOut" })}
            className="grid h-10 w-10 place-items-center rounded-full text-cloud-soft hover:bg-white/10 hover:text-white"
          >
            <Icon name="out" />
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          key={view.name === "account" ? view.accountNumber : view.name}
          className="portal-rise mx-auto max-w-[1060px] px-[clamp(16px,3vw,36px)] pb-10 pt-[clamp(20px,3vw,36px)] lg:pb-28"
        >
          {view.name === "accounts" ? (
            <Overview portal={portal} go={go} />
          ) : account ? (
            <AccountScreen account={account} portal={portal} go={go} />
          ) : (
            <SecondaryScreen view={view} skin={skin} portal={portal} go={go} />
          )}
        </div>
      </main>

      <nav aria-label="Staff" className="grid grid-cols-4 border-t border-line bg-white lg:hidden">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go({ name: item.id })}
            aria-current={section === item.id ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[11.5px] font-semibold ${
              section === item.id ? "text-brand" : "text-muted"
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Stat({ label, value, note, dark = false }: { label: string; value: string; note: string; dark?: boolean }) {
  return (
    <div className={`rounded-[16px] p-4 ${dark ? "bg-ink text-cloud" : "border border-line bg-white"}`}>
      <dt className={`text-[13px] font-semibold ${dark ? "text-cloud-soft" : "text-muted"}`}>{label}</dt>
      <dd className="m-0 mt-1.5 font-display text-[clamp(22px,2.6vw,30px)] font-extrabold leading-none tracking-[-.03em] tabular-nums">
        {value}
      </dd>
      <dd className={`m-0 mt-2 text-[12.5px] ${dark ? "text-navy-label" : "text-muted"}`}>{note}</dd>
    </div>
  );
}

function Overview({ portal, go }: { portal: Portal; go: Go }) {
  const [query, setQuery] = useState("");
  const { stats } = portal;
  const shown = portal.accounts.filter((account) => matches(account, query));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 font-mono text-[12px] uppercase tracking-[.1em] text-muted">{TODAY_LABEL}</div>
          <h1 className={skin.title}>Patient accounts</h1>
        </div>
        <button type="button" onClick={() => go({ name: "new" })} className={`${skin.primary} inline-flex items-center gap-2`}>
          <Icon name="plus" className="h-[18px] w-[18px]" />
          New patient
        </button>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat dark label="Outstanding" value={dollars(stats.outstandingCents)} note={`Across ${stats.owing} of ${stats.total} accounts`} />
        <Stat label="Paid online this week" value={dollars(stats.paidThisWeekCents)} note="Since Monday, Nov 9" />
        <Stat label="Charges posted today" value={String(stats.chargesToday)} note="Voided charges aren't counted" />
        <Stat label="Patients on file" value={String(stats.total)} note={`${stats.total - stats.owing} paid up`} />
      </dl>

      <label className="relative mb-4 block">
        <span className="sr-only">Search by name or account number</span>
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or account number"
          className="w-full rounded-[12px] border-[1.5px] border-field bg-white py-3 pl-10 pr-3.5 text-[16px]"
        />
      </label>

      {shown.length === 0 ? (
        <p className={`${skin.card} text-muted`}>No account matches “{query.trim()}”.</p>
      ) : (
        <div className={skin.list}>
          <div
            aria-hidden="true"
            className={`hidden gap-4 border-b border-line px-[clamp(14px,2vw,22px)] py-2.5 font-mono text-[11.5px] uppercase tracking-[.08em] text-muted sm:grid ${columns}`}
          >
            <span>Patient</span>
            <span>Account</span>
            <span>Date of birth</span>
            <span className="text-right">Balance</span>
          </div>
          <ul>
            {shown.map((account) => {
              const balance = balanceOf(account);
              return (
                <li key={account.accountNumber} className="border-b border-line-soft last:border-0">
                  <button
                    type="button"
                    onClick={() => go({ name: "account", accountNumber: account.accountNumber })}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-[clamp(14px,2vw,22px)] py-3 text-left transition-colors duration-150 ease-out hover:bg-mist ${columns}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-panel text-[12.5px] font-bold">
                        {initials(account.patientName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{account.patientName}</span>
                        <span className="block text-[13px] text-muted sm:hidden">
                          <span className="font-mono">{account.accountNumber}</span> · {fullDate(account.dateOfBirth)}
                        </span>
                      </span>
                    </span>
                    <span className="hidden font-mono text-[13.5px] sm:block">{account.accountNumber}</span>
                    <span className="hidden sm:block">{fullDate(account.dateOfBirth)}</span>
                    <span className="flex items-center justify-end gap-2.5">
                      {balance > 0 ? (
                        <>
                          <span className="max-sm:hidden">
                            <Chip tone="due">Due</Chip>
                          </span>
                          <span className="font-semibold tabular-nums">{dollars(balance)}</span>
                        </>
                      ) : (
                        <Chip tone="ok">Paid up</Chip>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

function AccountScreen({ account, portal, go }: { account: Account; portal: Portal; go: Go }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <button type="button" onClick={() => go({ name: "accounts" })} className={`${skin.quiet} inline-flex items-center gap-1`}>
          <Icon name="back" className="h-4 w-4" />
          All accounts
        </button>
        <button type="button" onClick={() => go({ name: "activity", accountNumber: account.accountNumber })} className={skin.quiet}>
          Activity on this account
        </button>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <section className={skin.card}>
          <div className="flex items-center gap-4">
            <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-full bg-panel text-[17px] font-bold">
              {initials(account.patientName)}
            </span>
            <div className="min-w-0">
              <h1 className={skin.title}>{account.patientName}</h1>
              <div className="mt-1 font-mono text-[13.5px] text-muted">{account.accountNumber}</div>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 text-[15px]">
            <dt className="text-muted">Date of birth</dt>
            <dd className="m-0">{fullDate(account.dateOfBirth)}</dd>
            <dt className="text-muted">Phone</dt>
            <dd className="m-0">{account.phone ?? "Not on file"}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="m-0 break-all">{account.email ?? "Not on file"}</dd>
          </dl>
        </section>
        <section className="rounded-[18px] bg-ink p-[clamp(18px,2.4vw,26px)] text-cloud">
          <div className="text-[13.5px] font-semibold text-cloud-soft">Balance due</div>
          <div className="mt-1.5 font-display text-[clamp(34px,4.4vw,46px)] font-extrabold leading-none tracking-[-.03em] tabular-nums">
            {dollars(balanceOf(account))}
          </div>
          <p className="mt-4 text-[13.5px] leading-[1.5] text-navy-label">
            The patient pays this on Pay my bill with the account number and date of birth.
          </p>
        </section>
      </div>

      <section className={`${skin.card} mb-6`}>
        <h2 className={`${skin.heading} mb-3.5`}>Post a charge</h2>
        <ChargeForm skin={skin} onPost={(description, cents) => portal.postCharge(account.accountNumber, description, cents)} />
      </section>

      <h2 className={`${skin.heading} mb-3`}>Charges</h2>
      <ChargeList skin={skin} account={account} portal={portal} />

      <h2 className={`${skin.heading} mb-3 mt-6`}>Payments</h2>
      <PaymentList skin={skin} account={account} />
    </>
  );
}
