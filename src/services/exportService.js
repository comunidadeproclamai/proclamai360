import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Utilitários gerais para Exportação (Excel e PDF)
 */

const getChurchHeader = () => {
  return [
    ['PROCLAMAI 360 - Sistema de Gestão'],
    [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
    [''],
  ];
};

// ─── Excel ───────────────────────────────────────────────────

export function exportToExcel(data, columns, filename = 'exportacao.xlsx') {
  // 1. Prepara cabeçalho institucional
  const wsData = [...getChurchHeader()];

  // 2. Prepara cabeçalho da tabela
  const headerRow = columns.map(c => c.label);
  wsData.push(headerRow);

  // 3. Mapeia os dados
  data.forEach((row) => {
    const rowData = columns.map(c => {
      let val = row[c.key];
      // Se tiver render customizado pra export ou fallback pro render original (se string/number)
      if (c.exportRender) val = c.exportRender(val, row);
      return val ?? '';
    });
    wsData.push(rowData);
  });

  // 4. Cria a planilha
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Estilização básica (largura das colunas)
  const wscols = columns.map(() => ({ wch: 20 }));
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  
  // 5. Salva o arquivo
  XLSX.writeFile(wb, filename);
}

// ─── PDF ─────────────────────────────────────────────────────

export function exportToPDF(data, columns, title = 'Relatório', filename = 'relatorio.pdf') {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Header do documento
  doc.setFontSize(16);
  doc.setTextColor(92, 6, 30); // Wine
  doc.text('Proclamai 360', 14, 15);
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

  // Mapeia colunas para autotable
  const head = [columns.map(c => c.label)];
  
  const body = data.map(row => {
    return columns.map(c => {
      let val = row[c.key];
      if (c.exportRender) val = c.exportRender(val, row);
      return val ?? '';
    });
  });

  doc.autoTable({
    startY: 35,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [92, 6, 30] }, // Wine
    styles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 248, 245] },
  });

  doc.save(filename);
}
