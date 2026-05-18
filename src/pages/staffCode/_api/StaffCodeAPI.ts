import { AxiosError } from "axios";
import { instance } from "@services/instance";

// 표시용 GET 응답 타입 (정보 조회)
export interface OrderCheckGetResponse {
  status: string;
  message: string;
  code: number;
  data: {
    order_amount: number;
    seat_count: number;
    coupon_discount?: number;
    coupon?: {
      coupon_name: string;
      discount_type: "percent" | "price";
      discount_value: number;
      code: string;
    } | null;
  } | null;
}

// 주문 생성(POST) 응답 타입
export interface OrderCheckPostResponse {
  status: string;
  code: number;
  message: string;
  data: {
    order_id: number;
    order_amount: number; // 최종 결제 금액 (쿠폰 반영)
    subtotal: number; // 메뉴+세트 금액 (쿠폰 전)
    table_fee: number; // 테이블/인당 이용료
    coupon_discount: number; // 할인액 (없으면 0)
    coupon: string | null; // 적용된 쿠폰 코드 (없으면 null)
    booth_total_revenues: number;
    table_num: number;
    cart_id: number;
  } | null;
}

export interface TableOrderInfo {
  tableNumber: string;
  seat_count: number;
  totalPrice: number;
}

/** 공통 회수 유틸 */
const getBoothId = (): string => {
  const boothId =
    sessionStorage.getItem("boothId") ??
    sessionStorage.getItem("boothID") ??
    sessionStorage.getItem("booth_id") ??
    "";
  return boothId?.toString().trim();
};

const getCouponFromEverywhere = (): string | undefined => {
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search);
    const raw =
      p.get("coupon_code") ||
      p.get("code") ||
      p.get("coupon") ||
      p.get("COUPON_CODE") ||
      p.get("CODE") ||
      p.get("COUPON") ||
      undefined;
    if (raw) return String(raw).trim();
  }
  const ls =
    sessionStorage.getItem("coupon_code") ??
    sessionStorage.getItem("couponCode") ??
    undefined;
  return ls ? ls.trim() : undefined;
};

const getCartIdFromEverywhere = (): number | undefined => {
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search);
    const raw =
      p.get("cart_id") ||
      p.get("cartId") ||
      p.get("cid") ||
      p.get("CART_ID") ||
      undefined;
    if (raw && Number.isFinite(Number(raw))) return Number(raw);
  }
  const rawLs =
    sessionStorage.getItem("cart_id") ?? sessionStorage.getItem("cartId") ?? "";
  if (rawLs && Number.isFinite(Number(rawLs))) return Number(rawLs);
  return undefined;
};

/** (1) 직원확인 전 정보 조회 — GET /api/v2/tables/orders/order_check/ */
export const fetchTableOrderInfo = async (
  options?: { couponCode?: string; cartId?: number } // cartId 요구 환경 대비 (있으면 params에 포함)
): Promise<TableOrderInfo | null> => {
  try {
    const boothId = getBoothId();
    if (!boothId) throw new Error("Booth-ID가 설정되지 않았습니다.");

    const tableNum = sessionStorage.getItem("tableNum") || "";
    if (!tableNum) throw new Error("table_num을 찾을 수 없습니다.");

    const coupon =
      options?.couponCode?.trim() || getCouponFromEverywhere() || undefined;
    const maybeCartId = options?.cartId ?? getCartIdFromEverywhere();

    const params: Record<string, any> = { table_num: tableNum };
    if (coupon) params.coupon_code = coupon;
    if (Number.isFinite(maybeCartId)) params.cart_id = maybeCartId;

    const response = await instance.get<OrderCheckGetResponse>(
      "/api/v2/tables/orders/order_check/",
      {
        params,
        headers: { "Booth-ID": boothId },
      }
    );

    if (response.data?.status === "success" && response.data.data) {
      return {
        tableNumber: tableNum,
        totalPrice: response.data.data.order_amount,
        seat_count: response.data.data.seat_count ?? 0,
      };
    }
    return null; // 진행 중 주문 없음
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) return null;
      console.error("[ORDER_CHECK][GET] AxiosError", error.response?.data);
      if (error.response?.status === 400) {
        throw new Error(
          error.response?.data?.message ||
            "요청 파라미터가 올바르지 않습니다. (Booth-ID / table_num / coupon_code / cart_id)"
        );
      }
    }
    throw error;
  }
};

/** (2) 직원코드로 주문 생성 — POST /api/v2/tables/orders/order_check/ */
export const createOrderWithStaffCode = async (
  staffPassword: string,
  options?: { couponCode?: string; cartId?: number | string }
): Promise<boolean> => {
  try {
    const boothId = getBoothId();
    if (!boothId) {
      alert(
        "부스 식별자(Booth-ID)를 찾을 수 없습니다. 부스 선택을 먼저 진행해 주세요."
      );
      return false;
    }

    let coupon =
      options?.couponCode?.toString().trim() || getCouponFromEverywhere();

    let cartId: number | undefined;
    if (options?.cartId !== undefined) {
      const n = Number(options.cartId);
      if (Number.isFinite(n)) cartId = n;
    }
    if (cartId === undefined) cartId = getCartIdFromEverywhere();

    if (!Number.isFinite(cartId)) {
      console.error("[ORDER_CHECK][POST] ❌ cart_id 누락/비정상:", cartId);
      alert(
        "cart_id를 찾을 수 없습니다. URL에 ?cart_id=숫자를 포함하거나 sessionStorage에 cartId 또는 cart_id를 저장하세요."
      );
      return false;
    }

    const headers = {
      "Booth-ID": boothId,
      "Content-Type": "application/json",
    };

    const body: Record<string, any> = {
      password: staffPassword, // 4자리
      cart_id: cartId, // 필수
    };
    if (coupon) body.coupon_code = coupon;

    const res = await instance.post<OrderCheckPostResponse>(
      "/api/v2/tables/orders/order_check/",
      body,
      { headers }
    );

    // 명세: 성공 시 status=success, code=201, data 포함
    return res.data?.status === "success";
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 401) {
        // 비밀번호 불일치
        return false;
      }
      if (status === 400) {
        alert(
          error.response?.data?.message ||
            "비밀번호 형식 오류 또는 요청 형식 오류"
        );
        return false;
      }
      if (status === 404) {
        alert("부스 정보(Booth-ID)가 올바르지 않거나 헤더가 누락되었습니다.");
        return false;
      }
      console.error(
        "[ORDER_CHECK][POST] AxiosError",
        status,
        error.response?.data
      );
      return false;
    }
    console.error("[ORDER_CHECK][POST] Unknown error", error);
    return false;
  }
};
