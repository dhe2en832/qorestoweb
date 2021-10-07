const Config = {
  BASE_URL: 'http://192.168.100.85/api',
  SESSION_KEY: () => JSON.parse(window.localStorage.getItem('sessionKey')),
  SESSION_ID: () => JSON.parse(window.localStorage.getItem('sessionID')),
  DEFAULT_LANGUAGE: 'id-ID',
  CACHE_NAME: 'webappCSA',
  CACHE_VERSION: 1.0,
  DATABASE_NAME: 'webappCSA-DB',
  DATABASE_VERSION: 1.0,
  DATE_DEFAULT_FORMAT: 'DD/MM/YYYY',
  DATE_POST_FORMAT: 'YYYYMMDD',
  TIME_POST_FORMAT: 'HH:mm:ss',
  IDLE_TIMEOUT: 86400000,
};

export default Config;
