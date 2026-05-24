import { instance } from "@services/instance";

export interface BoothAdItem {
  boothName: string;
  location: string;
  totalTable: number;
  remainingTable: number;
}

export interface BoothAdResponse {
  message: string;
  data: BoothAdItem[];
}

export const fetchBoothAds = async (date: string): Promise<BoothAdItem[]> => {
  const res = await instance.get<BoothAdResponse>(
    "/api/v3/django/booth/ad-banner/",
    { params: { date } }
  );
  return res.data?.data ?? [];
};
