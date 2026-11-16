import ExcelJS from "exceljs";

/*
 * Turns rows into an Excel workbook. It knows nothing about the clinic's
 * records: callers hand it sheets of plain values.
 */

/**
 * How a column's cells are shown.
 * - `money` takes dollars as a number.
 * - `date` and `time` take a Date whose UTC fields hold the calendar date or clock time to show.
 */
export type CellKind = "text" | "money" | "count" | "date" | "time";

export type CellValue = string | number | Date | null;

/** A bare value takes its column's kind. A cell can also bring its own. */
export type Cell = CellValue | { value: CellValue; kind: CellKind };

export type SheetColumn = { header: string; kind?: CellKind; width?: number };

export type Sheet = {
  /** The tab's name. Excel allows 31 characters and none of `\ / ? * [ ] :`. */
  name: string;
  columns: SheetColumn[];
  rows: Cell[][];
  /** Adds a bold row under the data that sums the money columns. */
  totalLabel?: string;
  /** Set to false to leave off the sort and filter arrows in the header row. */
  sortable?: boolean;
};

const FORMATS: Record<CellKind, string> = {
  text: "@",
  money: '"$"#,##0.00',
  count: "#,##0",
  date: "mm/dd/yyyy",
  time: "mm/dd/yyyy h:mm AM/PM",
};

const WIDTHS: Record<CellKind, number> = { text: 28, money: 14, count: 12, date: 14, time: 22 };

const NAVY = "FF1B2A4A";
const RULE = "FFD9E1EC";

function columnLetter(index: number): string {
  let letters = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  }
  return letters;
}

export async function buildWorkbook(sheets: Sheet[]): Promise<Uint8Array<ArrayBuffer>> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "National Select Urgent Care";
  workbook.created = new Date();
  // Has Excel work the totals out again as it opens the file.
  workbook.calcProperties.fullCalcOnLoad = true;

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name, { views: [{ state: "frozen", ySplit: 1 }] });
    worksheet.columns = sheet.columns.map((column) => ({
      header: column.header,
      width: column.width ?? WIDTHS[column.kind ?? "text"],
    }));

    const header = worksheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.alignment = { vertical: "middle" };
    header.height = 20;
    sheet.columns.forEach((_, index) => {
      header.getCell(index + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    });

    for (const cells of sheet.rows) {
      const row = worksheet.addRow([]);
      cells.forEach((cell, index) => {
        const own = cell !== null && typeof cell === "object" && !(cell instanceof Date);
        const value = own ? cell.value : cell;
        const kind = own ? cell.kind : (sheet.columns[index]?.kind ?? "text");
        const target = row.getCell(index + 1);
        // Text is written as text, never as a formula, whatever it starts with.
        target.value = kind === "text" && value !== null && !(value instanceof Date) ? String(value) : value;
        target.numFmt = FORMATS[kind];
        target.alignment = { vertical: "top", wrapText: kind === "text" };
      });
    }

    if (sheet.totalLabel && sheet.rows.length > 0) {
      const first = 2;
      const last = sheet.rows.length + 1;
      const row = worksheet.addRow([]);
      row.font = { bold: true };
      row.getCell(1).value = sheet.totalLabel;
      sheet.columns.forEach((column, index) => {
        const target = row.getCell(index + 1);
        target.border = { top: { style: "thin", color: { argb: RULE } } };
        if (column.kind !== "money" || index === 0) return;
        const letter = columnLetter(index);
        const sum = sheet.rows.reduce((total, cells) => {
          const cell = cells[index];
          return total + (typeof cell === "number" ? cell : 0);
        }, 0);
        // The result is saved with the formula, so apps that don't recalculate still show it.
        target.value = { formula: `SUM(${letter}${first}:${letter}${last})`, result: Math.round(sum * 100) / 100 };
        target.numFmt = FORMATS.money;
      });
    }

    if (sheet.sortable !== false && sheet.rows.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: sheet.rows.length + 1, column: sheet.columns.length },
      };
    }
  }

  return new Uint8Array(await workbook.xlsx.writeBuffer());
}
