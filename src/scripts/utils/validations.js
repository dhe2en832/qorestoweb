export default function isEmptyModules(modules, value) {
  const getModule = modules
    .filter(({ name }) => name === value)
    .map(({ menu }) => menu.filter(({ active }) => active === 'Y'));
  return getModule[0].length === 0 ? true : false;
}
