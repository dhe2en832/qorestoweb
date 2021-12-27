const getStorage = (storageName) => JSON.parse(window.localStorage.getItem(storageName)) || {};

const getParentLocation = (location) => {
    const checkIsEdit = location.includes('edit');
    const splitLocation = location.split('/');
    if (checkIsEdit && splitLocation.length === 4) {
        return splitLocation[1];
    } else if (checkIsEdit && splitLocation.length === 5) {
        return `${splitLocation[1]}/${splitLocation[2]}`
    } else if (splitLocation.length === 4) {
        return `${splitLocation[1]}/${splitLocation[2]}`
    } else {
        return splitLocation[1];
    }
}

export { getStorage, getParentLocation }
