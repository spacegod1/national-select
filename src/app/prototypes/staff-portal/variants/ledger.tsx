"use client";

import { useState } from "react";
import {
  ART,
  Avatar,
  balanceOf,
  ChargeForm,
  dollars,
  fullDate,
  Icon,
  Logo,
  matches,
  NAV,
  Photo,
  SecondaryScreen,
  shortDate,
  SignedOut,
  TODAY_LABEL,
  usePortalView,
  type Account,
  type ChargeStatus,
  type Go,
  type Portal,
  type Skin,
} from "../shared";

/**
 * Ledger: the portal as a set of books, for phones. Rules and type rather than
 * boxes. The headline is the number that matters, and a patient's account
 * opens in place under their line, so the list never leaves the screen.
 * Tablets and larger screens get the Bench design instead.
 */

const gutter = "px-[clamp(16px,4vw,40px)]";
/** Lets a band of colour run to both edges of the screen from inside the gutter. */
const bleed = "-mx-[clamp(16px,4vw,40px)]";
const label = "font-mono text-[11.5px] uppercase tracking-[.08em] text-muted";
const topLink = "text-[13.5px] font-semibold text-muted hover:text-ink relative after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']";

const skin: Skin = {
  title: "font-display text-[clamp(28px,4vw,42px)] font-extrabold leading-[1.04] tracking-[-.035em]",
  lead: "mt-3 max-w-[600px] text-[16px] leading-[1.55] text-muted",
  card: "border-y border-line py-5",
  heading: "font-mono text-[12px] font-medium uppercase tracking-[.1em] text-muted",
  label: "flex flex-col gap-1 font-mono text-[11.5px] uppercase tracking-[.08em] text-muted",
  input:
    "w-full rounded-none border-0 border-b-[1.5px] border-field bg-transparent px-0 py-2 font-sans text-[16px] normal-case tracking-normal text-ink focus:border-ink focus-visible:outline-none",
  primary:
    "portal-press rounded-full border-[1.5px] border-ink bg-ink px-4 py-2 text-[14.5px] font-semibold text-white hover:bg-white hover:text-ink",
  quiet: "text-[14px] font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4 hover:text-brand-dark relative after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-['']",
  list: "border-t border-ink",
  row: "border-b border-line py-3.5",
  meta: "text-[13.5px] text-muted",
  code: "font-mono text-[13.5px]",
  // The photo runs edge to edge under the tabs, darkened so the title reads on it.
  head: ({ art, title, lead }) => (
    <div className={`relative isolate overflow-hidden bg-ink text-white ${bleed}`}>
      <Photo src={art.src} position={art.position} sizes="100vw" className="-z-20" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(27,42,74,.5)_0%,rgba(27,42,74,.9)_62%,rgba(27,42,74,.96)_100%)]"
      />
      <div className={`pb-5 pt-16 ${gutter}`}>
        <div className="font-mono text-[11.5px] uppercase tracking-[.12em] text-coral">{art.eyebrow}</div>
        <h1 className="mt-2 font-display text-[30px] font-extrabold leading-[1.04] tracking-[-.035em]">{title}</h1>
        <p className="mt-2 text-[15px] leading-[1.5] text-cloud">{lead}</p>
      </div>
    </div>
  ),
};

