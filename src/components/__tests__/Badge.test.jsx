import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../../styles/theme';
import { Badge } from '../common/Badge';

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
}

describe('Badge', () => {
  it('renders default neutral badge', () => {
    renderWithTheme(<Badge>Status</Badge>);
    const badge = screen.getByText('Status');
    expect(badge).toBeInTheDocument();
  });

  it('renders success badge', () => {
    renderWithTheme(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
  });
});
