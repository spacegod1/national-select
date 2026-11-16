"use client";

import { useState } from "react";
import {
  balanceOf,
  ChargeChip,
  ChargeForm,
  Chip,
  clock,
  daysAgo,
  dollars,
  fullDate,
  Icon,
  initials,
  lastActivity,
  Logo,
  matches,
  ME,
  NAV,
  owingSince,
  SecondaryScreen,
  shortDate,
  SignedOut,
  stamp,
  TODAY,
  TODAY_LABEL,
  usePortalView,
  type Account,
  type Go,
  type Portal,
  type Skin,
} from "../shared";

/**
 * Desk: built around the question the front desk is asked all day, "who are
 * you helping?". Home is a large search, the balances that need a follow-up
 * as cards, and what happened today. An account reads as one history.
 */

const lift = "shadow-[0_1px_0_rgba(27,42,74,.05),0_10px_30px_-16px_rgba(27,42,74,.28)]";

const skin: Skin = {
  title: "font-display text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.02] tracking-[-.035em]",
  lead: "mt-3 max-w-[620px] text-[16.5px] leading-[1.55] text-muted",
  card: `rounded-[24px] bg-white p-[clamp(20px,2.6vw,30px)] ${lift}`,
  heading: "font-display text-[21px] font-bold tracking-[-.02em]",
  label: "flex flex-col gap-1.5 text-[14px] font-semibold",
  input: "w-full rounded-[14px] border-[1.5px] border-line bg-mist px-4 py-3 text-[16px] font-normal",
  primary: "portal-press rounded-full bg-brand px-5 py-3 text-[15.5px] font-semibold text-white hover:bg-brand-press",
  quiet: "text-[14.5px] font-semibold text-brand hover:text-brand-dark relative after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-['']",
  list: `overflow-hidden rounded-[24px] bg-white ${lift}`,
  row: "border-b border-line-soft px-[clamp(16px,2.4vw,26px)] py-4 last:border-0",
  meta: "text-[14px] text-muted",
  code: "font-mono text-[14px]",
};

const gutter = "px-[clamp(16px,4vw,40px)]";
const avatar = "grid h-10 w-10 flex-none place-items-center rounded-full bg-panel text-[13px] font-bold";
const whitePill =
  "portal-press inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[15px] font-semibold hover:bg-cloud";

