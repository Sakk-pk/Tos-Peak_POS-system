export function makeId(prefix, items) {
  const max = items.reduce((highest, item) => {
    const match = String(item.id).match(/(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);

  return `${prefix}-${String(max + 1).padStart(2, '0')}`;
}
