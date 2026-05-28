import styled from 'styled-components';
import { Baby, History, ShieldCheck, Users } from 'lucide-react';

const statsConfig = [
  { key: 'active', label: 'Em sala', icon: ShieldCheck },
  { key: 'children', label: 'Cadastradas', icon: Baby },
  { key: 'guardians', label: 'Responsáveis', icon: Users },
  { key: 'history', label: 'Registros recentes', icon: History },
];

export function InfantilStatsBar({ activeCount = 0, childrenCount = 0, guardiansCount = 0, historyCount = 0 }) {
  const values = {
    active: activeCount,
    children: childrenCount,
    guardians: guardiansCount,
    history: historyCount,
  };

  return (
    <Grid>
      {statsConfig.map((item) => {
        const Icon = item.icon;
        return (
          <StatBox key={item.key}>
            <IconBox><Icon size={18} /></IconBox>
            <div>
              <strong>{values[item.key]}</strong>
              <span>{item.label}</span>
            </div>
          </StatBox>
        );
      })}
    </Grid>
  );
}

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div`
  min-height: 5.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.86)' : 'rgba(28, 22, 23, 0.72)'};
  box-shadow: ${({ theme }) => theme.shadow};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.ice};
    font-size: 1.35rem;
    line-height: 1;
  }

  span {
    display: block;
    margin-top: 0.3rem;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 700;
  }
`;

const IconBox = styled.div`
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.gold};
`;
