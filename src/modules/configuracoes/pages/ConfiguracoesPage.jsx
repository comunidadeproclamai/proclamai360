import { Settings } from 'lucide-react';
import { DomainPage } from '../../../components/common/DomainPage.jsx';

export function ConfiguracoesPage() {
  return (
    <DomainPage
      eyebrow="Sistema"
      title="Configuracoes"
      description="Espaco para preferencias, dados institucionais e configuracoes simples da plataforma."
      icon={Settings}
      nextSteps={[
        'Centralizar dados basicos da igreja.',
        'Criar configuracoes por modulo quando necessario.',
        'Manter permissoes simples nesta fase inicial.',
      ]}
    />
  );
}
