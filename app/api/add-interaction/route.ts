import { sheets } from "@/lib/googlesheet";

const SPREADSHEET_ID = "1aIsPuCQUq0hVfC43MXXt5ie8q84IMkgNTJ153o89oqA";

export async function POST(req: Request) {
  const { mssv, type } = await req.json();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A2:M",
  });

  const rows = res.data.values || [];
  const index = rows.findIndex((row) => row[1] === mssv);

  if (index === -1) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const rowNumber = index + 2;

  let col = "";
  let current = 0;

  if (type === "likes") {
    col = "J";
    current = Number(rows[index][9] || 0);
  } else if (type === "waves") {
    col = "K";
    current = Number(rows[index][10] || 0);
  } else if (type === "xinso") {
    col = "L";
    current = Number(rows[index][11] || 0);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!${col}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[current + 1]],
    },
  });

  return Response.json({ success: true });
}
