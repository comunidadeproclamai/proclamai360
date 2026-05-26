import { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { theme } from '../styles/theme.js';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Shell>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Content>
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <Main>
          <Outlet />
        </Main>
      </Content>
    </Shell>
  );
}

const Shell = styled.div`
  display: grid;
  grid-template-columns: 17.5rem minmax(0, 1fr);
  min-height: 100vh;
  background: rgba(21, 19, 19, 0.94);

  @media (max-width: 920px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Content = styled.div`
  min-width: 0;
  border-left: 1px solid ${theme.colors.border};

  @media (max-width: 920px) {
    border-left: 0;
  }
`;

const Main = styled.main`
  width: min(100%, 76rem);
  margin: 0 auto;
  padding: 1.75rem;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`;
