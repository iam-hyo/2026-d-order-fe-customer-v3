export type AdDate = "2026-05-26" | "2026-05-27" | "2026-05-28";

export type NoContactBoothInfo = {
  date: AdDate;
  booths: string[];
};

export const NO_CONTACT_BOOTH_INFO: NoContactBoothInfo[] = [
  {
    date: "2026-05-26",
    booths: [],
  },
  {
    date: "2026-05-27",
    booths: [],
  },
  {
    date: "2026-05-28",
    booths: [],
  },
];
