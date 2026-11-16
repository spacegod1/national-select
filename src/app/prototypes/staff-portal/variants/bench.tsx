"use client";

import { useState, type ReactNode } from "react";
import {
  ART,
  Avatar,
  balanceOf,
  ChargeForm,
  ChargeList,
  daysAgo,
  dollars,
  fullDate,
  Icon,
  initials,
  matches,
  ME,
  NAV,
  owingSince,
  PaymentList,
  Photo,
  SecondaryScreen,
  SignedOut,
  stamp,
  TODAY_LABEL,
  usePortalView,
  type Account,
  type Go,
  type IconName,
  type Portal,
  type Skin,
} from "../shared";

/**
 * Bench: a workbench, laid out like a mail client, for tablets and larger
 * screens. The list of accounts stays on the left and the one you pick opens
 * beside it, so working through several patients never loses your place.
 * Phones get the Ledger design instead.
 */

const gutter = "px-[clamp(16px,2.4vw,28px)]";
const eyebrow = "font-mono text-[11.5px] uppercase tracking-[.12em]";

const skin: Skin = {
  title: "font-display text-[clamp(22px,2.6vw,28px)] font-extrabold leading-[1.1] tracking-[-.025em]",
  lead: "mt-1.5 max-w-[640px] text-[14.5px] leading-[1.5] text-muted",
  card: "rounded-[12px] border border-line bg-white p-[clamp(14px,2vw,20px)]",
  heading: "text-[15px] font-semibold",
  label: "flex flex-col gap-1 text-[12.5px] font-semibold text-muted",
  input: "w-full rounded-[8px] border border-field bg-white px-2.5 py-2 text-[14.5px] font-normal text-ink",
  primary: "portal-press rounded-[8px] bg-ink px-3.5 py-2 text-[14px] font-semibold text-white hover:bg-[#26375e]",
  quiet: "text-[13.5px] font-semibold text-brand hover:text-brand-dark relative after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-['']",
  list: "overflow-hidden rounded-[12px] border border-line bg-white",
  row: "border-b border-line-soft px-3.5 py-2.5 last:border-0",
  meta: "text-[12.5px] text-muted",
  code: "font-mono text-[12.5px]",
  // A navy band with the photo showing through on the right.
  head: ({ art, title, lead }) => (
    <div className="relative isolate overflow-hidden rounded-[16px] bg-ink text-white">
      <div className="absolute inset-y-0 right-0 -z-20 w-[64%]">
        <Photo src={art.src} position={art.position} sizes="600px" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#1b2a4a_36%,rgba(27,42,74,.8)_60%,rgba(27,42,74,.28)_100%)]"
      />
      <div className="px-[clamp(18px,2.6vw,28px)] py-[clamp(20px,2.8vw,30px)]">
        <div className={`${eyebrow} text-coral`}>{art.eyebrow}</div>
        <h1 className="mt-2 font-display text-[clamp(24px,2.8vw,32px)] font-extrabold leading-[1.08] tracking-[-.03em]">
          {title}
        </h1>
        <p className="mt-2 max-w-[430px] text-[14.5px] leading-[1.5] text-cloud">{lead}</p>
      </div>
    </div>
  ),
};

const railButton = "grid h-10 w-10 place-items-center rounded-[10px] text-white/65 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white";

