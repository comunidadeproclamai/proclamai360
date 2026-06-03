import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from '../../../components/common/Modal.jsx';
import { FormRow } from '../../../components/forms/FormRow.jsx';
import { SelectField } from '../../../components/forms/SelectField.jsx';
import { DateField } from '../../../components/forms/DateField.jsx';
import { TextArea } from '../../../components/forms/TextArea.jsx';
import { AvatarUpload } from '../../../components/common/AvatarUpload.jsx';
import { uploadMemberPhoto } from '../../../services/storageService';

const Input = styled.input`
  width: 100%;
  min-height: 2.9rem;
  padding: 0 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.gold};
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:first-child {
    margin-top: 0;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;

  ${({ $primary, theme }) => $primary ? `
    background: ${theme.colors.wine};
    color: white;
    border: 1px solid rgba(197, 165, 92, 0.15);
    box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);

    &:hover:not(:disabled) {
      background: ${theme.colors.wineLight};
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.ice};
    border: 1px solid ${theme.colors.border};

    &:hover:not(:disabled) {
      background: ${theme.colors.surfaceSoft};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function MemberFormModal({ onClose, onSave, memberToEdit = null }) {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', cpf: '', birthDate: '', gender: '', 
    status: 'ACTIVE', congregation: 'Sede', baptismDate: '', membershipDate: '', notes: '',
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        ...memberToEdit,
        birthDate: memberToEdit.birthDate ? memberToEdit.birthDate.split('T')[0] : '',
        baptismDate: memberToEdit.baptismDate ? memberToEdit.baptismDate.split('T')[0] : '',
        membershipDate: memberToEdit.membershipDate ? memberToEdit.membershipDate.split('T')[0] : '',
      });
    }
  }, [memberToEdit]);

  const handleSubmit = async () => {
    if (!formData.name) return setError('Nome é obrigatório');
    setError('');
    setIsSaving(true);
    try {
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        // Usa um ID temporário se for criação e a foto for obrigatória, ou envia sem e depois atualiza
        // No caso ideal o backend retornaria o upload presigned, mas vamos simular:
        photoUrl = await uploadMemberPhoto(memberToEdit?.id || 'new-' + Date.now(), photoFile);
      }
      
      await onSave({ ...formData, photoUrl });
      onClose();
    } catch (err) {
      // toast comes from useMembers
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <>
      <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
      <Button $primary onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? 'Salvando...' : (memberToEdit ? 'Salvar Alterações' : 'Cadastrar Membro')}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={memberToEdit ? 'Editar Membro' : 'Novo Membro'} 
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</div>}
        
        <SectionTitle>Dados Pessoais</SectionTitle>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <AvatarUpload 
            currentPhotoUrl={formData.photoUrl} 
            onPhotoSelected={setPhotoFile}
            onPhotoRemoved={() => { setPhotoFile(null); setFormData({...formData, photoUrl: null}); }}
            fallbackInitials={formData.name ? formData.name.substring(0, 2).toUpperCase() : ''}
          />
        </div>

        <FormRow>
          <Label>
            Nome Completo *
            <Input autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </Label>
          <Label>
            E-mail
            <Input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </Label>
        </FormRow>

        <FormRow>
          <Label>
            Telefone
            <Input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </Label>
          <Label>
            CPF
            <Input value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} />
          </Label>
        </FormRow>

        <FormRow>
          <DateField 
            label="Data de Nascimento" 
            value={formData.birthDate || ''} 
            onChange={e => setFormData({...formData, birthDate: e.target.value})} 
          />
          <SelectField 
            label="Gênero" 
            value={formData.gender || ''} 
            onChange={e => setFormData({...formData, gender: e.target.value})}
            options={[{value: '', label: 'Selecione...'}, {value: 'M', label: 'Masculino'}, {value: 'F', label: 'Feminino'}]}
          />
        </FormRow>

        <SectionTitle>Dados Eclesiásticos</SectionTitle>
        <FormRow>
          <SelectField 
            label="Status" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
            options={[{value: 'ACTIVE', label: 'Ativo'}, {value: 'VISITOR', label: 'Visitante'}, {value: 'INACTIVE', label: 'Inativo'}]}
          />
          <SelectField 
            label="Congregação" 
            value={formData.congregation || ''} 
            onChange={e => setFormData({...formData, congregation: e.target.value})}
            options={['Sede', 'Filial 1', 'Filial 2']}
            placeholder="Selecione..."
          />
        </FormRow>
        <FormRow>
          <DateField 
            label="Data de Batismo" 
            value={formData.baptismDate || ''} 
            onChange={e => setFormData({...formData, baptismDate: e.target.value})} 
          />
          <DateField 
            label="Membro desde" 
            value={formData.membershipDate || ''} 
            onChange={e => setFormData({...formData, membershipDate: e.target.value})} 
          />
        </FormRow>

        <SectionTitle>Endereço</SectionTitle>
        <FormRow>
          <Label>Rua<Input value={formData.street || ''} onChange={e => setFormData({...formData, street: e.target.value})} /></Label>
          <Label>Número<Input value={formData.number || ''} onChange={e => setFormData({...formData, number: e.target.value})} /></Label>
        </FormRow>
        <FormRow>
          <Label>Bairro<Input value={formData.neighborhood || ''} onChange={e => setFormData({...formData, neighborhood: e.target.value})} /></Label>
          <Label>Cidade<Input value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} /></Label>
        </FormRow>

        <SectionTitle>Observações</SectionTitle>
        <TextArea 
          value={formData.notes || ''} 
          onChange={e => setFormData({...formData, notes: e.target.value})} 
          placeholder="Alergias, observações importantes, etc." 
        />
      </div>
    </Modal>
  );
}
