import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export function ExportButton({ onExportExcel, onExportPDF, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = async (type) => {
    try {
      setIsExporting(true);
      if (type === 'excel') await onExportExcel();
      if (type === 'pdf') await onExportPDF();
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <Container ref={menuRef}>
      <Button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        disabled={disabled || isExporting}
      >
        <Download size={16} />
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>

      {isOpen && !disabled && !isExporting && (
        <Dropdown>
          {onExportExcel && (
            <MenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet size={16} />
              Planilha Excel (.xlsx)
            </MenuItem>
          )}
          {onExportPDF && (
            <MenuItem onClick={() => handleExport('pdf')}>
              <FileText size={16} />
              Documento PDF (.pdf)
            </MenuItem>
          )}
        </Dropdown>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.35rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.3rem);
  right: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadow};
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  overflow: hidden;
  animation: slideUp 0.15s ease forwards;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.85rem;
  font-weight: 500;
  text-align: left;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.gold};
  }

  svg {
    color: ${({ theme }) => theme.colors.muted};
  }
  
  &:hover svg {
    color: ${({ theme }) => theme.colors.gold};
  }
`;
