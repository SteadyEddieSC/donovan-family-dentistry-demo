import { readFile, writeFile } from 'node:fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const formPath = new URL('../public/forms/new-patient-medical-history.pdf', import.meta.url);
const targetY = 389;
const targetHeight = 17;
const tolerance = 0.05;
const fields = [
  { name: 'account_phone', x: 44, width: 176, label: 'Phone', labelX: 44 },
  { name: 'account_dob', x: 236, width: 174, label: 'Date of birth', labelX: 236 },
  { name: 'account_marital_status', x: 426, width: 142, label: 'Marital status', labelX: 426 }
];

const input = await readFile(formPath);
const pdf = await PDFDocument.load(input, { updateMetadata: false });
const form = pdf.getForm();
const page = pdf.getPages()[0];

const widgets = fields.map((field) => {
  const textField = form.getTextField(field.name);
  const widget = textField.acroField.getWidgets()[0];
  if (!widget) throw new Error(`Missing widget for ${field.name}`);
  return { ...field, textField, widget, rect: widget.getRectangle() };
});

const alreadyPatched = widgets.every(({ rect, x, width }) =>
  Math.abs(rect.x - x) < tolerance &&
  Math.abs(rect.y - targetY) < tolerance &&
  Math.abs(rect.width - width) < tolerance &&
  Math.abs(rect.height - targetHeight) < tolerance
);

if (alreadyPatched) {
  console.log('Patient form responsible-party row already patched.');
  process.exit(0);
}

// Cover the prior label row before drawing the corrected labels. Form widgets render
// above page content, so the moved fields retain their consistent border and fill.
page.drawRectangle({
  x: 40,
  y: 405.5,
  width: 532,
  height: 17.5,
  color: rgb(247 / 255, 250 / 255, 250 / 255)
});

const labelFont = await pdf.embedFont(StandardFonts.HelveticaBold);
for (const field of widgets) {
  page.drawText(field.label, {
    x: field.labelX,
    y: 413,
    size: 7.1,
    font: labelFont,
    color: rgb(23 / 255, 35 / 255, 45 / 255)
  });
  field.widget.setRectangle({
    x: field.x,
    y: targetY,
    width: field.width,
    height: targetHeight
  });
}

const appearanceFont = await pdf.embedFont(StandardFonts.Helvetica);
form.updateFieldAppearances(appearanceFont);
pdf.setCreator('Donovan Family Dentistry release 8 PDF patch');
pdf.setProducer('pdf-lib');

const output = await pdf.save({ useObjectStreams: false });
await writeFile(formPath, output);

// Re-open and enforce the release geometry as a build gate.
const verifiedPdf = await PDFDocument.load(output, { updateMetadata: false });
const verifiedForm = verifiedPdf.getForm();
for (const field of fields) {
  const rect = verifiedForm.getTextField(field.name).acroField.getWidgets()[0]?.getRectangle();
  if (!rect) throw new Error(`Verification failed: missing ${field.name}`);
  if (
    Math.abs(rect.x - field.x) >= tolerance ||
    Math.abs(rect.y - targetY) >= tolerance ||
    Math.abs(rect.width - field.width) >= tolerance ||
    Math.abs(rect.height - targetHeight) >= tolerance
  ) {
    throw new Error(`Verification failed for ${field.name}: ${JSON.stringify(rect)}`);
  }
}

console.log(`Patched patient form responsible-party row (${output.length} bytes).`);
