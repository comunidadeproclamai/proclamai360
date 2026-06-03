import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { FormRow } from '../../../components/forms/FormRow.jsx';
import { SelectField } from '../../../components/forms/SelectField.jsx';
import { formatCurrency } from '../../../utils/currency.js';

export function ImportTransactionsModal({ isOpen, onClose, supportData, onImport, isSubmitting }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [defaultAccountId, setDefaultAccountId] = useState('');
  const [inflowCategoryId, setInflowCategoryId] = useState('');
  const [outflowCategoryId, setOutflowCategoryId] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays first to find headers
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawData.length < 2) throw new Error('Arquivo vazio ou inválido.');

        // Find header row (usually the first row with mostly strings, or a row containing "data" and "valor")
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(20, rawData.length); i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;
          const text = row.map(c => String(c).toLowerCase().trim()).join(' ');
          if (text.includes('data') && (text.includes('valor') || text.includes('descri'))) {
            headerRowIndex = i;
            break;
          }
        }
        
        if (headerRowIndex === -1) headerRowIndex = 0;
        
        const headers = rawData[headerRowIndex].map(h => String(h || '').toLowerCase().trim());
        
        // Try to identify columns
        let dateIdx = headers.findIndex(h => h === 'data' || h === 'data de criação' || h.includes('dat'));
        let descIdx = headers.findIndex(h => h === 'descrição' || h.includes('descri') || h === 'histórico' || h.includes('detalhe') || h === 'nome do pagador');
        let valIdx = headers.findIndex(h => h === 'valor líquido' || h === 'valor da transação' || h === 'valor' || h.includes('val'));
        let typeIdx = headers.findIndex(h => h.includes('tip') || h.includes('oper') || h.includes('mov') || h.includes('status'));

        // If 'nome do pagador' exists, let's also grab 'descrição' if possible
        if (descIdx === -1) {
          descIdx = headers.findIndex(h => h === 'contraparte' || h.includes('origem'));
        }

        // Fallback if columns not found explicitly
        if (dateIdx === -1) dateIdx = 0;
        if (descIdx === -1) descIdx = 1;
        if (valIdx === -1) valIdx = 2;

        const transactions = [];

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;

          let dateVal = row[dateIdx];
          let descVal = row[descIdx];
          let amountVal = row[valIdx];
          let typeVal = typeIdx !== -1 ? String(row[typeIdx]).toLowerCase() : '';

          if (!dateVal || !amountVal) continue; // Skip invalid rows

          // Parse Amount
          let amount = 0;
          if (typeof amountVal === 'number') {
            amount = amountVal;
          } else {
            // "R$ 1.500,00" -> 1500.00
            const cleanStr = String(amountVal).replace(/[^0-9,-]/g, '').replace(',', '.');
            amount = parseFloat(cleanStr);
          }

          if (isNaN(amount) || amount === 0) continue;

          // Determine Type
          let type = 'INFLOW';
          if (amount < 0) {
            type = 'OUTFLOW';
          } else if (typeVal.includes('saíd') || typeVal.includes('said') || typeVal.includes('desp') || typeVal.includes('deb') || typeVal.includes('pag') || typeVal.includes('tarif')) {
            type = 'OUTFLOW';
          }

          amount = Math.abs(amount);

          // Parse Date (XLSX sometimes returns date serials)
          let date;
          if (typeof dateVal === 'number') {
            date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
          } else {
            // Try to parse 'DD/MM/YYYY'
            const parts = String(dateVal).split('/');
            if (parts.length === 3) {
              date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
            } else {
              date = new Date(dateVal);
            }
          }

          if (isNaN(date.getTime())) date = new Date();

          transactions.push({
            id: i,
            date: date.toISOString().slice(0, 10),
            description: String(descVal || 'Importado').substring(0, 200),
            amount,
            type
          });
        }

        setParsedData(transactions);
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Erro ao ler o arquivo. Verifique o formato.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    if (!defaultAccountId) return alert('Selecione uma conta padrão.');
    
    // Check if we have mapped all categories needed
    const hasInflow = parsedData.some(t => t.type === 'INFLOW');
    const hasOutflow = parsedData.some(t => t.type === 'OUTFLOW');

    if (hasInflow && !inflowCategoryId) return alert('Selecione uma categoria para as receitas.');
    if (hasOutflow && !outflowCategoryId) return alert('Selecione uma categoria para as despesas.');

    const finalPayload = parsedData.map(t => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      accountId: defaultAccountId,
      categoryId: t.type === 'INFLOW' ? inflowCategoryId : outflowCategoryId
    }));

    onImport(finalPayload);
  };

  if (!isOpen) return null;

  return (
    <Modal title="Importar Extrato (CSV / Excel)" isOpen={isOpen} onClose={onClose} size="lg">
      <Container>
        {!file ? (
          <UploadArea onClick={() => fileInputRef.current?.click()}>
            <Upload size={40} color="#c5a55c" />
            <h3>Clique para selecionar um arquivo</h3>
            <p>Formatos suportados: .csv, .xlsx, .xls</p>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
              O sistema tentará reconhecer automaticamente as colunas de Data, Descrição e Valor.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
          </UploadArea>
        ) : (
          <ReviewArea>
            <ReviewHeader>
              <div>
                <strong>Arquivo:</strong> {file.name}
              </div>
              <ChangeFileBtn onClick={() => { setFile(null); setParsedData([]); }}>
                <X size={14} /> Trocar
              </ChangeFileBtn>
            </ReviewHeader>

            {parsedData.length === 0 ? (
              <WarningBox>
                <AlertCircle size={20} />
                Nenhuma transação válida encontrada. Verifique se a planilha possui colunas de Data, Descrição e Valor.
              </WarningBox>
            ) : (
              <>
                <ConfigsGrid>
                  <FormRow>
                    <SelectField 
                      label="Conta Padrão (Destino/Origem)"
                      value={defaultAccountId} 
                      onChange={e => setDefaultAccountId(e.target.value)}
                      placeholder="Selecione uma conta..."
                      options={supportData.accounts.map(acc => ({ label: acc.name, value: acc.id }))}
                    />
                  </FormRow>

                  <FormRow>
                    <SelectField 
                      label="Categoria para Receitas"
                      value={inflowCategoryId} 
                      onChange={e => setInflowCategoryId(e.target.value)}
                      placeholder="Selecione..."
                      options={supportData.categories.filter(c => c.type === 'INFLOW').map(cat => ({ label: cat.name, value: cat.id }))}
                    />
                  </FormRow>

                  <FormRow>
                    <SelectField 
                      label="Categoria para Despesas"
                      value={outflowCategoryId} 
                      onChange={e => setOutflowCategoryId(e.target.value)}
                      placeholder="Selecione..."
                      options={supportData.categories.filter(c => c.type === 'OUTFLOW').map(cat => ({ label: cat.name, value: cat.id }))}
                    />
                  </FormRow>
                </ConfigsGrid>

                <DataPreview>
                  <p>{parsedData.length} transações prontas para importar:</p>
                  <PreviewTable>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 50).map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.date.split('-').reverse().join('/')}</td>
                          <td>{row.description}</td>
                          <td>
                            <TypeTag $type={row.type}>
                              {row.type === 'INFLOW' ? 'RECEITA' : 'DESPESA'}
                            </TypeTag>
                          </td>
                          <td style={{ color: row.type === 'INFLOW' ? '#3ca876' : '#df5353' }}>
                            {formatCurrency(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </PreviewTable>
                  {parsedData.length > 50 && <p className="more-text">+ {parsedData.length - 50} ocultas na prévia</p>}
                </DataPreview>

                <Actions>
                  <CancelBtn onClick={onClose} disabled={isSubmitting}>Cancelar</CancelBtn>
                  <ConfirmBtn onClick={handleConfirm} disabled={isSubmitting || !defaultAccountId}>
                    {isSubmitting ? 'Importando...' : (
                      <><Check size={18} /> Confirmar Importação ({parsedData.length})</>
                    )}
                  </ConfirmBtn>
                </Actions>
              </>
            )}
          </ReviewArea>
        )}
      </Container>
    </Modal>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  h3 {
    margin: 1rem 0 0.2rem;
    color: ${({ theme }) => theme.colors.ice};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(197, 165, 92, 0.05);
  }
`;

const ReviewArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
`;

const ChangeFileBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const WarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(223, 83, 83, 0.1);
  color: ${({ theme }) => theme.colors.danger};
  border: 1px solid rgba(223, 83, 83, 0.2);
  border-radius: ${({ theme }) => theme.radii.md};
`;

const ConfigsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DataPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.ice};
    font-weight: 600;
  }

  .more-text {
    text-align: center;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    padding: 0.5rem;
  }
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th, td {
    padding: 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    color: ${({ theme }) => theme.colors.ice};
  }

  th {
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 600;
  }
`;

const TypeTag = styled.span`
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  background: ${({ $type }) => $type === 'INFLOW' ? 'rgba(60, 168, 118, 0.15)' : 'rgba(223, 83, 83, 0.15)'};
  color: ${({ $type, theme }) => $type === 'INFLOW' ? theme.colors.success : theme.colors.danger};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelBtn = styled.button`
  padding: 0 1.25rem;
  min-height: 2.85rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.ice};
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
`;

const ConfirmBtn = styled.button`
  padding: 0 1.25rem;
  min-height: 2.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 800;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
