import { Music2 } from 'lucide-react';
import { DomainPage } from '../../../components/common/DomainPage.jsx';

export function LouvorPage() {
  return (
    <DomainPage
      eyebrow="Escalas"
      title="Louvor"
      description="Modulo inicial para organizar equipe, repertorio e escalas ministeriais em etapas futuras."
      icon={Music2}
      nextSteps={[
        'Mapear membros do ministerio e funcoes.',
        'Criar calendario de escalas.',
        'Preparar integracao futura com comunicacao interna.',
      ]}
    />
  );
}
