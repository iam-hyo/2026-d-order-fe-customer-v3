export type AdDate = "2026-05-26" | "2026-05-27" | "2026-05-28";

export type NoContactBoothInfo = {
  date: AdDate;
  booths: string[];
};

export const NO_CONTACT_BOOTH_INFO: NoContactBoothInfo[] = [
  {
    date: "2026-05-26",
    booths: ['철학과', '미술학과', '뭐먹을과'],
  },
  {
    date: "2026-05-27",
    booths: ['교육학과', '중어중문과', '구구까과'],
  },
  {
    date: "2026-05-28",
    booths: ['뭐입을과', 'FC온라인', '감귤포장학과'],
  },
];
