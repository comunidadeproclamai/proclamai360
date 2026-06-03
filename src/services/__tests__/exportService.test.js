import { describe, it, expect, vi } from 'vitest';
import { exportToExcel, exportToPDF } from '../exportService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

vi.mock('xlsx', () => {
  const utilsMock = {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  };
  return {
    __esModule: true,
    utils: utilsMock,
    writeFile: vi.fn(),
  };
});

vi.mock('jspdf', () => {
  const mockDoc = {
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    autoTable: vi.fn(),
    save: vi.fn(),
  };
  const jsPDFMock = vi.fn(function() { return mockDoc; });
  return {
    default: jsPDFMock,
    jsPDF: jsPDFMock
  };
});

describe('exportService', () => {
  const mockData = [
    { id: 1, name: 'João Silva', role: 'Membro', amount: 150.5 },
    { id: 2, name: 'Maria Souza', role: 'Admin', amount: 200.0 },
  ];

  const mockColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'role', label: 'Cargo' },
    { key: 'amount', label: 'Valor', exportRender: (val) => `R$ ${val.toFixed(2)}` },
  ];

  describe('exportToExcel', () => {
    it('calls XLSX utilities to generate file', () => {
      exportToExcel(mockData, mockColumns, 'test.xlsx');

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'test.xlsx');
    });
  });

  describe('exportToPDF', () => {
    it('calls jsPDF methods to generate document', () => {
      exportToPDF(mockData, mockColumns, 'Test PDF', 'test.pdf');

      expect(jsPDF).toHaveBeenCalledWith({ orientation: 'landscape' });
      
      const mockDoc = jsPDF.mock.results[0].value;
      expect(mockDoc.text).toHaveBeenCalledWith('Proclamai 360', 14, 15);
      expect(mockDoc.text).toHaveBeenCalledWith('Test PDF', 14, 22);
      expect(mockDoc.autoTable).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalledWith('test.pdf');
    });
  });
});
