export const SALON_MAP_CAPACITIES = [
  "30", "40", "50", "60", "70", "80", "90", "100", "110", "120-150",
] as const;
export type SalonMapCapacity = (typeof SALON_MAP_CAPACITIES)[number];
