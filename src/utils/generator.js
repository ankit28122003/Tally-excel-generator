import * as XLSX from 'xlsx';

export const generateInvoiceData = (config, parties, hsnList) => {
  const { startInvoice, startDate, endDate } = config;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

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
      const dailyLimit = party.isWithinState ? 95000 : 45000;
      const dailyPartyBudget = parseFloat(party.budget) / daysDiff;

      if (dailyPartyBudget > dailyLimit) {
        throw new Error(`${party.name} daily total (${dailyPartyBudget.toFixed(0)}) exceeds ${dailyLimit} limit.`);
      }

      // Distribute budget across all HSN items
      const targetTaxablePerHSN = dailyPartyBudget / hsnList.length;

      hsnList.forEach((hsn) => {
        const unitPrice = parseFloat(hsn.price);
        // Ensure Qty is never decimal
        const qty = Math.floor(targetTaxablePerHSN / unitPrice);
        // Taxable must be Qty * Unit Price to be valid
        const actualTaxable = qty * unitPrice;
        
        finalData.push({
          "DATE": dateStr,
          "INVOICE NO.": currentInvoiceStr,
          "GSTIN": party.gstin,
          "TRADE NAME": party.name,
          "RATE": parseFloat(hsn.rate), 
          "TAXABLE": parseFloat(actualTaxable.toFixed(2)), 
          "HSN CODE(OPTIONAL)": hsn.id,
          "QTY(OPTIONAL)": parseInt(qty),
          "Platform Name(Optional)": "",
          "GSTIN of e-commerce operator (Optional)": ""
        });
      });
      currentInvoiceStr = incrementInvoice(currentInvoiceStr);
    });
  }
  return finalData;
};

export const exportToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    [4, 5, 7].forEach(c => {
      const cell = worksheet[XLSX.utils.encode_cell({r:R, c})];
      if(cell) { 
        cell.t = 'n'; 
        // Rate and Taxable get decimals, Qty (column 7) gets whole number format
        cell.z = (c === 7) ? '0' : '0.00'; 
      }
    });
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "B2B");
  XLSX.writeFile(workbook, `Invoices_Final.xlsx`);
};