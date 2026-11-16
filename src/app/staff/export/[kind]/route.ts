import { recordAudit } from "@/lib/audit";
import { buildWorkbook } from "@/lib/staff/excel";
import { EXPORT_KINDS, gatherExport, type ExportKind } from "@/lib/staff/exports";
import { requireAdmin } from "@/lib/staff/session";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function message(text: string, status: number): Response {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/**
 * An Excel download of clinic records, for admins. Each download is written to
 * the activity log before the file is sent.
 */
export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  // Sends anyone who isn't a signed-in admin away before any record is read.
  const user = await requireAdmin();

  const { kind } = await params;
  if (!EXPORT_KINDS.includes(kind as ExportKind)) return message("There's no download with that name.", 404);

  let body: Uint8Array<ArrayBuffer>;
  let filename: string;
  try {
    const file = await gatherExport(
      kind as ExportKind,
      Object.fromEntries(new URL(request.url).searchParams),
      user.name,
    );
    if ("refused" in file) return message(file.refused, file.status);

    body = await buildWorkbook(file.sheets);
    filename = file.filename;
    // Before the file is sent on purpose: a download that can't be logged doesn't happen.
    await recordAudit(user, "records.exported", { accountNumber: file.accountNumber, detail: file.summary });
  } catch (error) {
    console.error("Staff: building a download failed", error);
    return message("The records couldn't be read, so nothing was downloaded. Try again in a moment.", 503);
  }

  return new Response(body, {
    headers: {
      "Content-Type": XLSX,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.byteLength),
      // Patient records: never kept by the browser or anything in between.
      "Cache-Control": "no-store",
    },
  });
}
