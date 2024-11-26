import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Flame } from 'lucide-react';

interface PDFReportProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  orientation?: 'portrait' | 'landscape';
  includeCoverPage?: boolean;
  clientName: string;
  location: string;
  inspector: string;
  date: Date;
}

const PDFReport: React.FC<PDFReportProps> = ({
  data,
  orientation = 'portrait',
  includeCoverPage = true,
  clientName,
  location,
  inspector,
  date,
}) => {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });

    if (includeCoverPage) {
      // Add cover page
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add logo
      doc.addImage('/logo.png', 'PNG', 20, 20, 40, 25);

      // Add company header
      doc.setFontSize(24);
      doc.setTextColor(220, 38, 38); // Red color
      doc.text("Jac's Fire Protection", pageWidth / 2, 60, { align: 'center' });

      // Add company info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('123 Main Street, Anytown, USA', pageWidth / 2, 70, {
        align: 'center',
      });
      doc.text('(555) 123-4567 | info@jacsfire.com', pageWidth / 2, 75, {
        align: 'center',
      });
      doc.text('www.jacsfire.com', pageWidth / 2, 80, { align: 'center' });

      // Add inspection details
      doc.setFontSize(14);
      doc.text('Inspection Report', pageWidth / 2, pageHeight / 2 - 40, {
        align: 'center',
      });

      const detailsX = pageWidth / 2 - 40;
      const detailsY = pageHeight / 2 - 20;

      doc.setFontSize(12);
      doc.text('Client:', detailsX, detailsY);
      doc.text(clientName, detailsX + 50, detailsY);

      doc.text('Location:', detailsX, detailsY + 10);
      doc.text(location, detailsX + 50, detailsY + 10);

      doc.text('Inspector:', detailsX, detailsY + 20);
      doc.text(inspector, detailsX + 50, detailsY + 20);

      doc.text('Date:', detailsX, detailsY + 30);
      doc.text(format(date, 'MMMM d, yyyy'), detailsX + 50, detailsY + 30);

      // Add new page for the table
      doc.addPage();
    }

    // Add table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      head: [['Item', 'Location', 'Type', 'Status', 'Notes']],
      body: data.map((item) => [
        item.name,
        `${item.floor} - ${item.room}`,
        item.type,
        item.status,
        item.notes || '',
      ]),
      startY: includeCoverPage ? 20 : 40,
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    });

    // Save the PDF
    doc.save(`inspection-report-${format(date, 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
    >
      <Flame className='w-5 h-5 mr-2' />
      Generate PDF Report
    </button>
  );
};

export default PDFReport;
