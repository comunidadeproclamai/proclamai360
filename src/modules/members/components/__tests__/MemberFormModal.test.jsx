import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../../../../styles/theme';
import { MemberFormModal } from '../MemberFormModal';
import { ToastProvider } from '../../../../contexts/ToastContext';

function renderWithProviders(ui) {
  return render(
    <ThemeProvider theme={darkTheme}>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </ThemeProvider>
  );
}

describe('MemberFormModal', () => {
  it('renders creation modal correctly', () => {
    renderWithProviders(<MemberFormModal onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Novo Membro')).toBeInTheDocument();
    expect(screen.getByText('Cadastrar Membro')).toBeInTheDocument();
  });

  it('renders edit modal correctly when member data is provided', () => {
    const mockMember = { id: '1', name: 'João Silva', email: 'joao@test.com' };
    renderWithProviders(<MemberFormModal onClose={vi.fn()} onSave={vi.fn()} memberToEdit={mockMember} />);
    
    expect(screen.getByText('Editar Membro')).toBeInTheDocument();
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@test.com')).toBeInTheDocument();
    expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
  });

  it('validates name requirement before saving', async () => {
    const onSave = vi.fn();
    renderWithProviders(<MemberFormModal onClose={vi.fn()} onSave={onSave} />);
    
    const saveBtn = screen.getByText('Cadastrar Membro');
    fireEvent.click(saveBtn);

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with form data', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    renderWithProviders(<MemberFormModal onClose={vi.fn()} onSave={onSave} />);
    
    // Noto que os labels estão aninhados com os inputs, então procuramos pelos placeholder ou input fields.
    const nameInput = screen.getAllByRole('textbox')[0]; // Primeiro textbox deve ser nome (se autoFocus)
    fireEvent.change(nameInput, { target: { value: 'Novo Nome' } });
    
    const saveBtn = screen.getByText('Cadastrar Membro');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Novo Nome'
      }));
    });
  });
});