export function LedgerPortal() {
  const { portal, view, go, section, scrollRef } = usePortalView({ inline: true });

  if (view.name === "signedOut") return <SignedOut onBack={() => go({ name: "accounts" })} />;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-white text-[16px] leading-[1.5]">
      <div className={`mx-auto max-w-[1000px] pb-12 ${gutter}`}>
        <header className="flex items-center justify-between gap-4 py-3.5">
          <Logo />
          <div className="flex items-center gap-x-4">
            <button type="button" onClick={() => go({ name: "password" })} className={topLink}>
              Password
            </button>
            <button type="button" onClick={() => go({ name: "signedOut" })} className={topLink}>
              Sign out
            </button>
          </div>
        </header>

        <nav aria-label="Staff" className={`sticky top-0 z-10 flex gap-x-6 overflow-x-auto border-y border-ink bg-white ${bleed} ${gutter}`}>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go({ name: item.id })}
              aria-current={section === item.id ? "page" : undefined}
              className={`whitespace-nowrap border-b-[3px] pb-2.5 pt-3 text-[15px] font-semibold ${
                section === item.id ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div key={section ?? view.name} className="portal-rise">
          {section === "accounts" ? (
            <Book portal={portal} go={go} expanded={view.name === "account" ? view.accountNumber : null} />
          ) : (
            <SecondaryScreen view={view} skin={skin} portal={portal} go={go} />
          )}
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "owing", label: "Owing" },
  { id: "settled", label: "Settled" },
] as const;

function Book({ portal, go, expanded }: { portal: Portal; go: Go; expanded: string | null }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const { stats } = portal;
  const settled = stats.total - stats.owing;
  const rows = portal.accounts
    .map((account) => ({ account, balance: balanceOf(account) }))
    .filter(
      ({ account, balance }) =>
        // The open account stays put even if a search or filter would hide it.
        account.accountNumber === expanded ||
        (matches(account, query) && (filter === "all" || (filter === "owing" ? balance > 0 : balance === 0))),
    );

  return (
    <>
      <div className={`relative isolate overflow-hidden bg-ink text-white ${bleed}`}>
        <div className="absolute inset-x-0 top-0 -z-20 h-[176px]">
          <Photo src={ART.home.src} position={ART.home.position} sizes="100vw" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(27,42,74,.34)_0px,rgba(27,42,74,.82)_96px,#1b2a4a_176px)]"
        />
        <div className={`pb-6 pt-[104px] ${gutter}`}>
          <div className="font-mono text-[11.5px] uppercase tracking-[.12em] text-coral">Ledger · {TODAY_LABEL}</div>
          <h1 className="mt-2.5 font-display text-[clamp(30px,8.4vw,44px)] font-extrabold leading-[1.02] tracking-[-.04em]">
            {stats.owing === 0 ? (
              "Every account is settled."
            ) : (
              <>
                <span className="tabular-nums text-coral">{dollars(stats.outstandingCents)}</span> outstanding across{" "}
                {stats.owing === 1 ? "1 account" : `${stats.owing} accounts`}.
              </>
            )}
          </h1>
          <p className="mt-3 text-[15px] leading-[1.5] text-cloud">
            {dollars(stats.paidThisWeekCents)} paid online this week · {stats.chargesToday} charges posted today
          </p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
            <div className="h-full rounded-full bg-open" style={{ width: `${stats.total ? (settled / stats.total) * 100 : 0}%` }} />
          </div>
          <div className="mt-2 font-mono text-[11.5px] uppercase tracking-[.08em] text-cloud-soft">
            {settled} of {stats.total} accounts settled
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
        <label className={`${skin.label} min-w-[220px] flex-1 basis-full`}>
          Find a patient
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or account number"
            className={skin.input}
          />
        </label>
        <div role="group" aria-label="Filter accounts" className="flex gap-1 font-mono text-[12px] uppercase tracking-[.08em]">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-2 ${filter === item.id ? "bg-panel text-ink" : "text-muted hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go({ name: "new" })} className={`${skin.primary} ml-auto inline-flex items-center gap-1.5`}>
          <Icon name="plus" className="h-4 w-4" />
          New patient
        </button>
      </div>

      <div className={`mt-5 border-t border-ink ${bleed}`}>
        {rows.length === 0 ? (
          <p className={`border-b border-line py-6 text-muted ${gutter}`}>No account matches.</p>
        ) : (
          rows.map(({ account, balance }) => {
            const open = expanded === account.accountNumber;
            return (
              <div key={account.accountNumber} className={`relative border-b border-line ${open ? "bg-mist" : ""}`}>
                {open ? <span aria-hidden="true" className="absolute inset-y-0 left-0 z-[1] w-[3px] bg-brand" /> : null}
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => go(open ? { name: "accounts" } : { name: "account", accountNumber: account.accountNumber })}
                  className={`flex w-full items-center gap-3 py-3 text-left transition-colors duration-150 ease-out ${gutter} ${
                    open ? "bg-mist" : "hover:bg-mist/70"
                  }`}
                >
                  <Avatar name={account.patientName} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[17px] ${open ? "font-bold" : "font-semibold"}`}>{account.patientName}</span>
                    <span className="block font-mono text-[12.5px] text-muted">{account.accountNumber}</span>
                  </span>
                  {balance > 0 ? (
                    <span className="font-mono text-[15px] font-medium tabular-nums">{dollars(balance)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-[.06em] text-[#22693a]">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      Settled
                    </span>
                  )}
                </button>
                {open ? <Sheet account={account} portal={portal} go={go} /> : null}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

const STATUS: Record<ChargeStatus, { text: string; tone: string }> = {
  unpaid: { text: "Unpaid", tone: "text-brand-dark" },
  paid: { text: "Paid", tone: "text-[#22693a]" },
  void: { text: "Void", tone: "text-muted" },
};

/** One patient's account, opened under their line in the book. */
function Sheet({ account, portal, go }: { account: Account; portal: Portal; go: Go }) {
  const line = "flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-line py-2 text-[14.5px]";

  return (
    <div className={`portal-fade bg-mist pb-6 pt-1 ${gutter}`}>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[14.5px]">
        <dt className={label}>Born</dt>
        <dd className="m-0">{fullDate(account.dateOfBirth)}</dd>
        <dt className={label}>Phone</dt>
        <dd className="m-0">{account.phone ?? "Not on file"}</dd>
        <dt className={label}>Email</dt>
        <dd className="m-0 break-all">{account.email ?? "Not on file"}</dd>
      </dl>
      <button type="button" onClick={() => go({ name: "activity", accountNumber: account.accountNumber })} className={`${skin.quiet} mt-4`}>
        Activity on this account
      </button>

      <h3 className={`${skin.heading} mt-6`}>Charges</h3>
      {account.charges.length === 0 ? (
        <p className="mt-2 text-[14.5px] text-muted">No charges posted yet.</p>
      ) : (
        <ul className="mt-2 border-t border-line">
          {account.charges.map((charge) => (
            <li key={charge.id} className={line}>
              <span className="w-[52px] font-mono text-[12.5px] text-muted">{shortDate(charge.at)}</span>
              <span className={`min-w-0 flex-1 basis-[150px] ${charge.status === "void" ? "text-muted line-through" : ""}`}>
                {charge.description}
              </span>
              <span className={`font-mono text-[11.5px] uppercase tracking-[.06em] ${STATUS[charge.status].tone}`}>
                {STATUS[charge.status].text}
              </span>
              <span className="ml-auto w-[84px] text-right font-mono tabular-nums">{dollars(charge.amountCents)}</span>
              <span className="w-[34px] text-right">
                {charge.status === "unpaid" ? (
                  <button
                    type="button"
                    onClick={() => portal.voidCharge(account.accountNumber, charge)}
                    className="text-[13px] font-semibold text-brand hover:text-brand-dark relative after:absolute after:-inset-x-1.5 after:-inset-y-2.5 after:content-['']"
                  >
                    Void
                  </button>
                ) : null}
              </span>
            </li>
          ))}
          <li className="flex items-baseline justify-between py-2.5 text-[15px] font-semibold">
            <span>Balance due</span>
            <span className="mr-[46px] font-mono tabular-nums">{dollars(balanceOf(account))}</span>
          </li>
        </ul>
      )}

      {account.payments.length > 0 ? (
        <>
          <h3 className={`${skin.heading} mt-4`}>Payments</h3>
          <ul className="mt-2 border-t border-line">
            {account.payments.map((payment) => (
              <li key={payment.id} className={line}>
                <span className="w-[52px] font-mono text-[12.5px] text-muted">{shortDate(payment.at)}</span>
                <span className="min-w-0 flex-1 basis-[150px] truncate">
                  Paid online <span className="font-mono text-[12px] text-muted">{payment.reference}</span>
                </span>
                <span className="ml-auto mr-[46px] w-[84px] text-right font-mono tabular-nums">{dollars(payment.amountCents)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 className={`${skin.heading} mt-6`}>Post a charge</h3>
      <ChargeForm
        skin={skin}
        className="mt-2"
        onPost={(description, cents) => portal.postCharge(account.accountNumber, description, cents)}
      />
    </div>
  );
}
