import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { InspectionItem } from '../types/inspection';
import { BasicCompanyInfo } from '../types/companyInfo';

// In case that image is in svg format, this function coverts svg to png
// so the image can be coverted and used at line 57
// const convertSvgToPng = async (svgUrl: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.src = svgUrl;
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return reject(new Error('Canvas context not available'));
//       ctx.drawImage(img, 0, 0);
//       resolve(canvas.toDataURL('image/png'));
//     };
//     img.onerror = (err) => reject(err);
//   });
// };

interface GeneratePDFParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inspection: any;
  items: InspectionItem[];
  clientName: string;
  includeCoverPage?: boolean;
  companyInfo?: BasicCompanyInfo;
}

export const generateInspectionPDF = async ({
  inspection,
  items,
  clientName,
  includeCoverPage = false,
}: GeneratePDFParams) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    // const pageHeight = doc.internal.pageSize.getHeight();

    if (includeCoverPage) {
      // Add logo
      // const logoUrl = '/logo.svg';
      const logoPng = '/logo.png';
      const logoWidth = 28;
      const logoHeight = 12;
      const logoX = pageWidth / 2 - logoWidth / 2;
      const logoY = 10;

      try {
        // const logoPng = await convertSvgToPng(logoUrl);
        doc.addImage(logoPng, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.error('Failed to load and convert logo:', error);
      }

      // Add cover page
      doc.setFontSize(24);
      doc.setTextColor(220, 38, 38); // Red color
      doc.text("Jac's Fire Protection", pageWidth / 2, 40, { align: 'center' });

      // Add company info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Professional Fire Safety Management', pageWidth / 2, 55, {
        align: 'center',
      });

      // Add inspection details
      const details = [
        ['Client:', clientName],
        ['Date:', format(new Date(inspection.inspection_date), 'MMMM d, yyyy')],
        ['Location:', inspection.location],
        ['Inspector:', inspection.inspector],
        [
          'Status:',
          inspection.status.charAt(0).toUpperCase() +
            inspection.status.slice(1),
        ],
      ];

      let yPos = 80;
      details.forEach(([label, value]) => {
        doc.text(label, pageWidth / 2 - 40, yPos);
        doc.text(value, pageWidth / 2 + 10, yPos);
        yPos += 10;
      });

      // Add notes if they exist
      if (inspection.notes) {
        yPos += 10;
        doc.text('Notes:', pageWidth / 2 - 40, yPos);
        const splitNotes = doc.splitTextToSize(inspection.notes, 100);
        doc.text(splitNotes, pageWidth / 2 + 10, yPos);
      }

      // Add new page for items
      doc.addPage();
    }

    // Add header with company and client information
    doc.setFontSize(12);
    doc.setTextColor(0);

    const headerTop = 10;
    const leftColumnX = 20;
    const rightColumnX = pageWidth / 2 + 10;
    let currentY = headerTop;

    const logoWidth = 50;
    const logoHeight = 35;
    const logoX = leftColumnX;
    const logoY = currentY - 5;

    try {
      const logoPng = '/logo.png';
      doc.addImage(logoPng, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.error('Failed to load logo:', error);
    }

    // Client Info (desna strana)
    currentY = headerTop;
    doc.text('Client Information:', rightColumnX, currentY);
    currentY += 6;
    doc.text(`Name: ${clientName}`, rightColumnX, currentY);
    currentY += 6;
    doc.text(
      `Location: ${inspection.location || 'N/A'}`,
      rightColumnX,
      currentY
    );
    currentY += 6;
    doc.text(
      `Date: ${format(new Date(inspection.inspection_date), 'MMMM d, yyyy')}`,
      rightColumnX,
      currentY
    );
    currentY += 6;
    doc.text(
      `Inspector: ${inspection.inspector || 'N/A'}`,
      rightColumnX,
      currentY
    );
    currentY += 6;
    doc.text(
      `Status: ${
        inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)
      }`,
      rightColumnX,
      currentY
    );

    const lineY = currentY + 6;
    doc.line(20, lineY, pageWidth - 20, lineY);

    autoTable(doc, {
      head: [['Location', 'Equipment Type', 'Status', 'Notes']],
      body: items.map((item) => [
        `${item.floor || ''} ${item.room || ''}`.trim() || 'N/A',
        item.equipment_type,
        item.status.toUpperCase(),
        item.notes || '',
      ]),
      startY: lineY + 6,
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        format(new Date(), 'MMMM d, yyyy h:mm a'),
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    // Save the PDF
    doc.save(
      `inspection-${format(
        new Date(inspection.inspection_date),
        'yyyy-MM-dd'
      )}-${clientName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generateRenewalPDF = async ({
  client,
  monthName,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  monthName: string;
}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add header
    doc.setFontSize(24);
    doc.setTextColor(220, 38, 38); // Red color
    doc.text("Jac's Fire Protection", pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Contract Renewal Notice', pageWidth / 2, 60, { align: 'center' });
    doc.text(monthName, pageWidth / 2, 70, { align: 'center' });

    // Add client details
    const details = [
      ['Client:', client.name],
      ['Contact:', client.point_of_contact || 'N/A'],
      ['Phone:', client.phone || 'N/A'],
      ['Email:', client.email || 'N/A'],
      [
        'Address:',
        [client.street_address, client.city, client.state, client.zip_code]
          .filter(Boolean)
          .join(', '),
      ],
      ['Contract Amount:', formatCurrency(client.contract_amount || 0)],
      ['Contract End:', format(new Date(client.contract_end), 'MMMM d, yyyy')],
      ['Inspection Types:', client.inspection_types?.join(', ') || 'N/A'],
      ['Frequency:', client.frequency || 'N/A'],
    ];

    let yPos = 90;
    doc.setFontSize(12);
    details.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.text(value.toString(), 80, yPos);
      yPos += 10;
    });

    // Add notes if they exist
    if (client.notes) {
      yPos += 10;
      doc.text('Notes:', 20, yPos);
      const splitNotes = doc.splitTextToSize(client.notes, pageWidth - 40);
      doc.text(splitNotes, 20, yPos + 10);
    }

    // Add footer
    doc.setFontSize(10);
    doc.text(
      `Generated on ${format(new Date(), 'MMMM d, yyyy')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );

    // Save the PDF
    doc.save(
      `renewal-${format(new Date(client.contract_end), 'yyyy-MM')}-${client.name
        .toLowerCase()
        .replace(/\s+/g, '-')}.pdf`
    );
  } catch (error) {
    console.error('Error generating renewal PDF:', error);
    throw new Error('Failed to generate renewal PDF');
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
