import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const generateInvoiceData = (config, parties, hsnCodes) => {
  const { startInvoice, startDate, endDate, isWithinState } = config;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const DAILY_LIMIT = isWithinState ? 95000 : 45000;

  let currentInvoiceStr = startInvoice;
  const finalData = [];

  const incrementInvoice = (inv) => {
    return inv.replace(/\d+$/, (n) => (parseInt(n) + 1).toString().padStart(n.length, '0'));
  };

  for (let d = 0; d < daysDiff; d++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + d);
    const dateStr = currentDate.toLocaleDateString('en-GB').replace(/\//g, '-');

    parties.forEach(party => {
      // Calculate remaining budget for this party
      const spentSoFar = finalData
        .filter(x => x["PARTY NAME"] === party.name)
        .reduce((sum, x) => sum + parseFloat(x["TAXABLE"]), 0);
      
      const remainingTotal = party.amount - spentSoFar;
      if (remainingTotal <= 0) return;

      // Determine target for today (not exceeding the daily limit)
      const dailyTarget = Math.min(remainingTotal / (daysDiff - d), DAILY_LIMIT);

      // Pick a random HSN
      const product = hsnCodes[Math.floor(Math.random() * hsnCodes.length)];
      if (!product || !product.price) return;

      const qty = Math.floor(dailyTarget / product.price);
      
      if (qty > 0) {
        finalData.push({
          "DATE": dateStr,
          "GSTIN": party.gstin || "",
          "PARTY NAME": party.name,

          "INVOICE NO.": currentInvoiceStr,
          "HSN CODE": product.code,
          "QTY": qty,
          "RATE": product.price,
          "TAXABLE": (qty * product.price).toFixed(2),
        //   "REMARKS": isWithinState ? "Intra-State" : "Inter-State"
        });
        currentInvoiceStr = incrementInvoice(currentInvoiceStr);
      }
    });
  }
  return finalData;
};

export const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "B2B_Data");
  XLSX.writeFile(workbook, `Invoices_Export.xlsx`);
};