import { AUDIT_GROUPS, type AuditFilter, type AuditGroup } from "@/lib/audit";
import { normalizeAccountNumber } from "@/lib/billing/lookup";
import { choosePeriod, periodParams, type Period } from "@/lib/staff/periods";

/*
 * How the activity log is narrowed. The activity page and its Excel download
 * read the same search params, so they always show the same entries.
 */

export type ActivityQuery = {
  /** What was typed in the account box, trimmed. */
  typedAccount: string;
  /** The account to show, or null when the box is empty or doesn't hold an account number. */
  accountNumber: string | null;
  group: AuditGroup | null;
  /** Null means all dates. */
  period: Period | null;
  /** What was wrong with the dates, if they couldn't be used. */
  problem: string | null;
};

export function readActivityQuery(params: {
  account?: unknown;
  kind?: unknown;
  period?: unknown;
  from?: unknown;
  to?: unknown;
}): ActivityQuery {
  const typedAccount = typeof params.account === "string" ? params.account.trim() : "";
  const { period, problem } = choosePeriod(params, null);
  return {
    typedAccount,
    accountNumber: typedAccount ? normalizeAccountNumber(typedAccount) : null,
    group: AUDIT_GROUPS.find((group) => group.id === params.kind) ?? null,
    period,
    problem,
  };
}

export function activityFilter(query: ActivityQuery): AuditFilter {
  return {
    accountNumber: query.accountNumber,
    ...(query.period ? { startIso: query.period.startIso, endIso: query.period.endIso } : {}),
    ...(query.group ? { actions: query.group.actions } : {}),
  };
}

/** The search params that lead back to the same entries. */
export function activityParams(query: ActivityQuery): Record<string, string> {
  return {
    ...(query.typedAccount ? { account: query.typedAccount } : {}),
    ...(query.group ? { kind: query.group.id } : {}),
    ...periodParams(query.period),
  };
}

/** The filters in words, such as `Nov 9 to Nov 15, 2026, NS-630462, Charges and payments`. */
export function describeActivityQuery(query: ActivityQuery): string {
  return [query.period ? query.period.dates : "all dates", query.accountNumber, query.group?.label]
    .filter(Boolean)
    .join(", ");
}
