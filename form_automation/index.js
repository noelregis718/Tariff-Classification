const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs/promises');
const Airtable = require('airtable');
const path = require('path');

const base = new Airtable({ apiKey: 'REMOVED_SECRET' }).base('REMOVED_BASE_ID');
const tableName = 'Traiff';
// Sanitize text to remove/replace non-ASCII characters
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  // Replace common non-ASCII characters or remove them
  return text
    .replace(/Ω/g, 'Omega') // Replace Omega with text
    .replace(/[^\x00-\x7F]/g, '') // Remove other non-ASCII characters
    .trim();
}

// Fetch data from Airtable
async function fetchData() {
  try {
    const records = await base(tableName).select().firstPage();
    if (!records.length) throw new Error('No records found in Airtable');
    return records.map(record => ({
      recordID: record.id,
      manufacture_part_number: sanitizeText(record.fields.manufacture_part_number || ''),
      final_hts_code: sanitizeText(record.fields.final_hts_code || ''),
      country_of_origin: sanitizeText(record.fields.country_of_origin || ''),
      final_generated_part_description: sanitizeText(record.fields.final_generated_part_description || record.fields.original_part_description || ''),
      material_type: sanitizeText(record.fields.material_type || ''),
      rohs_compliance: sanitizeText(record.fields.rohs_compliance || ''),
      eccn: sanitizeText(record.fields.eccn || ''),
      distributor: sanitizeText(record.fields.distributor || '')
    }));
  } catch (err) {
    console.error('Airtable fetch error:', err);
    throw err;
  }
}

// Fill Form 3461 for a single row
async function fillForm3461(inputPdfPath, outputPdfPath, item) {
  const resolvedInputPath = path.resolve(__dirname, inputPdfPath);
  const fileExists = await fs.access(resolvedInputPath).then(() => true).catch(() => false);
  if (!fileExists) throw new Error(`PDF file not found at: ${resolvedInputPath}`);

  try {
    console.log(`Processing record ${item.recordID}:`, JSON.stringify(item, null, 2));
    const pdfBytes = await fs.readFile(resolvedInputPath);
    console.log(`PDF loaded for record ${item.recordID}, size: ${pdfBytes.length}`);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Header: Reference ID and Party
    form.getTextField('F[0].P1[0].ReferenceNo[0]').setText(item.manufacture_part_number);
    form.getTextField('F[0].P1[0].ReferenceID[0]').setText('PART');
    form.getCheckBox('F[0].P1[0].PartyType1[3]').check(); // Manufacturer
    form.getTextField('F[0].P1[0].TextField1[2]').setText(item.distributor);
    form.getTextField('F[0].P1[0].CBPAssigned[0]').setText(item.manufacture_part_number);

    // Line Item: Fill only Line 1 (A)
    const description = sanitizeText(
      `${item.final_generated_part_description} - ${item.material_type}, RoHS: ${item.rohs_compliance}, ECCN: ${item.eccn}`
    );
    form.getTextField('F[0].p2[0].HTSCode1A[0]').setText(item.final_hts_code);
    form.getTextField('F[0].p2[0].CountryOriginA[0]').setText(item.country_of_origin);
    form.getTextField('F[0].p2[0].Descriptiona[0]').setText(description);
    form.getCheckBox('F[0].p2[0].HTS1LINE1A[0]').check();
    form.getCheckBox('F[0].p2[0].LinePartyType1LINE1A[3]').check();
    form.getTextField('F[0].p2[0].HeaderIDA[0]').setText(item.manufacture_part_number);

    // Mining: Disclaim unless metal-related
    if (item.material_type.toLowerCase().includes('metal')) {
      form.getTextField('F[0].p2[0].CountryofMiningA[0]').setText(item.country_of_origin);
    } else {
      form.getCheckBox('F[0].p2[0].CountryofMiningA[1]').check();
    }

    // Save PDF
    const filledBytes = await pdfDoc.save();
    await fs.writeFile(outputPdfPath, filledBytes);
    console.log(`Form saved to: ${outputPdfPath}`);
  } catch (err) {
    console.error(`Error filling form for record ${item.recordID}:`, err);
    throw err; // Re-throw to skip this record but continue with others
  }
}

// Main execution: One PDF per row
(async () => {
  try {
    const lineItems = await fetchData();
    if (!lineItems.length) throw new Error('No data fetched from Airtable');
    console.log(`Fetched ${lineItems.length} records`);

    const inputPdfPath = 'template/form_3461.pdf';
    for (const item of lineItems) {
      const safeFileName = item.manufacture_part_number.replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize filename
      const outputPdfPath = path.resolve(__dirname, `filled_3461_${safeFileName || item.recordID}.pdf`);
      try {
        await fillForm3461(inputPdfPath, outputPdfPath, item);
      } catch (err) {
        console.warn(`Skipping record ${item.recordID} due to error`);
        continue; // Continue with next record
      }
    }
    console.log('All forms processed');
  } catch (error) {
    console.error('Error processing forms:', error);
  }
})();