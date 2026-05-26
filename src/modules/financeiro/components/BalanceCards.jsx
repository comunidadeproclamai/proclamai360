import styled from 'styled-components';
import { theme } from '../../../styles/theme.js';
import { formatCurrency } from '../../../utils/currency.js';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: rgba(28, 22, 23, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: ${theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 15px rgba(197, 165, 92, 0.05);

    &::after {
      background: ${theme.colors.goldGradient};
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
  color: ${theme.colors.muted};
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
  border: 1px solid ${({ $color }) => rgba($color, 0.15)};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

function rgba(hex, opacity) {
  // Simple helper to add border opacity
  return hex === theme.colors.warning ? `rgba(212, 162, 63, ${opacity})` :
         hex === theme.colors.success ? `rgba(60, 168, 118, ${opacity})` :
         `rgba(223, 83, 83, ${opacity})`;
}

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.ice};
  letter-spacing: -0.02em;
  font-family: 'Outfit', sans-serif;
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
          <IconWrapper $bg="rgba(212, 162, 63, 0.08)" $color={theme.colors.warning}>
            <Wallet size={20} />
          </IconWrapper>
        </CardHeader>
        <Value style={{ color: theme.colors.gold }}>{formatCurrency(summary.balance)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Entradas do Mês</Title>
          <IconWrapper $bg="rgba(60, 168, 118, 0.08)" $color={theme.colors.success}>
            <TrendingUp size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalInflow)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Saídas do Mês</Title>
          <IconWrapper $bg="rgba(223, 83, 83, 0.08)" $color={theme.colors.danger}>
            <TrendingDown size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalOutflow)}</Value>
      </Card>
    </Grid>
  );
}

