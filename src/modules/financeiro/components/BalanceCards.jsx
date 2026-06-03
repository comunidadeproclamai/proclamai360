import styled from 'styled-components';
import { Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency.js';
import { SkeletonLine as Skeleton } from '../../../components/feedback/Skeleton.jsx';

export function BalanceCards({ summary, isLoading }) {
  const periodResult = Number(summary.periodResult || 0);

  if (isLoading) {
    return (
      <Grid>
        <Card><Skeleton height="60px" /></Card>
        <Card><Skeleton height="60px" /></Card>
        <Card><Skeleton height="60px" /></Card>
        <Card><Skeleton height="60px" /></Card>
      </Grid>
    );
  }

  return (
    <Grid>
      <Card>
        <CardHeader>
          <Title>Saldo Atual em Caixa</Title>
          <IconWrapper $bg="rgba(212, 162, 63, 0.08)" $color="#c5a55c">
            <Wallet size={20} />
          </IconWrapper>
        </CardHeader>
        <Value style={{ color: '#c5a55c' }}>{formatCurrency(summary.balance)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Entradas do Período</Title>
          <IconWrapper $bg="rgba(60, 168, 118, 0.08)" $color="#2c8f61">
            <TrendingUp size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalInflow)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Saídas do Período</Title>
          <IconWrapper $bg="rgba(223, 83, 83, 0.08)" $color="#cd3d3d">
            <TrendingDown size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalOutflow)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Resultado do Período</Title>
          <IconWrapper $bg="rgba(197, 165, 92, 0.08)" $color="#c5a55c">
            <Scale size={20} />
          </IconWrapper>
        </CardHeader>
        <Value style={{ color: periodResult >= 0 ? '#3ca876' : '#cd3d3d' }}>
          {formatCurrency(periodResult)}
        </Value>
      </Card>
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  box-shadow: ${({ theme }) => theme.shadow};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const IconWrapper = styled.div`
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${({ $color }) => $color}33;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.ice};
  font-size: 1.7rem;
  font-weight: 800;
`;
