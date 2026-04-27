import { sheets } from "@/lib/googlesheet";

const SPREADSHEET_ID = "1aIsPuCQUq0hVfC43MXXt5ie8q84IMkgNTJ153o89oqA";

export async function GET() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A2:M", // đủ cột của bạn
  });

  const rows = res.data.values || [];

  const students = rows.map((row) => {
    const likes = Number(row[9] || 0);
    const waves = Number(row[10] || 0);
    const xinso = Number(row[11] || 0);

    const total = likes + waves + xinso;

    return {
      stt: row[0],
      mssv: row[1],
      name: row[2],
      dob: row[3],
      lop: row[4],
      year: row[5],
      he: row[6],
      sdt: row[7],
      khoa: row[8], // 1 -> 4
      likes,
      waves,
      xinso,
      total,
    };
  });

  // sort luôn từ server (top trước)
  students.sort((a, b) => b.total - a.total);

  return Response.json({ data: students });
}