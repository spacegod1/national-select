"use client";

import Link, { useLinkStatus } from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Avatar, Icon, gutter, plainLink, skin } from "@/components/staff-ui";
import { formatDollars } from "@/lib/staff/format";

/*
 * The list of patient accounts, in its two shapes. On tablets and larger
 * screens it is a column that stays put while an account opens beside it. On
 * phones it is the page itself, and an account opens under its own line.
 *
 * Opening an account loads a new page, so what the list should remember
 * between pages is held above the pages, in `AccountsStateProvider`.
 */

export type AccountRow = { accountNumber: string; patientName: string; balanceCents: number };

type Filter = "all" | "owing" | "settled";

type AccountsState = {
  query: string;
  setQuery: (query: string) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  /** How far down the column was scrolled. */
  columnScrollRef: RefObject<number>;
  /** The account whose line was just picked, so the keyboard stays on it once the page has loaded. */
  pickedRef: RefObject<string | null>;
};

const AccountsContext = createContext<AccountsState | null>(null);

export function AccountsStateProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const columnScrollRef = useRef(0);
  const pickedRef = useRef<string | null>(null);
  return (
    <AccountsContext.Provider value={{ query, setQuery, filter, setFilter, columnScrollRef, pickedRef }}>
      {children}
    </AccountsContext.Provider>
  );
}

function useAccountsState(): AccountsState {
  const state = useContext(AccountsContext);
  if (!state) throw new Error("The accounts list must be inside <AccountsStateProvider>");
  return state;
}

function matches(row: AccountRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.patientName.toLowerCase().includes(q) ||
    row.accountNumber.toLowerCase().replace(/-/g, "").includes(q.replace(/[-\s]/g, ""))
  );
}

function passes(row: AccountRow, filter: Filter): boolean {
  return filter === "all" || (filter === "owing" ? row.balanceCents > 0 : row.balanceCents <= 0);
}

/** A whole account number typed into the search box, tidied up, or null. */
function typedAccountNumber(query: string): string | null {
  const match = /^ns-?(\d{6})$/i.exec(query.replace(/\s+/g, ""));
  return match ? `NS-${match[1]}` : null;
}

function accountHref(accountNumber: string): string {
  return `/staff/accounts/${accountNumber}`;
}

/** Shown where a line's red marker goes while its account is loading. Must be inside a `<Link>`. */
function LoadingMarker() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span data-loading="" aria-hidden="true" className="absolute inset-y-0 left-0 z-[1] w-[3px] bg-brand/50" />
  ) : null;
}

/** What the list says when nothing matches, with a way to an account too old to be listed. */
function NoMatch({ query, className }: { query: string; className: string }) {
  const accountNumber = typedAccountNumber(query);
  return (
    <p className={className}>
      No account matches.
      {accountNumber ? (
        <>
          {" "}
          <Link href={accountHref(accountNumber)} prefetch={false} className="font-semibold">
            Open {accountNumber}
          </Link>
        </>
      ) : null}
    </p>
  );
}

function limitNote(listLimit: number): string {
  return `These are the ${listLimit} newest accounts. Type a full account number to open an older one.`;
}

/* ------------------------------------------------------------------
   Tablets and larger: a column beside the open account
   ------------------------------------------------------------------ */

const COLUMN_FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "owing", label: "Balance due" },
  { id: "settled", label: "Paid up" },
];

