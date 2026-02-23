export const brandColors = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  textSecondary: '#595959',
  border: '#f0f0f0',
  backgroundLight: 'rgba(0,0,0,0.04)',
};

export const statusColors = {
  PENDING: brandColors.warning,
  CONFIRMED: brandColors.primary,
  COMPLETED: brandColors.success,
  CANCELLED: brandColors.error,
};

export const statusTagColors = {
  PENDING: 'warning',
  CONFIRMED: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'error',
};
