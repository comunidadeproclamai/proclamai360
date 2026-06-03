import styled, { keyframes } from 'styled-components';

// ─── Skeleton Line ───────────────────────────────────────────
export function SkeletonLine({ width = '100%', height = '0.9rem' }) {
  return <Line style={{ width, height }} />;
}

// ─── Skeleton Avatar ─────────────────────────────────────────
export function SkeletonAvatar({ size = '2.5rem' }) {
  return <Avatar style={{ width: size, height: size }} />;
}

// ─── Skeleton Card ───────────────────────────────────────────
export function SkeletonCard() {
  return (
    <Card>
      <SkeletonLine width="40%" height="0.7rem" />
      <SkeletonLine width="60%" height="1.8rem" />
      <SkeletonLine width="70%" height="0.7rem" />
    </Card>
  );
}

// ─── Skeleton Table ──────────────────────────────────────────
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <Table>
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, ci) => (
            <th key={ci}>
              <SkeletonLine width="70%" height="0.6rem" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, ri) => (
          <tr key={ri}>
            {Array.from({ length: columns }).map((_, ci) => (
              <td key={ci}>
                <SkeletonLine width={`${50 + Math.random() * 40}%`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// ─── Styled ──────────────────────────────────────────────────
const shimmerAnimation = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ShimmerBase = styled.div`
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surfaceSoft} 25%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.surfaceSoft} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerAnimation} 1.8s ease-in-out infinite;
`;

const Line = styled(ShimmerBase)`
  display: block;
`;

const Avatar = styled(ShimmerBase)`
  border-radius: 50%;
  flex-shrink: 0;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  min-height: 8.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;