export function AccountColumn({
  rows,
  selected,
  outstandingCents,
  owingAccounts,
  totalAccounts,
  listLimit,
}: {
  rows: AccountRow[];
  /** The account open beside the column, if one is. */
  selected: string | null;
  outstandingCents: number;
  owingAccounts: number;
  totalAccounts: number;
  listLimit: number;
}) {
  const { query, setQuery, filter, setFilter, columnScrollRef, pickedRef } = useAccountsState();
  const list = useRef<HTMLUListElement>(null);
  const settled = totalAccounts - owingAccounts;
  const visible = rows.filter((row) => matches(row, query) && passes(row, filter));

  // Each account is its own page, so the column is drawn again when one opens.
  // Put it back where it was, with the keyboard on the line that was picked.
  useLayoutEffect(() => {
    const element = list.current;
    if (!element || element.offsetParent === null) return;
    element.scrollTop = columnScrollRef.current;
    element.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
    if (pickedRef.current) {
      element.querySelector<HTMLElement>(`[data-account="${pickedRef.current}"]`)?.focus({ preventScroll: true });
      pickedRef.current = null;
    }
  }, [columnScrollRef, pickedRef]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-3.5 pb-2.5 pt-3.5">
        <h1 className="font-display text-[20px] font-extrabold tracking-[-.02em]">
          Accounts{" "}
          <span className="font-sans text-[13px] font-normal tracking-normal text-muted">
            {query.trim() || filter !== "all" ? visible.length : totalAccounts}
          </span>
        </h1>
        <Link
          href="/staff/new"
          className={`staff-entry-press inline-flex items-center gap-1.5 rounded-[8px] bg-brand px-2.5 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-press hover:text-white ${plainLink}`}
        >
          <Icon name="plus" className="h-4 w-4" />
          New patient
        </Link>
      </div>

      <div className="mx-3.5 mb-3 rounded-[10px] bg-mist px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11.5px] font-semibold uppercase tracking-[.07em] text-muted">Outstanding</span>
          <span className="font-display text-[17px] font-extrabold tracking-[-.02em] tabular-nums">
            {formatDollars(outstandingCents)}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-pink-line" aria-hidden="true">
          <div
            className="h-full rounded-full bg-open"
            style={{ width: `${totalAccounts ? (settled / totalAccounts) * 100 : 0}%` }}
          />
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          {settled} of {totalAccounts} accounts paid up
        </div>
      </div>

      <div className="px-3.5">
        <label className="relative block">
          <span className="sr-only">Search by name or account number</span>
          <Icon
            name="search"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or account number"
            className="w-full rounded-[8px] border border-line bg-white py-2 pl-8 pr-2.5 text-[14px]"
          />
        </label>
        <div
          role="group"
          aria-label="Filter accounts"
          className="mt-2.5 grid grid-cols-3 rounded-[8px] bg-mist p-0.5 text-[12.5px] font-semibold"
        >
          {COLUMN_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-[6px] py-1.5 ${
                filter === item.id ? "bg-white shadow-[0_0_0_1px_var(--color-line)]" : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={list}
        onScroll={(event) => {
          columnScrollRef.current = event.currentTarget.scrollTop;
        }}
        className="mt-2.5 min-h-0 flex-1 overflow-y-auto border-t border-line-soft"
      >
        {visible.length === 0 ? (
          <li>
            {rows.length === 0 ? (
              <p className="px-3.5 py-6 text-muted">No patient accounts yet. Create the first one with New patient.</p>
            ) : (
              <NoMatch query={query} className="px-3.5 py-6 text-muted" />
            )}
          </li>
        ) : (
          visible.map((row) => {
            const active = selected === row.accountNumber;
            return (
              <li key={row.accountNumber} className="border-b border-line-soft">
                {/* No prefetch: loading an account page logs it as opened. */}
                <Link
                  href={accountHref(row.accountNumber)}
                  prefetch={false}
                  data-account={row.accountNumber}
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    pickedRef.current = row.accountNumber;
                  }}
                  className={`relative flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-ink transition-colors duration-150 ease-out hover:text-ink has-[[data-loading]]:bg-mist ${plainLink} ${
                    active ? "bg-mist" : "hover:bg-mist/60"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-y-0 left-0 w-[3px] bg-brand" aria-hidden="true" />
                  ) : (
                    <LoadingMarker />
                  )}
                  <Avatar name={row.patientName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{row.patientName}</span>
                    <span className="block font-mono text-[12px] text-muted">{row.accountNumber}</span>
                  </span>
                  {row.balanceCents > 0 ? (
                    <span className="font-semibold tabular-nums">{formatDollars(row.balanceCents)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#22693a]">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      Paid up
                    </span>
                  )}
                </Link>
              </li>
            );
          })
        )}
        {rows.length >= listLimit ? (
          <li className="px-3.5 py-3 text-[12.5px] text-muted">{limitNote(listLimit)}</li>
        ) : null}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------
   Phones: the list is the page, and an account opens under its line
   ------------------------------------------------------------------ */

const BOOK_FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "owing", label: "Owing" },
  { id: "settled", label: "Settled" },
];

export function AccountBook({
  rows,
  expanded,
  listLimit,
  children,
}: {
  rows: AccountRow[];
  /** The account that is open, if one is. */
  expanded: string | null;
  listLimit: number;
  /** The open account, shown under its line. */
  children?: ReactNode;
}) {
  const { query, setQuery, filter, setFilter, pickedRef } = useAccountsState();
  const openLine = useRef<HTMLDivElement>(null);
  const visible = rows.filter(
    (row) =>
      // The open account stays put even if a search or filter would hide it.
      row.accountNumber === expanded || (matches(row, query) && passes(row, filter)),
  );

  // The open account may be far down the list, or have moved when another one
  // closed above it. After the page has settled, bring its line into view.
  useEffect(() => {
    const line = openLine.current;
    if (!line || line.offsetParent === null) return;
    const { top } = line.getBoundingClientRect();
    if (top < 56 || top > window.innerHeight - 96) line.scrollIntoView({ block: "start" });
    if (pickedRef.current === expanded) line.querySelector("a")?.focus({ preventScroll: true });
    pickedRef.current = null;
  }, [expanded, pickedRef]);

  return (
    <>
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
          {BOOK_FILTERS.map((item) => (
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
        <Link href="/staff/new" className={`${skin.primary} ml-auto inline-flex items-center gap-1.5`}>
          <Icon name="plus" className="h-4 w-4" />
          New patient
        </Link>
      </div>

      <div className="-mx-[clamp(16px,4vw,40px)] mt-5 border-t border-ink">
        {visible.length === 0 ? (
          rows.length === 0 ? (
            <p className={`border-b border-line py-6 text-muted ${gutter}`}>
              No patient accounts yet. Create the first one with New patient.
            </p>
          ) : (
            <NoMatch query={query} className={`border-b border-line py-6 text-muted ${gutter}`} />
          )
        ) : (
          visible.map((row) => {
            const open = expanded === row.accountNumber;
            return (
              <div
                key={row.accountNumber}
                ref={open ? openLine : undefined}
                className={`relative scroll-mt-[52px] border-b border-line ${open ? "bg-mist" : ""}`}
              >
                {open ? <span aria-hidden="true" className="absolute inset-y-0 left-0 z-[1] w-[3px] bg-brand" /> : null}
                {/* The page stays where it is scrolled to, so the account opens in place.
                    No prefetch: loading an account page logs it as opened. */}
                <Link
                  href={open ? "/staff" : accountHref(row.accountNumber)}
                  prefetch={false}
                  scroll={false}
                  aria-expanded={open}
                  onClick={() => {
                    pickedRef.current = open ? null : row.accountNumber;
                  }}
                  className={`relative flex w-full items-center gap-3 py-3 text-left text-ink transition-colors duration-150 ease-out hover:text-ink has-[[data-loading]]:bg-mist ${plainLink} ${gutter} ${
                    open ? "bg-mist" : "hover:bg-mist/70"
                  }`}
                >
                  {open ? null : <LoadingMarker />}
                  <Avatar name={row.patientName} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[17px] ${open ? "font-bold" : "font-semibold"}`}>
                      {row.patientName}
                    </span>
                    <span className="block font-mono text-[12.5px] text-muted">{row.accountNumber}</span>
                  </span>
                  {row.balanceCents > 0 ? (
                    <span className="font-mono text-[15px] font-medium tabular-nums">{formatDollars(row.balanceCents)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-[.06em] text-[#22693a]">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      Settled
                    </span>
                  )}
                </Link>
                {open ? children : null}
              </div>
            );
          })
        )}
      </div>
      {rows.length >= listLimit ? <p className="mt-4 text-[13.5px] text-muted">{limitNote(listLimit)}</p> : null}
    </>
  );
}
