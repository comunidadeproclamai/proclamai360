import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Camera, Upload, X, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext.jsx';

export function AvatarUpload({ 
  currentPhotoUrl, 
  onPhotoSelected, 
  onPhotoRemoved, 
  size = '6rem',
  fallbackInitials = '',
}) {
  const [preview, setPreview] = useState(currentPhotoUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFile = (file) => {
    if (!file) return;
    
    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return toast.error('Apenas imagens JPG, PNG ou WEBP são permitidas.');
    }

    // Validate size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      return toast.error('A imagem deve ter no máximo 3MB.');
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onPhotoSelected(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onPhotoRemoved?.();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Container>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFile(e.target.files[0])}
        accept="image/jpeg, image/png, image/webp"
        hidden
      />
      
      <UploadArea
        $size={size}
        $isDragging={isDragging}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {preview ? (
          <PreviewImage src={preview} alt="Avatar" />
        ) : fallbackInitials ? (
          <Initials>{fallbackInitials}</Initials>
        ) : (
          <User size={32} opacity={0.5} />
        )}

        <HoverOverlay>
          <Camera size={20} />
          <span>Alterar</span>
        </HoverOverlay>
      </UploadArea>

      {preview && (
        <RemoveBtn type="button" onClick={handleRemove} title="Remover foto">
          <X size={14} />
          Remover
        </RemoveBtn>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const UploadArea = styled.div`
  position: relative;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 2px dashed ${({ $isDragging, theme }) => ($isDragging ? theme.colors.gold : theme.colors.border)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.muted};

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    
    > div {
      opacity: 1;
    }
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Initials = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.mutedDark};
  letter-spacing: 0.05em;
`;

const HoverOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;

  span {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const RemoveBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.15s ease;

  &:hover {
    background: rgba(223, 83, 83, 0.1);
  }
`;
