import { supabase } from '../lib/supabaseClient';
import { apiClient } from './apiClient';

export const STORAGE_BUCKETS = {
  MEMBERS: 'member-photos',
  CHILDREN: 'child-photos',
  DOCUMENTS: 'financial-docs',
};

/**
 * Faz o upload de uma imagem via Backend API e retorna o caminho
 */
export async function uploadImage(bucket, path, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('path', path);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.path;
}

/**
 * Remove um arquivo do storage diretamente (usando RLS se configurado)
 * Idealmente, isso também passaria por uma rota de API se quisermos ocultar credenciais
 */
export async function deleteFile(bucket, path) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Retorna a URL pública de um arquivo
 */
export function getPublicUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Helper: Upload foto do membro
 */
export async function uploadMemberPhoto(memberId, file) {
  const fileExt = file.name.split('.').pop();
  const path = `${memberId}/avatar-${Date.now()}.${fileExt}`;
  return uploadImage(STORAGE_BUCKETS.MEMBERS, path, file);
}

/**
 * Helper: Upload foto da criança
 */
export async function uploadChildPhoto(childId, file) {
  const fileExt = file.name.split('.').pop();
  const path = `${childId}/avatar-${Date.now()}.${fileExt}`;
  return uploadImage(STORAGE_BUCKETS.CHILDREN, path, file);
}
