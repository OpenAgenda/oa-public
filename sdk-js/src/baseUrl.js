const baseUrl = {
  v1:
    process.env.NODE_ENV !== 'development'
      ? 'https://api.openagenda.com/v1'
      : 'https://dapi.openagenda.com/frontend_dev.php/v1',
  v2:
    process.env.NODE_ENV !== 'development'
      ? 'https://api.openagenda.com/v2'
      : 'https://dapi.openagenda.com/v2',
};

export default baseUrl;
