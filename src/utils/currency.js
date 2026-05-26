export function formatCurrency(value) {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numberValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(numberValue);
}

export function parseCurrencyInput(value) {
  if (!value) return 0;
  const rawValue = value.replace(/\D/g, '');
  return parseFloat(rawValue) / 100;
}
