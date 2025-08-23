const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const Airtable = require('airtable');

// Configure Airtable (replace with your API key/base ID/table name)
const base = new Airtable({ apiKey: 'REMOVED_SECRET' }).base('REMOVED_BASE_ID');
const tableName = 'Traiff'; // e.g., 'Imports'

// Function to fetch data from Airtable (assume one record for header, multiple for lines)
async function fetchData(recordId) {
  const record = await base(tableName).find(recordId); // Or use .select() for multiple
  const fields = record.fields;
  // Assume line items are in a linked table or array; for simplicity, mock 1-3 rows
  const lineItems = [
    { // Row 0 (Line A)
      final_hts_code: fields.final_hts_code || '1234.56.7890',
      country_of_origin: fields.country_of_origin || 'US',
      final_generated_part_description: fields.final_generated_part_description || 'Widget',
      // Add more from table...
    },
    // Add row 1 (B), row 2 (C) if exist
  ];
  return { header: { /* Add header data */ }, lineItems };
}

// Main fill function
async function fillForm3461(inputPdfPath, outputPdfPath, data) {
  const pdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Header mappings (example; expand as needed)
  form.getTextField('F[0].P1[0].DateSigned[0]').setText('08/23/2025'); // Current date

  // Line items (loop up to 3)
  data.lineItems.forEach((item, index) => {
    let suffix = index === 0 ? 'A' : index === 1 ? 'B' : 'C';
    if (index > 2) return; // Skip if >3

    form.getTextField(`F[0].p2[0].HTSCode1${suffix}[0]`).setText(item.final_hts_code);
    form.getTextField(`F[0].p2[0].CountryOrigin${suffix}[0]`).setText(item.country_of_origin);
    // form.getTextField(`F[0].p2[0].Description${suffix}[0]`).setText(item.final_generated_part_description);
    // Add more: e.g., form.getTextField(`F[0].p2[0].Value${suffix}[0]`).setText('100'); // External value

    // Example checkbox: If material_type implies mining, set country; else disclaim
    
  });

  // Save
  const filledBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, filledBytes);
}

// Usage
(async () => {
  const data = await fetchData('rec0CCvUXdukMaYKH');
  await fillForm3461('template/form_3461.pdf', 'filled_3461.pdf', data);
  console.log('Form filled successfully');
})();