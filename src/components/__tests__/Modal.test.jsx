import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../../styles/theme';
import { Modal } from '../common/Modal';

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
}

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    renderWithTheme(<Modal isOpen={false} title="Test Modal">Content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    renderWithTheme(
      <Modal isOpen={true} title="Test Modal" footer={<button>Save</button>}>
        Modal Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithTheme(<Modal isOpen={true} title="Test" onClose={handleClose}>Content</Modal>);

    const closeBtn = screen.getByLabelText('Fechar modal');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    renderWithTheme(<Modal isOpen={true} title="Test" onClose={handleClose}>Content</Modal>);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