export function BenchPortal() {
  const { portal, view, go, account, section, scrollRef } = usePortalView();

  if (view.name === "signedOut") return <SignedOut onBack={() => go({ name: "accounts" })} />;

  const inAccounts = view.name === "accounts" || view.name === "account";

  return (
    <div className="flex h-full bg-white text-[14.5px] leading-[1.45]">
      <aside className="flex w-[76px] flex-none flex-col items-center bg-ink py-3.5">
        <span
          className="grid h-10 w-10 place-items-center rounded-[11px] bg-brand font-display text-[15px] font-extrabold text-white"
          role="img"
          aria-label="National Select staff"
        >
          NS
        </span>
        <nav aria-label="Staff" className="mt-5 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go({ name: item.id })}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={`relative flex w-[62px] flex-col items-center gap-1 rounded-[10px] py-2 text-[10.5px] font-semibold transition-colors duration-150 ease-out ${
                  active ? "bg-white/[.13] text-white" : "text-white/65 hover:bg-white/[.07] hover:text-white"
                }`}
              >
                {active ? <span aria-hidden="true" className="absolute inset-y-2.5 -left-[7px] w-[3px] rounded-full bg-coral" /> : null}
                <Icon name={item.icon} />
                {item.id === "new" ? "New" : item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-1">
          <button type="button" aria-label="Change password" title="Change password" onClick={() => go({ name: "password" })} className={railButton}>
            <Icon name="lock" />
          </button>
          <button type="button" aria-label="Sign out" title="Sign out" onClick={() => go({ name: "signedOut" })} className={railButton}>
            <Icon name="out" />
          </button>
          <span
            title={`${ME.name}, ${ME.role}`}
            className="mt-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[12px] font-bold text-ink ring-[3px] ring-white/20"
          >
            {initials(ME.name)}
          </span>
        </div>
      </aside>

      {inAccounts ? (
        <div className="flex min-h-0 min-w-0 flex-1">
          <section aria-label="Patient accounts" className="flex min-h-0 w-[300px] flex-none flex-col border-r border-line lg:w-[340px]">
            <AccountList portal={portal} go={go} selected={account?.accountNumber ?? null} />
          </section>
          <main ref={scrollRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-mist">
            {account ? (
              <Detail key={account.accountNumber} account={account} portal={portal} />
            ) : (
              <Welcome portal={portal} go={go} />
            )}
          </main>
        </div>
      ) : (
        <main ref={scrollRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-mist">
          <div key={view.name} className={`portal-rise mx-auto max-w-[940px] pb-10 pt-[clamp(16px,2.4vw,28px)] lg:pb-28 ${gutter}`}>
            <SecondaryScreen view={view} skin={skin} portal={portal} go={go} />
          </div>
        </main>
      )}
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "owing", label: "Balance due" },
  { id: "settled", label: "Paid up" },
] as const;

function AccountList({ portal, go, selected }: { portal: Portal; go: Go; selected: string | null }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const { stats } = portal;
  const settled = stats.total - stats.owing;
  const rows = portal.accounts
    .map((account) => ({ account, balance: balanceOf(account) }))
    .filter(
      ({ account, balance }) =>
        matches(account, query) && (filter === "all" || (filter === "owing" ? balance > 0 : balance === 0)),
    );

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-3.5 pb-2.5 pt-3.5">
        <h1 className="font-display text-[20px] font-extrabold tracking-[-.02em]">
          Accounts <span className="font-sans text-[13px] font-normal tracking-normal text-muted">{rows.length}</span>
        </h1>
        <button
          type="button"
          onClick={() => go({ name: "new" })}
          className="portal-press inline-flex items-center gap-1.5 rounded-[8px] bg-brand px-2.5 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-press"
        >
          <Icon name="plus" className="h-4 w-4" />
          New patient
        </button>
      </div>

      <div className="mx-3.5 mb-3 rounded-[10px] bg-mist px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11.5px] font-semibold uppercase tracking-[.07em] text-muted">Outstanding</span>
          <span className="font-display text-[17px] font-extrabold tracking-[-.02em] tabular-nums">
            {dollars(stats.outstandingCents)}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-pink-line" aria-hidden="true">
          <div className="h-full rounded-full bg-open" style={{ width: `${stats.total ? (settled / stats.total) * 100 : 0}%` }} />
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          {settled} of {stats.total} accounts paid up
        </div>
      </div>

      <div className="px-3.5">
        <label className="relative block">
          <span className="sr-only">Search by name or account number</span>
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or account number"
            className="w-full rounded-[8px] border border-line bg-white py-2 pl-8 pr-2.5 text-[14px] focus:border-field"
          />
        </label>
        <div role="group" aria-label="Filter accounts" className="mt-2.5 grid grid-cols-3 rounded-[8px] bg-mist p-0.5 text-[12.5px] font-semibold">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-[6px] py-1.5 ${filter === item.id ? "bg-white shadow-[0_0_0_1px_var(--color-line)]" : "text-muted hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-2.5 min-h-0 flex-1 overflow-y-auto border-t border-line-soft">
        {rows.length === 0 ? (
          <li className="px-3.5 py-6 text-muted">No account matches.</li>
        ) : (
          rows.map(({ account, balance }) => {
            const active = selected === account.accountNumber;
            return (
              <li key={account.accountNumber} className="border-b border-line-soft">
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => go({ name: "account", accountNumber: account.accountNumber })}
                  className={`relative flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 ease-out ${
                    active ? "bg-mist" : "hover:bg-mist/60"
                  }`}
                >
                  {active ? <span className="absolute inset-y-0 left-0 w-[3px] bg-brand" aria-hidden="true" /> : null}
                  <Avatar name={account.patientName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{account.patientName}</span>
                    <span className="block font-mono text-[12px] text-muted">{account.accountNumber}</span>
                  </span>
                  {balance > 0 ? (
                    <span className="font-semibold tabular-nums">{dollars(balance)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#22693a]">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      Paid up
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </>
  );
}

function Stat({ icon, tint, label, value, note }: { icon: IconName; tint: string; label: string; value: ReactNode; note: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3.5 shadow-[0_14px_28px_-22px_rgba(27,42,74,.55)]">
      <span className={`grid h-10 w-10 flex-none place-items-center rounded-[11px] ${tint}`}>
        <Icon name={icon} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-muted">{label}</span>
        <span className="block font-display text-[21px] font-extrabold leading-[1.15] tracking-[-.02em] tabular-nums">{value}</span>
        <span className="block text-[12px] text-muted">{note}</span>
      </span>
    </div>
  );
}

/** What the right-hand pane shows until a patient is picked. */
function Welcome({ portal, go }: { portal: Portal; go: Go }) {
  const { stats } = portal;
  const followUp = portal.accounts
    .flatMap((account) => {
      const since = owingSince(account);
      return since ? [{ account, since, balance: balanceOf(account) }] : [];
    })
    .sort((a, b) => a.since.localeCompare(b.since))
    .slice(0, 4);
  const latest = portal.log.slice(0, 5);
  const nameOf = (accountNumber: string) =>
    portal.accounts.find((item) => item.accountNumber === accountNumber)?.patientName ?? accountNumber;
  const heading = "font-display text-[17px] font-extrabold tracking-[-.02em]";

  return (
    <div className="portal-rise @container pb-10 lg:pb-28">
      <div className="relative isolate overflow-hidden bg-ink text-white">
        <Photo
          src={ART.home.src}
          sizes="(min-width: 1024px) 75vw, 60vw"
          className="-z-20 object-[50%_72%] @2xl:object-[50%_55%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(27,42,74,.97)_0%,rgba(27,42,74,.86)_42%,rgba(27,42,74,.38)_100%)]"
        />
        <div className={`pb-[72px] pt-9 @2xl:pt-12 ${gutter}`}>
          <div className={`${eyebrow} text-coral`}>{TODAY_LABEL}</div>
          <h2 className="mt-2 font-display text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.05] tracking-[-.035em]">
            Welcome back, {ME.first}.
          </h2>
          <p className="mt-2 max-w-[400px] text-[15px] leading-[1.5] text-cloud">
            Pick a patient on the left to post a charge or check a balance.
          </p>
        </div>
      </div>

      <div className={`relative -mt-11 grid gap-3 @2xl:grid-cols-3 ${gutter}`}>
        <Stat
          icon="receipt"
          tint="bg-pink text-brand-dark"
          label="Outstanding"
          value={dollars(stats.outstandingCents)}
          note={`Across ${stats.owing} of ${stats.total} accounts`}
        />
        <Stat
          icon="card"
          tint="bg-[#e2f1e7] text-[#22693a]"
          label="Paid online this week"
          value={dollars(stats.paidThisWeekCents)}
          note="Since Monday, Nov 9"
        />
        <Stat
          icon="activity"
          tint="bg-panel text-ink"
          label="Charges posted today"
          value={stats.chargesToday}
          note="Voided charges aren't counted"
        />
      </div>

      <div className={`mt-7 grid gap-x-8 gap-y-7 @3xl:grid-cols-2 ${gutter}`}>
        <section>
          <h3 className={heading}>Owing the longest</h3>
          {followUp.length === 0 ? (
            <p className="mt-2 text-muted">Every account is paid up.</p>
          ) : (
            <ul className={`${skin.list} mt-2.5`}>
              {followUp.map(({ account, since, balance }) => {
                const days = daysAgo(since);
                return (
                  <li key={account.accountNumber} className="border-b border-line-soft last:border-0">
                    <button
                      type="button"
                      onClick={() => go({ name: "account", accountNumber: account.accountNumber })}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-mist/60"
                    >
                      <Avatar name={account.patientName} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{account.patientName}</span>
                        <span className={`block text-[12.5px] ${days >= 14 ? "font-semibold text-brand-dark" : "text-muted"}`}>
                          {days === 0 ? "Posted today" : days === 1 ? "Since yesterday" : `Owing for ${days} days`}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">{dollars(balance)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={heading}>Latest activity</h3>
            <button type="button" onClick={() => go({ name: "activity" })} className={skin.quiet}>
              See all
            </button>
          </div>
          <ul className="mt-2.5">
            {latest.map((entry) => (
              <li key={entry.id} className="group relative flex gap-3 pb-3.5 last:pb-0">
                <span aria-hidden="true" className="absolute bottom-0 left-[3.5px] top-[14px] w-px bg-line group-last:hidden" />
                <span aria-hidden="true" className="relative mt-[6px] h-2 w-2 flex-none rounded-full bg-coral ring-[3px] ring-mist" />
                <span className="min-w-0">
                  <span className="block">
                    <span className="font-semibold">{entry.who.split(" ")[0]}</span> <span className="text-muted">·</span> {entry.what}
                  </span>
                  <span className="block text-[12.5px] text-muted">
                    {stamp(entry.at)}
                    {entry.accountNumber ? ` · ${nameOf(entry.accountNumber)}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Detail({ account, portal }: { account: Account; portal: Portal }) {
  const [tab, setTab] = useState<"charges" | "payments" | "activity">("charges");
  const balance = balanceOf(account);
  const entries = portal.log.filter((entry) => entry.accountNumber === account.accountNumber);
  const tabs = [
    { id: "charges", label: "Charges", count: account.charges.length },
    { id: "payments", label: "Payments", count: account.payments.length },
    { id: "activity", label: "Activity", count: entries.length },
  ] as const;
  const fact = "inline-flex items-center gap-1.5";

  return (
    <div className="portal-slide">
      <div className={`sticky top-0 z-10 isolate overflow-hidden border-b border-line bg-white py-4 ${gutter}`}>
        <span aria-hidden="true" className="portal-pluses pointer-events-none absolute inset-y-0 right-0 -z-10 w-[60%]" />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar name={account.patientName} className="h-12 w-12 text-[16px]" />
            <div className="min-w-0">
              <h1 className={skin.title}>{account.patientName}</h1>
              <div className="mt-1 flex flex-wrap gap-x-3.5 gap-y-0.5 text-[13px] text-muted">
                <span className="font-mono">{account.accountNumber}</span>
                <span className={fact}>
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  Born {fullDate(account.dateOfBirth)}
                </span>
                <span className={fact}>
                  <Icon name="phone" className="h-3.5 w-3.5" />
                  {account.phone ?? "No phone on file"}
                </span>
                <span className={`${fact} break-all`}>
                  <Icon name="mail" className="h-3.5 w-3.5" />
                  {account.email ?? "No email on file"}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`rounded-[12px] border px-3.5 py-2 ${
              balance > 0 ? "border-pink-line bg-pink text-pink-ink" : "border-[#cfe6d7] bg-[#e2f1e7] text-[#22693a]"
            }`}
          >
            <div className="text-[11.5px] font-semibold uppercase tracking-[.07em]">{balance > 0 ? "Balance due" : "Paid up"}</div>
            <div className="mt-0.5 font-display text-[26px] font-extrabold leading-none tracking-[-.03em] tabular-nums">
              {dollars(balance)}
            </div>
          </div>
        </div>
      </div>

      <div className={`pb-10 pt-4 lg:pb-28 ${gutter}`}>
        <div className="rounded-[12px] border border-line bg-white p-3.5">
          <h2 className="mb-3 flex items-center gap-2.5 text-[15px] font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-pink text-brand-dark">
              <Icon name="receipt" className="h-[18px] w-[18px]" />
            </span>
            Post a charge
          </h2>
          <ChargeForm
            skin={skin}
            onPost={(description, cents) => {
              portal.postCharge(account.accountNumber, description, cents);
              setTab("charges");
            }}
          />
        </div>

        <div role="tablist" aria-label="Account records" className="mt-5 flex gap-5 border-b border-line">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 pb-2 text-[14px] font-semibold ${
                tab === item.id ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {item.label}
              <span className={`rounded-full px-1.5 text-[12px] ${tab === item.id ? "bg-ink text-white" : "bg-line-soft text-muted"}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-3.5">
          {tab === "charges" ? (
            <ChargeList skin={skin} account={account} portal={portal} />
          ) : tab === "payments" ? (
            <PaymentList skin={skin} account={account} />
          ) : (
            <ul className={skin.list}>
              {entries.map((entry) => (
                <li key={entry.id} className={`${skin.row} flex flex-wrap items-baseline gap-x-3 gap-y-0.5`}>
                  <span className={`${skin.meta} w-[124px] tabular-nums`}>{stamp(entry.at)}</span>
                  <span className="min-w-0 flex-1 basis-[200px]">
                    <span className="font-semibold">{entry.who}</span> <span className="text-muted">·</span> {entry.what}
                    {entry.detail ? <span className={`${skin.meta} block break-words`}>{entry.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
