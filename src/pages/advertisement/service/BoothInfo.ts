import { instance } from "@services/instance";
import { MOCK_BOOTH_DATA } from "../const/mockBoothData";

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

// ─────────────────────────────────────────────────────────────────────
// [MOCK 데이터 전환용 함수] 평소엔 사용되지 않음.
// API 가 막혀 있거나 로컬에서 화면 확인이 필요할 때 AdPage 의 import 및
// fetchData 분기를 토글해서 사용. 데이터는 ../const/mockBoothData.ts.
// ─────────────────────────────────────────────────────────────────────

const mapMockByDate = (date: string): BoothAdItem[] =>
  MOCK_BOOTH_DATA
    .filter((b) => b.dates.includes(date))
    .map((b) => ({
      boothName: b.boothName,
      location: b.location,
      totalTable: b.boothAllTable,
      remainingTable: Math.max(0, b.boothAllTable - b.boothUsageTable),
      boothImage: b.boothImage,
    }));

export const fetchBoothAdsMock0526 = async (): Promise<BoothAdItem[]> =>
  mapMockByDate('2026-05-26');

export const fetchBoothAdsMock0527 = async (): Promise<BoothAdItem[]> =>
  mapMockByDate('2026-05-27');

export const fetchBoothAdsMock0528 = async (): Promise<BoothAdItem[]> =>
  mapMockByDate('2026-05-28');
