export function formatWarehouseCode(
    city: string,
    pincode: string,
    sequence: number,
): string{
    const cityCode = city.substring(0,3).toUpperCase();
    const seq = sequence.toString().padStart(5, '0');

    return `WH-${cityCode}-${pincode}-${seq}`;
}