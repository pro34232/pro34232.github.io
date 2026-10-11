import { describe, expect, it } from "vitest";
import { requestBookingSlot } from "./booking";

describe("Booking time slots", () => {
  it("retains an hourly slot for any booking, including fuel orders", () => {
    expect(requestBookingSlot("Booking", "09:00")).toBe("09:00");
  });
  it("does not reserve a slot for an enquiry", () => {
    expect(requestBookingSlot("Enquiry", "09:00")).toBeNull();
  });
});