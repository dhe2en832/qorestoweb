const getStorage = (storageName) => JSON.parse(window.localStorage.getItem(storageName)) || {};

export { getStorage }