export function DeskPortal() {
  const { portal, view, go, account, section, scrollRef } = usePortalView();
  const [menu, setMenu] = useState<"none" | "nav" | "me">("none");

  if (view.name === "signedOut") return <SignedOut onBack={() => go({ name: "accounts" })} />;

  const leave: Go = (target) => {
    setMenu("none");
    go(target);
  };

  return (
    <div className="flex h-full flex-col bg-mist text-[16px] leading-[1.5]">
      <header className={`relative z-10 flex items-center justify-between gap-4 bg-white py-2.5 shadow-[0_1px_0_var(--color-line)] ${gutter}`}>
        <button type="button" onClick={() => leave({ name: "accounts" })} aria-label="Front desk home" className="rounded-[8px]">
          <Logo />
        </button>
        <nav aria-label="Staff" className="hidden items-center gap-1 rounded-full bg-mist p-1 md:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => leave({ name: item.id })}
              aria-current={section === item.id ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[14.5px] font-semibold transition-colors duration-150 ease-out ${
                section === item.id ? "bg-white shadow-[0_1px_3px_rgba(27,42,74,.16)]" : "text-muted hover:text-ink"
              }`}
            >
              {item.id === "accounts" ? "Front desk" : item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              aria-expanded={menu === "me"}
              aria-label={`Account menu for ${ME.name}`}
              onClick={() => setMenu(menu === "me" ? "none" : "me")}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 hover:bg-mist md:pr-3.5"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-[12.5px] font-bold text-white">
                {initials(ME.name)}
              </span>
              <span className="text-[14.5px] font-semibold max-md:hidden">{ME.first}</span>
            </button>
            {menu === "me" ? (
              <div className={`portal-fade absolute right-0 top-[calc(100%+8px)] w-[240px] rounded-[18px] bg-white p-2 ${lift} ring-1 ring-line`}>
                <div className="px-3 pb-2 pt-1.5">
                  <div className="text-[14.5px] font-semibold">{ME.name}</div>
                  <div className="text-[13px] text-muted">{ME.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => leave({ name: "password" })}
                  className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[14.5px] font-semibold hover:bg-mist"
                >
                  <Icon name="lock" className="h-[18px] w-[18px] text-muted" />
                  Change password
                </button>
                <button
                  type="button"
                  onClick={() => leave({ name: "signedOut" })}
                  className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[14.5px] font-semibold hover:bg-mist"
                >
                  <Icon name="out" className="h-[18px] w-[18px] text-muted" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={menu === "nav" ? "Close menu" : "Open menu"}
            aria-expanded={menu === "nav"}
            onClick={() => setMenu(menu === "nav" ? "none" : "nav")}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-mist md:hidden"
          >
            <Icon name={menu === "nav" ? "close" : "menu"} />
          </button>
        </div>
      </header>

      {menu === "nav" ? (
        <nav aria-label="Staff" className={`portal-fade flex flex-col border-b border-line bg-white py-2 md:hidden ${gutter}`}>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => leave({ name: item.id })}
              aria-current={section === item.id ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[12px] px-2 py-3 text-left text-[16px] font-semibold ${
                section === item.id ? "text-brand" : ""
              }`}
            >
              <Icon name={item.icon} />
              {item.id === "accounts" ? "Front desk" : item.label}
            </button>
          ))}
        </nav>
      ) : null}

      <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div key={view.name === "account" ? view.accountNumber : view.name} className="portal-rise">
          {view.name === "accounts" ? (
            <Home portal={portal} go={go} />
          ) : account ? (
            <AccountScreen account={account} portal={portal} go={go} />
          ) : (
            <div className={`mx-auto max-w-[980px] pb-10 pt-[clamp(24px,3.4vw,44px)] lg:pb-28 ${gutter}`}>
              <SecondaryScreen view={view} skin={skin} portal={portal} go={go} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function owingNote(account: Account): string {
  const since = owingSince(account);
  const days = since ? daysAgo(since) : 0;
  if (days === 0) return "Posted today";
  return days === 1 ? "Owing since yesterday" : `Owing for ${days} days`;
}

function Home({ portal, go }: { portal: Portal; go: Go }) {
  const [query, setQuery] = useState("");
  const withBalance = portal.accounts.map((account) => ({ account, balance: balanceOf(account) }));
  const owing = withBalance.filter((item) => item.balance > 0).sort((a, b) => b.balance - a.balance);
  const settled = withBalance.filter((item) => item.balance === 0);
  const results = query.trim() ? withBalance.filter((item) => matches(item.account, query)) : null;
  const today = portal.log.filter((entry) => entry.at.slice(0, 10) === TODAY).slice(0, 7);
  const nameOf = (accountNumber: string) =>
    portal.accounts.find((item) => item.accountNumber === accountNumber)?.patientName ?? accountNumber;

  return (
    <>
      <section className={`bg-panel pb-[clamp(28px,4vw,48px)] pt-[clamp(28px,4vw,52px)] ${gutter}`}>
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-3 font-mono text-[12.5px] uppercase tracking-[.1em] text-brand-dark">
            Front desk · {TODAY_LABEL}
          </div>
          <h1 className={skin.title}>Who are you helping, {ME.first}?</h1>
          <label className="relative mt-6 block max-w-[720px]">
            <span className="sr-only">Search by name or account number</span>
            <Icon name="search" className="pointer-events-none absolute left-5 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or account number"
              className={`w-full rounded-[20px] border-2 border-transparent bg-white py-[17px] pl-[54px] pr-5 text-[clamp(17px,2vw,20px)] focus:border-ink focus-visible:outline-none ${lift}`}
            />
          </label>

          {results ? (
            <ul className={`portal-fade mt-3 max-w-[720px] overflow-hidden rounded-[20px] bg-white ${lift}`}>
              {results.length === 0 ? (
                <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4 text-muted">
                  No account matches “{query.trim()}”.
                  <button type="button" onClick={() => go({ name: "new" })} className={skin.quiet}>
                    Add a new patient
                  </button>
                </li>
              ) : (
                results.map(({ account, balance }) => (
                  <li key={account.accountNumber} className="border-b border-line-soft last:border-0">
                    <button
                      type="button"
                      onClick={() => go({ name: "account", accountNumber: account.accountNumber })}
                      className="flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-mist"
                    >
                      <span className={avatar}>{initials(account.patientName)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{account.patientName}</span>
                        <span className="block font-mono text-[13px] text-muted">{account.accountNumber}</span>
                      </span>
                      {balance > 0 ? (
                        <span className="font-semibold tabular-nums">{dollars(balance)}</span>
                      ) : (
                        <Chip tone="ok">Paid up</Chip>
                      )}
                      <Icon name="forward" className="h-4 w-4 text-muted" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => go({ name: "new" })} className={`${skin.primary} inline-flex items-center gap-2`}>
                <Icon name="plus" className="h-[18px] w-[18px]" />
                New patient
              </button>
              <button type="button" onClick={() => go({ name: "activity" })} className={whitePill}>
                <Icon name="activity" className="h-[18px] w-[18px] text-muted" />
                Activity
              </button>
              <button type="button" onClick={() => go({ name: "users" })} className={whitePill}>
                <Icon name="users" className="h-[18px] w-[18px] text-muted" />
                Staff users
              </button>
            </div>
          )}
        </div>
      </section>

      <div className={`mx-auto grid max-w-[1080px] gap-x-10 gap-y-9 pb-10 pt-[clamp(24px,3.4vw,40px)] lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-28 ${gutter}`}>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className={skin.heading}>Balances to follow up</h2>
            <span className={skin.meta}>
              {dollars(portal.stats.outstandingCents)} across {owing.length} patients
            </span>
          </div>
          {owing.length === 0 ? (
            <p className={`${skin.card} text-muted`}>Nobody owes anything right now.</p>
          ) : (
            <ul className="grid gap-3.5 sm:grid-cols-2">
              {owing.map(({ account, balance }) => {
                const since = owingSince(account);
                return (
                  <li key={account.accountNumber}>
                    <button
                      type="button"
                      onClick={() => go({ name: "account", accountNumber: account.accountNumber })}
                      className={`flex h-full w-full flex-col rounded-[22px] bg-white p-5 text-left transition-transform duration-150 ease-out hover:-translate-y-0.5 ${lift}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={avatar}>{initials(account.patientName)}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{account.patientName}</span>
                          <span className="block font-mono text-[13px] text-muted">{account.accountNumber}</span>
                        </span>
                      </span>
                      <span className="mt-5 font-display text-[30px] font-extrabold leading-none tracking-[-.03em] tabular-nums">
                        {dollars(balance)}
                      </span>
                      <span className="mt-2.5 flex items-center justify-between gap-2">
                        <span className={skin.meta}>{owingNote(account)}</span>
                        {since && daysAgo(since) >= 14 ? <Chip tone="due">Overdue</Chip> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <h2 className={`${skin.heading} mb-4 mt-9`}>Paid up</h2>
          <ul className={skin.list}>
            {settled.map(({ account }) => {
              const last = lastActivity(account);
              return (
                <li key={account.accountNumber} className="border-b border-line-soft last:border-0">
                  <button
                    type="button"
                    onClick={() => go({ name: "account", accountNumber: account.accountNumber })}
                    className="flex w-full items-center gap-3.5 px-[clamp(14px,2vw,22px)] py-3 text-left transition-colors duration-150 ease-out hover:bg-mist"
                  >
                    <span className={avatar}>{initials(account.patientName)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{account.patientName}</span>
                      <span className="block font-mono text-[13px] text-muted">{account.accountNumber}</span>
                    </span>
                    <span className={`${skin.meta} max-sm:hidden`}>{last ? `Last activity ${shortDate(last)}` : "No charges yet"}</span>
                    <Icon name="forward" className="h-4 w-4 text-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside>
          <h2 className={`${skin.heading} mb-5`}>Today</h2>
          <ol className="flex flex-col gap-5 border-l-2 border-line pl-5">
            {today.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[27px] top-[5px] h-3 w-3 rounded-full bg-brand ring-4 ring-mist" aria-hidden="true" />
                <div className="font-mono text-[12.5px] text-muted">{clock(entry.at)}</div>
                <div className="text-[15px] leading-[1.45]">
                  <span className="font-semibold">{entry.who.split(" ")[0]}</span> · {entry.what}
                </div>
                {entry.accountNumber ? (
                  <button
                    type="button"
                    onClick={() => go({ name: "account", accountNumber: entry.accountNumber as string })}
                    className={`${skin.quiet} text-left`}
                  >
                    {nameOf(entry.accountNumber)}
                  </button>
                ) : null}
                {entry.detail ? <div className={`${skin.meta} break-words`}>{entry.detail}</div> : null}
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => go({ name: "activity" })} className={`${skin.quiet} mt-6`}>
            All activity
          </button>
        </aside>
      </div>
    </>
  );
}

const bubble = "grid h-10 w-10 flex-none place-items-center rounded-full";
const BUBBLE_TONE = { unpaid: "bg-pink text-pink-ink", paid: "bg-panel text-ink", void: "bg-line-soft text-muted" } as const;

function AccountScreen({ account, portal, go }: { account: Account; portal: Portal; go: Go }) {
  const history = [
    ...account.charges.map((charge) => ({ at: charge.at, charge, payment: null })),
    ...account.payments.map((payment) => ({ at: payment.at, charge: null, payment })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const facts = [
    account.accountNumber,
    `Born ${fullDate(account.dateOfBirth)}`,
    account.phone ?? "No phone on file",
    account.email ?? "No email on file",
  ];

  return (
    <div className={`mx-auto max-w-[880px] pb-10 pt-[clamp(20px,3vw,36px)] lg:pb-28 ${gutter}`}>
      <button type="button" onClick={() => go({ name: "accounts" })} className={`${skin.quiet} mb-4 inline-flex items-center gap-1`}>
        <Icon name="back" className="h-4 w-4" />
        Front desk
      </button>

      <section className="rounded-[28px] bg-ink p-[clamp(22px,3.4vw,38px)] text-cloud">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="min-w-0">
            <div className="font-mono text-[12.5px] uppercase tracking-[.1em] text-coral">Patient account</div>
            <h1 className="mt-2 font-display text-[clamp(30px,4.4vw,48px)] font-extrabold leading-[1.02] tracking-[-.035em] text-white">
              {account.patientName}
            </h1>
            <ul className="mt-4 flex flex-wrap gap-2 text-[13.5px]">
              {facts.map((fact, index) => (
                <li key={fact} className={`max-w-full break-all rounded-full bg-white/10 px-3 py-1 ${index === 0 ? "font-mono" : ""}`}>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-cloud-soft">Balance due</div>
            <div className="mt-1 font-display text-[clamp(38px,5.4vw,60px)] font-extrabold leading-none tracking-[-.035em] tabular-nums text-white">
              {dollars(balanceOf(account))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${skin.card} mt-4`}>
        <h2 className={`${skin.heading} mb-4`}>Post a charge</h2>
        <ChargeForm skin={skin} onPost={(description, cents) => portal.postCharge(account.accountNumber, description, cents)} />
      </section>

      <div className="mb-4 mt-9 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className={skin.heading}>History</h2>
        <button type="button" onClick={() => go({ name: "activity", accountNumber: account.accountNumber })} className={skin.quiet}>
          Who opened this account
        </button>
      </div>
      {history.length === 0 ? (
        <p className={`${skin.card} text-muted`}>Nothing on this account yet. Post the first charge above.</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {history.map(({ at, charge, payment }) =>
            charge ? (
              <li key={charge.id} className={`flex items-center gap-4 rounded-[20px] bg-white px-[clamp(14px,2vw,22px)] py-3.5 ${lift}`}>
                <span className={`${bubble} ${BUBBLE_TONE[charge.status]}`}>
                  <Icon name="receipt" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{charge.description}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13.5px] text-muted">
                    {stamp(at)}
                    <ChargeChip status={charge.status} />
                  </span>
                </span>
                <span className="text-right">
                  <span className={`block tabular-nums ${charge.status === "void" ? "text-muted line-through" : "font-semibold"}`}>
                    {dollars(charge.amountCents)}
                  </span>
                  {charge.status === "unpaid" ? (
                    <button type="button" className={skin.quiet} onClick={() => portal.voidCharge(account.accountNumber, charge)}>
                      Void
                    </button>
                  ) : null}
                </span>
              </li>
            ) : payment ? (
              <li key={payment.id} className={`flex items-center gap-4 rounded-[20px] bg-white px-[clamp(14px,2vw,22px)] py-3.5 ${lift}`}>
                <span className={`${bubble} bg-open/15 text-[#22693a]`}>
                  <Icon name="card" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">Paid online</span>
                  <span className="block truncate text-[13.5px] text-muted">
                    {stamp(at)} · <span className="font-mono text-[12.5px]">{payment.reference}</span>
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-[#22693a]">−{dollars(payment.amountCents)}</span>
              </li>
            ) : null,
          )}
        </ol>
      )}
    </div>
  );
}
