import { Component } from 'react';
import styled from 'styled-components';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container>
          <Card>
            <IconWrap>
              <AlertTriangle size={36} />
            </IconWrap>
            <Title>Algo deu errado</Title>
            <Description>
              Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
            </Description>
            <RetryButton type="button" onClick={this.handleReset}>
              <RotateCcw size={16} />
              Tentar novamente
            </RetryButton>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 26rem;
  padding: 2.5rem 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};
  animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const IconWrap = styled.div`
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(223, 83, 83, 0.1);
  border: 1px solid rgba(223, 83, 83, 0.2);
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 1.25rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
`;

const Description = styled.p`
  margin: 0.75rem 0 1.5rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.65rem;
  padding: 0 1.25rem;
  border: 1px solid rgba(197, 165, 92, 0.15);
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wine};
  color: #fcfaf7;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    transform: translateY(-2px);
  }
`;
