const { PDFDocument } = require('pdf-lib');
const fsPromises = require('fs').promises;
const path = require('path');
const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

// Create output directories
const outputDir3461 = path.join(__dirname, '../filled_forms', '3461');
const outputDir7501 = path.join(__dirname, '../filled_forms', '7501');
fsPromises.mkdir(outputDir3461, { recursive: true }).catch(err => console.error('Failed to create 3461 directory:', err));
fsPromises.mkdir(outputDir7501, { recursive: true }).catch(err => console.error('Failed to create 7501 directory:', err));

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

// Fetch all data from Airtable
async function fetchData() {
  try {
    const records = await base(tableName).select().all();
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
async function fillForm3461(inputPdfPath, item) {
  const resolvedInputPath = path.resolve(__dirname, inputPdfPath);
  const fileExists = await fsPromises.access(resolvedInputPath).then(() => true).catch(() => false);
  if (!fileExists) throw new Error(`PDF file not found at: ${resolvedInputPath}`);

  const safeFileName = item.manufacture_part_number.replace(/[^a-zA-Z0-9-_]/g, '_') || item.recordID;
  const outputPdfPath = path.join(outputDir3461, `filled_3461_${safeFileName}.pdf`);

  try {
    const pdfBytes = await fsPromises.readFile(resolvedInputPath);
    console.log(`PDF 3461 loaded for record ${item.recordID}, size: ${pdfBytes.length}`);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Header
    form.getTextField('F[0].P1[0].ReferenceNo[0]').setText(item.manufacture_part_number);
    form.getTextField('F[0].P1[0].ReferenceID[0]').setText('PART');
    form.getCheckBox('F[0].P1[0].PartyType1[3]').check();
    form.getTextField('F[0].P1[0].TextField1[2]').setText(item.distributor);
    form.getTextField('F[0].P1[0].CBPAssigned[0]').setText(item.manufacture_part_number);

    // Line A
    const description = sanitizeText(`${item.final_generated_part_description} - ${item.material_type}, RoHS: ${item.rohs_compliance}, ECCN: ${item.eccn}`);
    form.getTextField('F[0].p2[0].HTSCode1A[0]').setText(item.final_hts_code);
    form.getTextField('F[0].p2[0].CountryOriginA[0]').setText(item.country_of_origin);
    form.getTextField('F[0].p2[0].Descriptiona[0]').setText(description);
    form.getCheckBox('F[0].p2[0].HTS1LINE1A[0]').check();
    form.getCheckBox('F[0].p2[0].LinePartyType1LINE1A[3]').check();
    form.getTextField('F[0].p2[0].HeaderIDA[0]').setText(item.manufacture_part_number);
    if (item.material_type.toLowerCase().includes('metal')) {
      form.getTextField('F[0].p2[0].CountryofMiningA[0]').setText(item.country_of_origin);
    } else {
      form.getCheckBox('F[0].p2[0].CountryofMiningA[1]').check();
    }

    const filledBytes = await pdfDoc.save();
    await fsPromises.writeFile(outputPdfPath, filledBytes);
    console.log(`Form 3461 saved to: ${outputPdfPath}`);
    return outputPdfPath;
  } catch (err) {
    console.error(`Error filling Form 3461 for record ${item.recordID}:`, err);
    throw err;
  }
}

// Fill Form 7501 for a single row
async function fillForm7501(inputPdfPath, item) {
  const resolvedInputPath = path.resolve(__dirname, inputPdfPath);
  const fileExists = await fsPromises.access(resolvedInputPath).then(() => true).catch(() => false);
  if (!fileExists) throw new Error(`PDF file not found at: ${resolvedInputPath}`);

  const safeFileName = item.manufacture_part_number.replace(/[^a-zA-Z0-9-_]/g, '_') || item.recordID;
  const outputPdfPath = path.join(outputDir7501, `filled_7501_${safeFileName}.pdf`);

  try {
    const pdfBytes = await fsPromises.readFile(resolvedInputPath);
    console.log(`PDF 7501 loaded for record ${item.recordID}, size: ${pdfBytes.length}`);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Country dropdown
    const countryField = form.getDropdown('Form[0].P1[0].BirthCountry[0]');
    const countryOptions = countryField.getOptions();
    console.log(`Country dropdown options for record ${item.recordID}:`, countryOptions);
    const countryName = getCountryName(item.country_of_origin, countryOptions);
    if (countryName) {
      countryField.select(countryName);
    } else {
      console.warn(`Skipping country selection for record ${item.recordID}: Invalid country "${item.country_of_origin}"`);
    }

    // Header
    // form.getTextField('Form[0].P1[0].ExportCountry[0]').setText(sanitizeText(item.country_of_origin));
    form.getTextField('Form[0].P1[0].manid[0]').setText(item.manufacture_part_number);
    form.getTextField('Form[0].P1[0].refno[0]').setText(item.manufacture_part_number);
    if (item.material_type.toLowerCase().includes('metal')) {
      form.getTextField('Form[0].P1[0].OMP[0]').setText(sanitizeText(item.country_of_origin));
      form.getTextField('Form[0].P1[0].PCS[0]').setText(sanitizeText(item.country_of_origin));
      form.getTextField('Form[0].P1[0].CC[0]').setText(sanitizeText(item.country_of_origin));
    }

    // Line 001
    const description = sanitizeText(`${item.final_generated_part_description} - ${item.material_type}, RoHS: ${item.rohs_compliance}, ECCN: ${item.eccn}`);
    form.getTextField('Form[0].P1[0].lineno1[0]').setText('001');
    form.getTextField('Form[0].P1[0].descriptiona1[0]').setText(item.final_hts_code);
    form.getTextField('Form[0].P1[0].descriptionb1[0]').setText('');
    form.getTextField('Form[0].P1[0].descriptionc1[0]').setText(description);

    const filledBytes = await pdfDoc.save();
    await fsPromises.writeFile(outputPdfPath, filledBytes);
    console.log(`Form 7501 saved to: ${outputPdfPath}`);
    return outputPdfPath;
  } catch (err) {
    console.error(`Error filling Form 7501 for record ${item.recordID}:`, err);
    throw err;
  }
}

// Endpoint for Form 3461
const fill3461=async (req, res) => {
  try {
    const lineItems = await fetchData();
    console.log(`Fetched ${lineItems.length} records for Form 3461`);
    const filledFiles = [];

    for (const item of lineItems) {
      try {
        const filePath = await fillForm3461('../template/form_3461.pdf', item);
        filledFiles.push(filePath);
      } catch (err) {
        console.warn(`Skipping Form 3461 for record ${item.recordID}`);
        continue;
      }
    }

    res.status(200).json({
      message: `Forms 3461 filled successfully (${filledFiles.length}/${lineItems.length} records)`,
      files: filledFiles
    });
  } catch (error) {
    console.error('Error filling Form 3461:', error);
    res.status(500).json({ error: 'Failed to fill Form 3461' });
  }
};

// Endpoint for Form 7501
const fill7501=async (req, res) => {
  try {
    const lineItems = await fetchData();
    console.log(`Fetched ${lineItems.length} records for Form 7501`);
    const filledFiles = [];

    for (const item of lineItems) {
      try {
        const filePath = await fillForm7501('../template/form_7501.pdf', item);
        filledFiles.push(filePath);
      } catch (err) {
        console.warn(`Skipping Form 7501 for record ${item.recordID}`);
        continue;
      }
    }

    res.status(200).json({
      message: `Forms 7501 filled successfully (${filledFiles.length}/${lineItems.length} records)`,
      files: filledFiles
    });
  } catch (error) {
    console.error('Error filling Form 7501:', error);
    res.status(500).json({ error: 'Failed to fill Form 7501' });
  }
};

module.exports = {
  fill7501,
  fill3461
};
