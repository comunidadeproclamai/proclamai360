import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../../utils/currency.js';
import { financeiroService } from '../services/financeiroService.js';
import { SkeletonCard } from '../../../components/feedback/Skeleton.jsx';

const COLORS = ['#cd3d3d', '#3ca876', '#c5a55c', '#4a90e2', '#9013fe', '#f5a623'];

export function FinancialReportCharts({ filters }) {
  const [data, setData] = useState({ daily: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await financeiroService.getChartData(filters);
        setData(result);
      } catch (err) {
        console.error('Erro ao carregar gráficos', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [filters]);

  if (isLoading) {
    return (
      <Grid>
        <SkeletonCard />
        <SkeletonCard />
      </Grid>
    );
  }

  // Preparar dados do gráfico de barras (formatar data)
  const barData = data.daily.map(d => {
    const parts = d.date.split('-');
    return {
      name: `${parts[2]}/${parts[1]}`,
      Receitas: d.INFLOW,
      Despesas: d.OUTFLOW,
    };
  });

  // Preparar dados da pizza (apenas despesas)
  const pieData = data.categories
    .filter(c => c.type === 'OUTFLOW' && c.OUTFLOW > 0)
    .map(c => ({
      name: c.name,
      value: c.OUTFLOW,
    }))
    .sort((a, b) => b.value - a.value);

  const formatTooltip = (value) => [formatCurrency(value), ''];

  return (
    <Container>
      <Grid>
        <ChartBox>
          <h3>Evolução de Receitas e Despesas</h3>
          {barData.length === 0 ? (
            <EmptyState>Sem dados para o período</EmptyState>
          ) : (
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip 
                    formatter={formatTooltip} 
                    contentStyle={{ backgroundColor: '#1c1617', borderColor: '#333', borderRadius: '8px', color: '#fff' }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Receitas" fill="#3ca876" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#cd3d3d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          )}
        </ChartBox>

        <ChartBox>
          <h3>Despesas por Categoria</h3>
          {pieData.length === 0 ? (
            <EmptyState>Sem dados para o período</EmptyState>
          ) : (
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatTooltip} 
                    contentStyle={{ backgroundColor: '#1c1617', borderColor: '#333', borderRadius: '8px', color: '#fff' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          )}
        </ChartBox>
      </Grid>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartBox = styled.div`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 1.5rem;
    color: ${({ theme }) => theme.colors.gold};
    font-size: 1.1rem;
    font-weight: 800;
  }
`;

const ChartWrapper = styled.div`
  height: 300px;
  width: 100%;
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  font-style: italic;
`;
