// Multi-page PDF export: captures a DOM element via html2canvas,
// slices the resulting image into A4 pages, and saves as PDF.
// Arabic RTL content is preserved as-rendered (bitmap approach).

export async function exportToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    // Ensure full height is captured
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const A4_W_MM = 210;
  const A4_H_MM = 297;
  const MARGIN_MM = 12; // side margins for readability

  const contentW = A4_W_MM - MARGIN_MM * 2;
  const imgH_MM = (canvas.height / canvas.width) * contentW;
  const imgData = canvas.toDataURL('image/jpeg', 0.93);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageContentH = A4_H_MM - MARGIN_MM * 2; // printable height per page

  let yConsumed = 0; // mm of image already placed on previous pages

  while (yConsumed < imgH_MM) {
    if (yConsumed > 0) pdf.addPage();

    // Clip to current page: addImage with negative offset shifts the image up
    // so only the current slice falls within the page bounds
    pdf.addImage(
      imgData,
      'JPEG',
      MARGIN_MM,
      MARGIN_MM - yConsumed,
      contentW,
      imgH_MM
    );

    yConsumed += pageContentH;
  }

  pdf.save(filename);
}
