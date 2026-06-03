import styled from 'styled-components';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const pathLabels = {
  dashboard: 'Dashboard',
  membros: 'Membros',
  infantil: 'Ministério Infantil',
  financeiro: 'Financeiro',
  louvor: 'Louvor & Escalas',
  configuracoes: 'Configurações',
};

export function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <Nav aria-label="Navegação de localização">
      <Crumbs>
        <CrumbLink to="/dashboard" aria-label="Início">
          <Home size={14} />
        </CrumbLink>

        {segments.map((segment, index) => {
          const path = '/' + segments.slice(0, index + 1).join('/');
          const label = pathLabels[segment] || segment;
          const isLast = index === segments.length - 1;

          return (
            <li key={path}>
              <Separator>
                <ChevronRight size={12} />
              </Separator>
              {isLast ? (
                <CurrentCrumb aria-current="page">{label}</CurrentCrumb>
              ) : (
                <CrumbLink to={path}>{label}</CrumbLink>
              )}
            </li>
          );
        })}
      </Crumbs>
    </Nav>
  );
}

const Nav = styled.nav`
  margin-bottom: 0.25rem;
`;

const Crumbs = styled.ol`
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
`;

const CrumbLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const CurrentCrumb = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gold};
`;

const Separator = styled.span`
  display: inline-flex;
  align-items: center;
  margin: 0 0.35rem;
  color: ${({ theme }) => theme.colors.border};
`;
