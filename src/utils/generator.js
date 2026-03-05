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
      const baseDailyBudget = parseFloat(party.budget) / daysDiff;

      if (baseDailyBudget > dailyLimit) {
        throw new Error(`${party.name} daily average (${baseDailyBudget.toFixed(0)}) exceeds state limit.`);
      }

      // --- RANDOM VARIANCE LOGIC ---
      // This fluctuates the bill total by +/- ₹200 to ₹2000 
      // while staying safely below the state limit
      const variance = (Math.random() * 1800 + 200) * (Math.random() > 0.5 ? 1 : -1);
      let targetBillTotal = baseDailyBudget + variance;
      
      // Safety check: Don't exceed the legal GST limits
      if (targetBillTotal > dailyLimit) targetBillTotal = dailyLimit - 500;
      if (targetBillTotal < 1000) targetBillTotal = baseDailyBudget; // Fallback for very small budgets

      // 1. Generate random weights for each HSN item
      const weights = hsnList.map(() => Math.random() + 0.5);
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      
      let remainingBillBudget = targetBillTotal;

      hsnList.forEach((hsn, index) => {
        const unitPrice = parseFloat(hsn.price);
        let targetAmountForThisHSN;
        
        if (index === hsnList.length - 1) {
          targetAmountForThisHSN = remainingBillBudget;
        } else {
          targetAmountForThisHSN = (weights[index] / totalWeight) * targetBillTotal;
        }

        const qty = Math.floor(targetAmountForThisHSN / unitPrice);
        const actualTaxable = qty * unitPrice;
        
        remainingBillBudget -= actualTaxable;

        if (qty > 0) {
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
        }
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
        cell.z = (c === 7) ? '0' : '0.00'; 
      }
    });
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "B2B");
  XLSX.writeFile(workbook, `Invoices_Varied_${Date.now()}.xlsx`);
};