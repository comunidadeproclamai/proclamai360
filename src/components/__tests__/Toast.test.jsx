import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../../styles/theme';
import { Toast } from '../feedback/Toast';

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
}

describe('Toast', () => {
  it('renders success toast correctly', () => {
    renderWithTheme(<Toast type="success" message="Operation successful" duration={0} />);
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('renders error toast correctly', () => {
    renderWithTheme(<Toast type="error" message="An error occurred" duration={0} />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithTheme(<Toast type="info" message="Info" duration={0} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText('Fechar notificação');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
