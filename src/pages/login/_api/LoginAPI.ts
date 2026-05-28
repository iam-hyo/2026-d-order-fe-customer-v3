import axios from 'axios';

// base URL 정규화 (trailing slash 제거 후 일관된 URL 생성)
const getBaseUrl = (): string =>
  (import.meta.env.VITE_BASE_URL ?? '').replace(/\/+$/, '');

// 부스 이름 API 응답 타입 (v3: GET /api/v3/django/booth/name?booth_id=)
export interface BoothNameResponseV3 {
  message: string;
  data: {
    booth_name: string;
  };
}

// 테이블 입장 API 응답 타입 (v3: POST /api/v3/django/booth/{booth_id}/tables)
export interface TableEnterResponse {
  message: string;
  data: {
    table_usage_id: number;
    table_num: number;
    started_at: string;
  };
}

// 부스 이름 가져오기 (v3: 인증 불필요)
export const fetchBoothName = async (boothId: string): Promise<string> => {
  try {
    if (!boothId) {
      return '부스 이름';
    }

    const response = await axios.get<BoothNameResponseV3>(
      `${getBaseUrl()}/api/v3/django/booth/${boothId}/name`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (response.status === 200 && response.data?.data?.booth_name) {
      return response.data.data.booth_name;
    }

    return 'QR코드를 다시 찍어주세요.';
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // console.error('부스 이름 조회 실패:', error.response.data);
    }
    return 'QR코드를 다시 찍어주세요.';
  }
};

// 테이블 입장 처리 (v3: 인증 불필요). 응답 헤더에 booth_id가 올 수 있음.
export const enterTable = async (
  boothId: string,
  tableNum: string,
): Promise<import('axios').AxiosResponse<TableEnterResponse>> => {
  const numericTableNum = parseInt(tableNum, 10);

  // 유효성 검사: boothId(UUID) 존재 여부만 확인
  if (!boothId) {
    throw new Error('유효하지 않은 부스 ID입니다.');
  }

  const response = await axios.post<TableEnterResponse>(
    `${getBaseUrl()}/api/v3/django/booth/${boothId}/table/`,
    { table_num: numericTableNum },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  // 응답 전체 반환 (헤더에 booth_id 등이 올 수 있음)
  return response;
};
