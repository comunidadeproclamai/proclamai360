import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Pagination } from './Pagination.jsx';
import { SkeletonTable } from '../feedback/Skeleton.jsx';

export function DataTable({
  columns, // [{ key, label, sortable?, render? }]
  data,
  isLoading = false,
  emptyIcon: EmptyIcon,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = '',
  pageSize: initialPageSize = 10,
  onRowClick,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sortedData = useMemo(() => {
    if (!sortKey || !data) return data || [];

    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <TableContainer>
        <SkeletonTable rows={pageSize > 5 ? 5 : pageSize} columns={columns.length} />
      </TableContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          {EmptyIcon && (
            <EmptyIconWrap>
              <EmptyIcon size={32} />
            </EmptyIconWrap>
          )}
          <h3>{emptyTitle}</h3>
          {emptyDescription && <p>{emptyDescription}</p>}
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              {columns.map((col) => (
                <Th
                  key={col.key}
                  $sortable={col.sortable}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  role={col.sortable ? 'button' : undefined}
                  aria-label={col.sortable ? `Ordenar por ${col.label}` : undefined}
                >
                  <ThContent>
                    {col.label}
                    {col.sortable && (
                      <SortIcon>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} />
                        )}
                      </SortIcon>
                    )}
                  </ThContent>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, ri) => (
              <Tr
                key={row.id || ri}
                $clickable={!!onRowClick}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <Td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </Td>
                ))}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* Mobile Cards */}
      <MobileList>
        {paginatedData.map((row, ri) => (
          <MobileCard
            key={row.id || ri}
            $clickable={!!onRowClick}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((col) => (
              <MobileRow key={col.key}>
                <MobileLabel>{col.label}</MobileLabel>
                <MobileValue>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </MobileValue>
              </MobileRow>
            ))}
          </MobileCard>
        ))}
      </MobileList>

      {sortedData.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </>
  );
}

// ─── Styled ──────────────────────────────────────────────────
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) =>
    theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadow};

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileList = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const MobileCard = styled.div`
  padding: 1rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) =>
    theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;

  &:active {
    ${({ $clickable }) => $clickable && 'transform: scale(0.99);'}
  }
`;

const MobileRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

const MobileLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.muted};
  flex-shrink: 0;
`;

const MobileValue = styled.span`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.ice};
  text-align: right;
  min-width: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 1.1rem 1.25rem;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.gold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  user-select: none;
  transition: color 0.15s ease;

  &:hover {
    ${({ $sortable, theme }) => $sortable && `color: ${theme.colors.goldLight};`}
  }
`;

const ThContent = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const SortIcon = styled.span`
  display: inline-flex;
  opacity: 0.6;
`;

const Td = styled.td`
  padding: 1.1rem 1.25rem;
  font-size: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.ice};
`;

const Tr = styled.tr`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.surface === '#ffffff' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'};
  }

  &:last-child td {
    border-bottom: 0;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2rem;
  text-align: center;

  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ice};
  }

  p {
    margin: 0.5rem 0 0;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.5;
  }
`;

const EmptyIconWrap = styled.div`
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.15);
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: 1rem;
`;
