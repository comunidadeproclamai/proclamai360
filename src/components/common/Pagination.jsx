import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <Container>
      <Info>
        Mostrando <strong>{start}–{end}</strong> de <strong>{totalItems}</strong>
      </Info>

      <Controls>
        {onPageSizeChange && (
          <SizeSelect
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Itens por página"
          >
            <option value={10}>10 / pág</option>
            <option value={25}>25 / pág</option>
            <option value={50}>50 / pág</option>
          </SizeSelect>
        )}

        <NavGroup>
          <NavBtn
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </NavBtn>

          <PageIndicator>
            {currentPage} / {totalPages}
          </PageIndicator>

          <NavBtn
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </NavBtn>
        </NavGroup>
      </Controls>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  flex-wrap: wrap;
`;

const Info = styled.span`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 500;

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-weight: 700;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const SizeSelect = styled.select`
  min-height: 2.15rem;
  padding: 0 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.8rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;

  option {
    background: ${({ theme }) => theme.colors.charcoal};
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;

const NavBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.15rem;
  height: 2.15rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.ice};
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.gold};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.span`
  min-width: 3rem;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.muted};
`;
