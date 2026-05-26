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
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  color: ${theme.colors.mutedDark};
  font-weight: 500;
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
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.ice};
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
          <IconWrapper $bg="rgba(214, 168, 79, 0.1)" $color={theme.colors.warning}>
            <Wallet size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.balance)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Entradas do Mês</Title>
          <IconWrapper $bg="rgba(70, 178, 128, 0.1)" $color={theme.colors.success}>
            <TrendingUp size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalInflow)}</Value>
      </Card>

      <Card>
        <CardHeader>
          <Title>Saídas do Mês</Title>
          <IconWrapper $bg="rgba(225, 93, 93, 0.1)" $color={theme.colors.danger}>
            <TrendingDown size={20} />
          </IconWrapper>
        </CardHeader>
        <Value>{formatCurrency(summary.totalOutflow)}</Value>
      </Card>
    </Grid>
  );
}
