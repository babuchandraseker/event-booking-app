const fs = require("fs/promises");
const path = require("path");

const EXPORT_DIR = path.join(__dirname, "../../exports");
const BOOKINGS_CSV_PATH = path.join(EXPORT_DIR, "bookings.csv");

const BOOKING_COLUMNS = [
  { key: "id", label: "Booking ID" },
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "eventType", label: "Event Type" },
  { key: "eventDate", label: "Event Date" },
  { key: "eventTime", label: "Event Time" },
  { key: "packageId", label: "Package ID" },
  { key: "packageTitle", label: "Package" },
  { key: "amount", label: "Amount" },
  { key: "guestCount", label: "Guest Count" },
  { key: "location", label: "Location" },
  { key: "addons", label: "Add-ons" },
  { key: "addonsDetailed", label: "Add-on Details" },
  { key: "notes", label: "Notes" },
  { key: "status", label: "Status" },
  { key: "paymentStatus", label: "Payment Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

const formatCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const escapeCsvCell = (value) => {
  const cell = formatCell(value);

  if (/[",\r\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
};

const bookingToCsvRow = (booking) =>
  BOOKING_COLUMNS.map(({ key }) => escapeCsvCell(booking[key])).join(",");

const getCsvHeader = () =>
  BOOKING_COLUMNS.map(({ label }) => escapeCsvCell(label)).join(",");

const ensureExportFile = async () => {
  await fs.mkdir(EXPORT_DIR, { recursive: true });

  try {
    await fs.access(BOOKINGS_CSV_PATH);
  } catch {
    await fs.writeFile(BOOKINGS_CSV_PATH, `${getCsvHeader()}\n`, "utf8");
  }
};

const appendBookingToSheet = async (booking) => {
  await ensureExportFile();
  await fs.appendFile(BOOKINGS_CSV_PATH, `${bookingToCsvRow(booking)}\n`, "utf8");
};

const buildBookingsCsv = (bookings) => {
  const rows = bookings.map(bookingToCsvRow);
  return `${getCsvHeader()}\n${rows.join("\n")}${rows.length ? "\n" : ""}`;
};

const escapeHtml = (value) =>
  formatCell(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildBookingsExcelHtml = (bookings) => {
  const headerCells = BOOKING_COLUMNS.map(
    ({ label }) => `<th>${escapeHtml(label)}</th>`
  ).join("");
  const bodyRows = bookings
    .map((booking) => {
      const cells = BOOKING_COLUMNS.map(
        ({ key }) => `<td class="text">${escapeHtml(booking[key])}</td>`
      ).join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
    th { background: #f2f2f2; font-weight: 700; }
    th, td { border: 1px solid #d9d9d9; padding: 6px 8px; mso-number-format: "\\@"; white-space: nowrap; }
    .text { mso-number-format: "\\@"; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;
};

module.exports = {
  BOOKINGS_CSV_PATH,
  appendBookingToSheet,
  buildBookingsExcelHtml,
  buildBookingsCsv,
};
