export function getAgeFromBirthDate(value) {
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(0, age);
}

export function getRoomByAge(age) {
  if (age <= 2) return 'Bercario';
  if (age <= 5) return 'Maternal';
  return 'Primarios';
}

export function mapLiveCheckin(item) {
  const age = getAgeFromBirthDate(item.child.birthDate);

  return {
    id: item.id,
    childId: item.child.id,
    name: item.child.name,
    checkinTime: item.checkinTime,
    securityCode: item.securityCode,
    age,
    allergies: item.child.allergies,
    specialNeeds: item.child.specialNeeds,
    guardianName: item.guardian?.name,
    room: getRoomByAge(age),
  };
}

export function mapChildRecord(child) {
  const age = getAgeFromBirthDate(child.birthDate);

  return {
    ...child,
    age,
    room: getRoomByAge(age),
    checkinsCount: child._count?.checkins || 0,
    primaryGuardian: child.guardians?.find((guardian) => guardian.isPrimary)?.member,
  };
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
