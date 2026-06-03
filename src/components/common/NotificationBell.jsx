import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useRealtime } from '../../contexts/RealtimeContext.jsx';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <Container ref={menuRef}>
      <BellBtn onClick={toggle} aria-label="Notificações">
        <Bell size={20} />
        {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
      </BellBtn>

      {isOpen && (
        <Dropdown>
          <Header>
            <Title>Notificações</Title>
            {unreadCount > 0 && (
              <MarkAllBtn onClick={markAllAsRead}>
                <CheckCircle2 size={14} />
                Marcar todas como lidas
              </MarkAllBtn>
            )}
          </Header>

          <List>
            {notifications.length === 0 ? (
              <EmptyState>Nenhuma notificação no momento.</EmptyState>
            ) : (
              notifications.map((notif) => (
                <NotificationItem 
                  key={notif.id} 
                  $unread={!notif.read}
                  onClick={() => markAsRead(notif.id)}
                >
                  <ItemHeader>
                    <strong>{notif.title}</strong>
                    <Time>{formatTime(notif.time)}</Time>
                  </ItemHeader>
                  <Message>{notif.message}</Message>
                </NotificationItem>
              ))
            )}
          </List>
        </Dropdown>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

const BellBtn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.ice};
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  border: 2px solid ${({ theme }) => theme.colors.charcoal};
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 320px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadow};
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  overflow: hidden;
  animation: slideUp 0.2s ease forwards;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;

const Title = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
`;

const MarkAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  font-weight: 600;
  
  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const List = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
`;

const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $unread, theme }) => ($unread ? theme.colors.wineGlow : 'transparent')};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.85rem;
  }
`;

const Time = styled.span`
  color: ${({ theme }) => theme.colors.mutedDark};
  font-size: 0.7rem;
`;

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8rem;
  line-height: 1.4;
`;
