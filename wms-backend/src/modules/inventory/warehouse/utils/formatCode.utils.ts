export function formatWarehouseCode(
  city: string,
  pincode: string,
  sequence: number,
): string {
  const cityCode = city.substring(0, 3).toUpperCase();
  const pinCode = pincode.substring(0, 6);

  return `WH-${cityCode}-${pinCode}-${sequence
    .toString()
    .padStart(3, '0')}`;
}