// Utility to generate and download a PDF invoice for a sold product
// Uses jsPDF (https://github.com/parallax/jsPDF)
import jsPDF from 'jspdf';

/**
 * Generates and downloads an invoice PDF with product and seller details.
 * @param {Object} product - Product details { serialNumber, name, description, brand }
 * @param {Object} seller - Seller details { name, code, phone, address }
 */
export function generateInvoicePDF(product, consumer) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Product Sale Invoice', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Product Details:', 20, 35);
  doc.setFont('helvetica', 'normal');
  let y = 45;
  doc.text(`Serial Number: ${product.serialNumber || ''}`, 25, y);
  y += 8;
  doc.text(`Product Name: ${product.name || ''}`, 25, y);
  y += 8;
  doc.text(`Description: ${product.description || ''}`, 25, y);
  y += 8;
  doc.text(`Brand: ${product.brand || ''}`, 25, y);
  y += 10;
  doc.setFontSize(13);
  doc.text('Product Timeline:', 20, y);
  y += 8;
  doc.setFontSize(11);
  if (product.timelineArr && Array.isArray(product.timelineArr) && product.timelineArr.length) {
    product.timelineArr.forEach((event, idx) => {
      doc.text(`${idx + 1}. ${event.status}`, 25, y);
      y += 6;
      doc.text(`   Location: ${event.location}`, 28, y);
      y += 6;
      doc.text(`   Date: ${event.date}`, 28, y);
      y += 6;
      if (event.notes) {
        const notesLines = doc.splitTextToSize(`   Notes: ${event.notes}`, 150);
        doc.text(notesLines, 28, y);
        y += notesLines.length * 6;
      }
      y += 2;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  } else if (product.timeline) {
    // fallback to old string timeline
    const lines = doc.splitTextToSize(product.timeline, 160);
    doc.text(lines, 30, y);
    y += lines.length * 7;
  } else {
    doc.text('No timeline available.', 25, y);
    y += 8;
  }
  y += 8;
  doc.setFontSize(12);
  doc.text('Consumer Details:', 20, y);
  y += 10;
  doc.text(`Consumer Code: ${consumer.code || ''}`, 25, y);
  y += 16;
  doc.text(`Date: ${new Date().toLocaleString()}`, 25, y);
  doc.save(`Invoice_${product.serialNumber || 'product'}.pdf`);
}
