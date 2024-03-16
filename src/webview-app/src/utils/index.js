export function convertObjectToArray(obj) {
  return Object.entries(obj).map(([key, value]) => ({
    name: key,
    value: typeof value === 'object' ? JSON.stringify(value) : value.toString()
  }));
}