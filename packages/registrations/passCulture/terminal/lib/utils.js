// Helper function to mask API key for display
export function maskApiKey(key) {
  if (!key || key.length < 8) return key;
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

// Helper function to format dates
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris',
    });
  } catch (error) {
    return dateString;
  }
}
