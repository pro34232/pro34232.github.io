export function requestBookingSlot(type: string, slot: string) {
  return type === "Booking" ? slot : null;
}