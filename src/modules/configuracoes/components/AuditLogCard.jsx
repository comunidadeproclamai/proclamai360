import styled from 'styled-components';
import { ClipboardList } from 'lucide-react';
import {
  CardDescription,
  CardHeader,
  EmptyMessage,
  SettingsCard,
} from './ConfiguracoesLayout.js';

export function AuditLogCard({ auditLogs, auditLoading }) {
  return (
    <SettingsCard>
      <CardHeader>
        <ClipboardList size={20} />
        <h3>Auditoria Recente</h3>
      </CardHeader>
      <CardDescription>
        Acompanhe as ultimas acoes sensiveis realizadas na plataforma.
      </CardDescription>

      {auditLoading ? (
        <EmptyMessage>Carregando auditoria...</EmptyMessage>
      ) : auditLogs.length === 0 ? (
        <EmptyMessage>Nenhum evento registrado.</EmptyMessage>
      ) : (
        <AuditList>
          {auditLogs.map((log) => (
            <AuditRow key={log.id}>
              <AuditHeader>
                <strong>{log.action}</strong>
                <span>{formatDateTime(log.timestamp)}</span>
              </AuditHeader>
              <AuditMeta>
                {log.user?.name || 'Usuario'} - {log.user?.email || 'sem e-mail'}
              </AuditMeta>
              <AuditDetails>{JSON.stringify(log.details)}</AuditDetails>
            </AuditRow>
          ))}
        </AuditList>
      )}
    </SettingsCard>
  );
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const AuditList = styled.div`
  display: grid;
  gap: 0.75rem;
  max-height: 28rem;
  overflow: auto;
  padding-right: 0.25rem;
`;

const AuditRow = styled.div`
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;

const AuditHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.9rem;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const AuditMeta = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;

const AuditDetails = styled.code`
  color: ${({ theme }) => theme.colors.mutedDark};
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
