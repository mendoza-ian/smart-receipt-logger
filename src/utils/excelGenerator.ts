// src/utils/excelGenerator.ts
import ExcelJS from "exceljs";

// Receipt structure
interface ImportedReceipt {
  id: string;
  type: string;
  date: string | null;
  merchant: string | null;
  amount: number | null;
  imageBase64: string | null;
}

const SHEETS = ["Meal", "Clothing", "WFH", "Transportation"] as const;

export async function generateExcelForMonth(
  _year: number,
  _month: number,
  receipts: ImportedReceipt[]
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  // Create all sheets & store them in a map
  const sheetMap: Record<string, ExcelJS.Worksheet> = {};

  SHEETS.forEach((name) => {
    const ws = workbook.addWorksheet(name);
    ws.columns = [
      { header: "DATE", key: "date", width: 18 },
      { header: "PARTICULAR", key: "merchant", width: 30 },
      { header: "AMOUNT", key: "amount", width: 14 },
      { header: "", width: 4 }, // spacing
      { header: "IMAGE", width: 40 }, // column for image
    ];
    sheetMap[name] = ws;
  });

  // Group receipts by type
  const grouped: Record<string, ImportedReceipt[]> = {
    Meal: [],
    Clothing: [],
    WFH: [],
    Transportation: [],
  };

  receipts.forEach((r) => {
    if (grouped[r.type]) grouped[r.type].push(r);
  });

  // Add rows into sheets
  for (const sheetName of SHEETS) {
    const ws = sheetMap[sheetName];
    const rows = grouped[sheetName];

    let rowIndex = 2; // start after header row

    for (const r of rows) {
      ws.addRow({
        date: r.date || "",
        merchant: r.merchant || "",
        amount: r.amount ?? "",
      });

      // Increase row height for image
      ws.getRow(rowIndex).height = 200;

      if (r.imageBase64) {
        const imageId = workbook.addImage({
          base64: r.imageBase64,
          extension: "png",
        });

        ws.addImage(imageId, {
          tl: { col: 4, row: rowIndex - 1 }, // Column E
          ext: { width: 300, height: 300 },
        });
      }

      rowIndex++;
    }

    // Add SUM row
    const sumRow = ws.addRow({
      date: "TOTAL",
      amount: { formula: `SUM(C2:C${rowIndex - 1})` },
    });
    sumRow.font = { bold: true };
  }

  // Convert workbook to Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
