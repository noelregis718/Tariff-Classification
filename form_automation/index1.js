const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const Airtable = require('airtable');

// Configure Airtable (replace with your API key, base ID, and table name)
const base = new Airtable({ apiKey: 'REMOVED_SECRET' }).base('REMOVED_BASE_ID');
const tableName = 'Traiff';

// Map Airtable country names to Form 7501 dropdown options
const countryNameMap = {
  'united states': 'United States',
  'usa': 'United States',
  'china': 'China',
  'taiwan': 'Taiwan',
  'malaysia': 'Malaysia',
  'japan': 'Japan',
  'germany': 'Germany',
  'canada': 'Canada',
  'mexico': 'Mexico',
  'india': 'India',
  'south korea': 'Korea, Republic of',
  'korea': 'Korea, Republic of',
  'china or taiwan': 'China', // Default; adjust as needed
  'usa or malaysia': 'United States' // Default; adjust as needed
};

// Sanitize text to remove/replace non-ASCII characters
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  const problematic = text.match(/[^\x00-\x7F]/g);
  if (problematic) console.log('Found non-ASCII characters:', problematic);
  return text
    .replace(/Ω/g, 'Omega')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
}

// Convert country name to dropdown-compatible value
function getCountryName(country, dropdownOptions) {
  if (!country) return '';
  const normalized = country.toLowerCase().trim();
  const countryName = countryNameMap[normalized] || normalized;
  const finalName = dropdownOptions.find(option => 
    option.toLowerCase() === countryName.toLowerCase() || 
    option.toLowerCase().startsWith(normalized)
  ) || '';
  if (!finalName) {
    console.warn(`Country "${country}" not in dropdown options:`, dropdownOptions);
  }
  return finalName;
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

// Fill Form 7501 for a single row
async function fillForm7501(inputPdfPath, outputPdfPath, item) {
  const resolvedInputPath = path.resolve(__dirname, inputPdfPath);
  const fileExists = await fs.access(resolvedInputPath).then(() => true).catch(() => false);
  if (!fileExists) throw new Error(`PDF file not found at: ${resolvedInputPath}`);

  try {
    console.log(`Processing record ${item.recordID}:`, JSON.stringify(item, null, 2));
    const pdfBytes = await fs.readFile(resolvedInputPath);
    console.log(`PDF loaded for record ${item.recordID}, size: ${pdfBytes.length}`);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Get dropdown options for Country of Origin
    const countryField = form.getDropdown('Form[0].P1[0].BirthCountry[0]');
    const countryOptions = countryField.getOptions();
    console.log(`Country dropdown options for record ${item.recordID}:`, countryOptions);

    // Header fields
    const countryName = getCountryName(item.country_of_origin, countryOptions);
    if (countryName) {
      countryField.select(countryName);
    } else {
      console.warn(`Skipping country selection for record ${item.recordID}: Invalid country "${item.country_of_origin}"`);
    }
    // form.getTextField('Form[0].P1[0].ExportCountry[0]').setText(sanitizeText(item.country_of_origin));
    form.getTextField('Form[0].P1[0].manid[0]').setText(item.manufacture_part_number);
    form.getTextField('Form[0].P1[0].refno[0]').setText(item.manufacture_part_number);

    // Metal-related fields
    if (item.material_type.toLowerCase().includes('metal')) {
      form.getTextField('Form[0].P1[0].OMP[0]').setText(sanitizeText(item.country_of_origin));
      form.getTextField('Form[0].P1[0].PCS[0]').setText(sanitizeText(item.country_of_origin));
      form.getTextField('Form[0].P1[0].CC[0]').setText(sanitizeText(item.country_of_origin));
    }

    // Line Item: Line 001
    const description = sanitizeText(
      `${item.final_generated_part_description} - ${item.material_type}, RoHS: ${item.rohs_compliance}, ECCN: ${item.eccn}`
    );
    form.getTextField('Form[0].P1[0].lineno1[0]').setText('001');
    form.getTextField('Form[0].P1[0].descriptiona1[0]').setText(item.final_hts_code);
    form.getTextField('Form[0].P1[0].descriptionb1[0]').setText('');
    form.getTextField('Form[0].P1[0].descriptionc1[0]').setText(description);

    // Save PDF
    const filledBytes = await pdfDoc.save();
    await fs.writeFile(outputPdfPath, filledBytes);
    console.log(`Form saved to: ${outputPdfPath}`);
  } catch (err) {
    console.error(`Error filling form for record ${item.recordID}:`, err);
    throw err;
  }
}

// Main execution: One PDF per row
(async () => {
  try {
    const lineItems = await fetchData();
    if (!lineItems.length) throw new Error('No data fetched from Airtable');
    console.log(`Fetched ${lineItems.length} records`);

    const inputPdfPath = 'template/form_7501.pdf';
    for (const item of lineItems) {
      const safeFileName = item.manufacture_part_number.replace(/[^a-zA-Z0-9-_]/g, '_') || item.recordID;
      const outputPdfPath = path.resolve(__dirname, `result/filled_7501_${safeFileName}.pdf`);
      try {
        await fillForm7501(inputPdfPath, outputPdfPath, item);
      } catch (err) {
        console.warn(`Skipping record ${item.recordID} due to error`);
        continue;
      }
    }
    console.log('All forms processed');
  } catch (error) {
    console.error('Error processing forms:', error);
  }
})();