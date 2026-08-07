const Config = {
  BASE_URL: process.env.REACT_APP_API_ENDPOINT.trim(),
  SESSION_KEY: () => JSON.parse(window.localStorage.getItem('sessionKey')),
  SESSION_ID: () => JSON.parse(window.localStorage.getItem('sessionID')),
  SESSION_USER: () => JSON.parse(window.localStorage.getItem('userID')),
  DEFAULT_LANGUAGE: 'id-ID',
  CACHE_NAME: 'webappCSA',
  CACHE_VERSION: 1.0,
  DATABASE_NAME: 'webappCSA-DB',
  DATABASE_VERSION: 1.0,
  DATE_DEFAULT_FORMAT: 'DD/MM/YYYY',
  DATE_POST_FORMAT: 'YYYYMMDD',
  TIME_POST_FORMAT: 'HH:mm:ss',
  IDLE_TIMEOUT: 86400000,
  USE_BRWDEF: true,
};

export default Config;
