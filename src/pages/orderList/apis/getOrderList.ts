// src/pages/orderList/apis/getOrderList.ts
import axios from "axios";
import { instance } from "../../../services/instance";

/**
 * v3 주문 내역 API 응답 타입
 * GET /api/v3/django/order/table/{table_usage_id}/
 */
export interface V3OrderItem {
  id: number;
  menu_id: number;
  name: string;
  image: string | null;
  quantity: number;
  fixed_price: number;
  item_total_price: number;
  from_set: boolean;
  status?: string;
}

export interface V3Order {
  order_id: number;
  order_number: number;
  order_status: string;
  created_at: string;
  has_coupon: boolean;
  coupon_name: string | null;
  table_coupon_id: number | null;
  order_discount_price: number;
  order_fixed_price: number;
  order_items: V3OrderItem[];
}

export interface V3OrderListResponse {
  message: string;
  data: {
    table_usage_id: number;
    table_number: string;
    table_total_price: number;
    total_original_price: number;
    total_discount_price: number;
    order_list: V3Order[];
  };
}

/**
 * 프론트에서 쓰기 쉬운 정규화된 아이템 타입
 */
export type NormalizedOrderItem = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

/**
 * 같은 order_id/order_number로 묶이는 주문 그룹 타입
 */
export type NormalizedOrderGroup = {
  orderId: number;
  orderNumber: number;
  orderStatus: string;
  createdAt: string;
  orderFixedPrice: number;
  orderDiscountPrice: number;
  items: NormalizedOrderItem[];
};

export function toAbsoluteUrl(path?: string | null): string | null {
  if (!path) return null;

  const trimmed = String(path).trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/+$/, "");
  const rel = trimmed.replace(/^\/+/, "");

  return base ? `${base}/${rel}` : `/${rel}`;
}

/**
 * v3 주문 내역 조회 후, UI에서 쓰기 쉬운 형태로 변환한 응답 타입
 */
export interface OrderListUiResponse {
  status: "success" | "error";
  code: number;
  data?: {
    table_number: string;
    order_amount: number;

    /**
     * 기존 호환용 flat 주문 목록
     * 필요 없으면 나중에 제거해도 됩니다.
     */
    orders: NormalizedOrderItem[];

    /**
     * 실제 주문내역 화면에서 사용할 주문 그룹 목록
     */
    orderGroups: NormalizedOrderGroup[];
  };
  message?: string;
}

export async function getOrderList(
  tableUsageId: number
): Promise<OrderListUiResponse> {
  if (!tableUsageId) {
    return {
      status: "error",
      code: 400,
      message: "유효한 세션(table_usage_id)이 필요합니다.",
    };
  }

  try {
    const res = await instance.get<V3OrderListResponse>(
      `/api/v3/django/order/table/${tableUsageId}/`
    );

    const raw = res.data;

    const orderGroups: NormalizedOrderGroup[] = raw.data.order_list.map(
      (order) => ({
        orderId: order.order_id,
        orderNumber: order.order_number,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        orderFixedPrice: order.order_fixed_price,
        orderDiscountPrice: order.order_discount_price,
        items: order.order_items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.fixed_price,
          image: toAbsoluteUrl(item.image),
          quantity: item.quantity,
        })),
      })
    );

    const orders: NormalizedOrderItem[] = orderGroups.flatMap(
      (group) => group.items
    );

    return {
      status: "success",
      code: 200,
      data: {
        table_number: raw.data.table_number,
        order_amount: raw.data.table_total_price,
        orders,
        orderGroups,
      },
      message: raw.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data as {
        message?: string;
        code?: string;
      };

      let message = errorData?.message || "알 수 없는 오류가 발생했습니다.";

      if (!errorData?.message) {
        switch (status) {
          case 400:
            message = "세션 식별 정보가 없습니다.";
            break;
          case 403:
            message = "활성화된 테이블 세션이 없습니다.";
            break;
          case 404:
            message = "테이블 정보를 찾을 수 없습니다.";
            break;
          case 500:
            message = "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            break;
          default:
            message = "알 수 없는 오류가 발생했습니다.";
            break;
        }
      }

      return {
        status: "error",
        code: status,
        message,
      };
    }

    return {
      status: "error",
      code: 500,
      message: "네트워크 오류가 발생했습니다.",
    };
  }
}