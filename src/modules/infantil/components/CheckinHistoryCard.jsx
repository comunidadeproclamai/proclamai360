import styled from 'styled-components';
import { History } from 'lucide-react';
import { MutedText, Panel, PanelTitle } from './InfantilLayout.js';
import { formatDateTime } from '../utils/infantilFormatters.js';

export function CheckinHistoryCard({ records }) {
  return (
    <Panel>
      <PanelTitle><History size={18} /> Histórico recente</PanelTitle>
      {records.length === 0 ? (
        <MutedText>Nenhum check-in registrado.</MutedText>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Criança</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Código</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 12).map((record) => (
              <tr key={record.id}>
                <td>
                  <strong>{record.child?.name}</strong>
                  <span>{record.guardian?.name}</span>
                </td>
                <td>{formatDateTime(record.checkinTime)}</td>
                <td>{record.checkoutTime ? formatDateTime(record.checkoutTime) : 'Em sala'}</td>
                <td><Code>{record.securityCode}</Code></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Panel>
  );
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
    text-align: left;
    text-transform: uppercase;
    padding: 0.4rem 0.5rem;
  }

  td {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    padding: 0.75rem 0.5rem;
    vertical-align: top;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.9rem;
  }

  span {
    display: block;
    margin-top: 0.2rem;
  }
`;

const Code = styled.span`
  font-family: monospace;
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 800;
  letter-spacing: 0.08em;
`;
