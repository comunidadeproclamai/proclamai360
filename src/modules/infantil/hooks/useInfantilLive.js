import { useState, useEffect } from 'react';

const MOCK_CHILDREN = [
  { id: '1', name: 'Pedro Alves', checkinTime: '2026-05-26T09:00:00Z', securityCode: 'B492', age: 4, allergies: 'Lactose', room: 'Maternal' },
  { id: '2', name: 'Sofia Mendes', checkinTime: '2026-05-26T09:15:00Z', securityCode: 'C711', age: 7, allergies: null, room: 'Primários' },
  { id: '3', name: 'Lucas Costa', checkinTime: '2026-05-26T09:30:00Z', securityCode: 'A102', age: 2, allergies: 'Amendoim', room: 'Berçário' },
];

export function useInfantilLive() {
  const [activeChildren, setActiveChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveChildren(MOCK_CHILDREN);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addCheckin = (name, age, allergies) => {
    // Generate a random 4-char security code
    const securityCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Determine room based on age
    let room = 'Primários';
    if (age <= 2) room = 'Berçário';
    else if (age <= 5) room = 'Maternal';

    const newChild = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      checkinTime: new Date().toISOString(),
      securityCode,
      age: Number(age),
      allergies: allergies || null,
      room
    };
    
    setActiveChildren(prev => [newChild, ...prev]);
    return securityCode; // Return to show to the parents
  };

  const doCheckout = (id) => {
    setActiveChildren(prev => prev.filter(c => c.id !== id));
  };

  return {
    activeChildren,
    isLoading,
    addCheckin,
    doCheckout
  };
}
