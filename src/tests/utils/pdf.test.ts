import { describe, it, expect, vi } from 'vitest';
import { generateInspectionPDF, generateRenewalPDF } from '../../utils/pdf';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    addImage: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    setPage: vi.fn(),
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
      },
    },
    save: vi.fn(),
  })),
}));

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('PDF Generation', () => {
  describe('generateInspectionPDF', () => {
    const mockInspection = {
      inspection_date: '2024-03-15',
      location: 'Test Location',
      inspector: 'John Doe',
      status: 'completed',
      notes: 'Test notes',
      cover_page: true,
    };

    const mockItems = [
      {
        item_type: 'Fire Extinguisher',
        floor: '1',
        room: '101',
        equipment_type: '5ABC',
        status: 'pass',
        notes: 'Test item',
      },
    ];

    it('generates PDF with cover page when specified', async () => {
      await generateInspectionPDF({
        inspection: mockInspection,
        items: mockItems,
        clientName: 'Test Client',
        includeCoverPage: true,
      });

      expect(jsPDF).toHaveBeenCalled();
      // Verify cover page content
      const mockPDF = (jsPDF as any).mock.results[0].value;
      expect(mockPDF.setFontSize).toHaveBeenCalledWith(24);
      expect(mockPDF.text).toHaveBeenCalledWith("Jac's Fire Protection", expect.any(Number), expect.any(Number), expect.any(Object));
    });

    it('generates PDF without cover page', async () => {
      await generateInspectionPDF({
        inspection: mockInspection,
        items: mockItems,
        clientName: 'Test Client',
        includeCoverPage: false,
      });

      expect(jsPDF).toHaveBeenCalled();
      const mockPDF = (jsPDF as any).mock.results[0].value;
      expect(mockPDF.addPage).not.toHaveBeenCalled();
    });

    it('includes inspection items in table format', async () => {
      await generateInspectionPDF({
        inspection: mockInspection,
        items: mockItems,
        clientName: 'Test Client',
      });

      expect(require('jspdf-autotable').default).toHaveBeenCalled();
    });
  });

  describe('generateRenewalPDF', () => {
    const mockClient = {
      name: 'Test Client',
      point_of_contact: 'John Doe',
      phone: '123-456-7890',
      email: 'test@example.com',
      contract_end: '2024-12-31',
      contract_amount: 1000,
      inspection_type: 'FE',
      frequency: 'Annual',
    };

    it('generates renewal PDF with client information', async () => {
      await generateRenewalPDF({
        client: mockClient,
        monthName: 'March 2024',
      });

      expect(jsPDF).toHaveBeenCalled();
      const mockPDF = (jsPDF as any).mock.results[0].value;
      expect(mockPDF.setFontSize).toHaveBeenCalledWith(24);
      expect(mockPDF.text).toHaveBeenCalledWith("Jac's Fire Protection", expect.any(Number), expect.any(Number), expect.any(Object));
    });

    it('includes contract details in renewal PDF', async () => {
      await generateRenewalPDF({
        client: mockClient,
        monthName: 'March 2024',
      });

      const mockPDF = (jsPDF as any).mock.results[0].value;
      expect(mockPDF.text).toHaveBeenCalledWith('Contract Amount:', expect.any(Number), expect.any(Number));
      expect(mockPDF.text).toHaveBeenCalledWith('Contract End:', expect.any(Number), expect.any(Number));
    });
  });
});