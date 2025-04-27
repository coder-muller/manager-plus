export function transformPhone(phone: string): string {
  // Remove qualquer caractere que não seja dígito
  const digits = phone.replace(/\D/g, '');

  // Com DDD e celular (11 dígitos): (XX) 9XXXX-XXXX
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  // Com DDD e fixo (10 dígitos): (XX) XXXX-XXXX
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  // Celular sem DDD (9 dígitos): 9XXXX-XXXX
  if (digits.length === 9) {
    return digits.replace(/(\d{5})(\d{4})/, '$1-$2');
  }
  // Fixo sem DDD (8 dígitos): XXXX-XXXX
  if (digits.length === 8) {
    return digits.replace(/(\d{4})(\d{4})/, '$1-$2');
  }

  return phone;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('pt-BR');
}

export function getMonthName(month: number): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];
  
  return months[month - 1] || '';
}
