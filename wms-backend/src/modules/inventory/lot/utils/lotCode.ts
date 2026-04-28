export function formatLotCode(
  warehouseCode: string,
  seq: number,
) {
  const padded = String(seq).padStart(5, '0');

  return `${warehouseCode}-LOT-${padded}`;
}