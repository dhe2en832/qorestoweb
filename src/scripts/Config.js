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

  // Pajak/PPN — mengikuti pola webcsa-v2 (trenly):
  //   BASE_TAX_PERCENTAGE: rate dasar (12% sesuai UU HPP)
  //   EFFECTIVE_TAX_RATE : DPP Nilai Lain per PMK 131/2024 (11/12)
  //   Pajak efektif yang dibebankan ke pelanggan = 12 * (11/12) = 11%
  BASE_TAX_PERCENTAGE: 12,
  EFFECTIVE_TAX_RATE: 11 / 12,   // PMK 131 Tahun 2024
};

export default Config;
