export async function getRentalContext(_prompt: string): Promise<string> {
  // Replace this with narrow, read-only Drizzle queries relevant to the prompt.
  // Example data: available product names/quantities/rates, active coupons,
  // and published rental policies. Never include credentials or payment data.
  return [
    "Business: ApexRentals",
    "Tax rule: apply 18% GST when the configured taxable rental rule applies.",
    "Late-return policy: confirm the current published policy before quoting a fee.",
    "Availability: no live catalog rows were supplied to this request.",
  ].join("\n");
}
