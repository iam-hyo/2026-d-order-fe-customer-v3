import { instance } from "@services/instance";

export interface BoothAdItem {
  boothName: string;
  location: string;
  totalTable: number;
  remainingTable: number;
  boothImage?: string;
}

interface BoothAdRaw {
  boothName?: string;
  location?: string;
  totalTable?: number;
  remainingTable?: number;
  thumbnailUrl?: string | null;
}

export interface BoothAdResponse {
  message: string;
  data: BoothAdRaw[];
}

export const fetchBoothAds = async (date: string): Promise<BoothAdItem[]> => {
  const res = await instance.get<BoothAdResponse>(
    "/api/v3/django/booth/ad-banner/",
    { params: { date } }
  );
  return (res.data?.data ?? []).map((b) => ({
    boothName: b.boothName ?? '',
    location: b.location ?? '',
    totalTable: b.totalTable ?? 0,
    remainingTable: b.remainingTable ?? 0,
    boothImage: b.thumbnailUrl ?? '',
  }));
};
