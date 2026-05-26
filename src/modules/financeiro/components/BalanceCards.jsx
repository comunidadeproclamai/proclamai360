import styled from 'styled-components';
import { formatCurrency } from '../../../utils/currency.js';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: ${({ theme }) => theme.shadow};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: transparent;
    transition: background 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(197, 165, 92, 0.25);
    box-shadow: ${({ theme }) => theme.shadow}, 0 0 15px rgba(197, 165, 92, 0.05);

    &::after {
      background: ${({ theme }) => theme.colors.goldGradient};
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => $color}33;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
  letter-spacing: -0.02em;
`;

export function BalanceCards({ summary, isLoading }) {
  if (isLoading) {
    return (
      <Grid>
        <Card><Title>Carregando...</Title></Card>
        <Card><Title>Carregando...</Title></Card>
        <Card><Title>Carregando...</Title></Card>
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
          <Title>Entradas do Mês</Title>
          <IconWrapper $bg="rgba(60, 168, 118, 0.08)" $color="#2c8f61">
            <TrendingUp size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalInflow)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Saídas do Mês</Title>
          <IconWrapper $bg="rgba(223, 83, 83, 0.08)" $color="#cd3d3d">
            <TrendingDown size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalOutflow)}</Value>
      </Card>
    </Grid>
  );
}
