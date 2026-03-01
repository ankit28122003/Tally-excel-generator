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

      // --- RANDOMIZATION LOGIC START ---
      // 1. Generate random weights for each HSN
      const weights = hsnList.map(() => Math.random() + 0.5); // +0.5 ensures no HSN gets 0 amount
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      
      let remainingDailyBudget = dailyPartyBudget;

      hsnList.forEach((hsn, index) => {
        const unitPrice = parseFloat(hsn.price);
        
        let targetAmountForThisHSN;
        
        // If it's the last HSN item, give it the remaining budget to ensure total matches exactly
        if (index === hsnList.length - 1) {
          targetAmountForThisHSN = remainingDailyBudget;
        } else {
          targetAmountForThisHSN = (weights[index] / totalWeight) * dailyPartyBudget;
        }

        // 2. Calculate Quantity (Whole Number)
        const qty = Math.floor(targetAmountForThisHSN / unitPrice);
        
        // 3. Calculate Actual Taxable based on the whole Quantity
        const actualTaxable = qty * unitPrice;
        
        // Deduct from remaining budget tracking
        remainingDailyBudget -= actualTaxable;

        // Only add to invoice if quantity is at least 1
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
      // --- RANDOMIZATION LOGIC END ---

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
  XLSX.writeFile(workbook, `Invoices_Randomized.xlsx`);
};