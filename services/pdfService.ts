// These are declared globally in index.html from CDN
declare const pdfjsLib: any;
declare const PDFLib: any;

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const { PDFDocument } = PDFLib;
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
};

export const splitPdf = async (
  file: File,
  pageNumbers: number[]
): Promise<Uint8Array> => {
  const { PDFDocument } = PDFLib;
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // pageNumbers are 1-based, convert to 0-based indices
  const indices = pageNumbers.map((n) => n - 1);

  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
};

export const getPdfPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdfDoc.numPages;
};

export const renderPdfPageToCanvas = async (
  file: File,
  pageNumber: number,
  canvas: HTMLCanvasElement
): Promise<void> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdfDoc.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 0.5 }); // Use a smaller scale for thumbnails
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport: viewport }).promise;
};

export const extractTextFromPage = async (
  file: File,
  pageNumber: number
): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
};

export const extractTextFromAllPages = async (file: File): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;
  const allText: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    // Add page number for context, making the output easier to navigate
    allText.push(`--- Page ${i} ---\n\n${pageText}\n\n`); 
  }

  return allText.join('');
};