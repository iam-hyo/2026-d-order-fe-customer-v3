import { instance } from '@services/instance';
import type { CartSnapshotData } from '../../../types/cartWs';

const getTableUsageId = (): number | null => {
  const v = sessionStorage.getItem('tableUsageId');
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

const getBoothId = (): string | null => sessionStorage.getItem('boothId');

function isCartSnapshot(obj: unknown): obj is CartSnapshotData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'cart' in obj &&
    'items' in obj &&
    Array.isArray((obj as CartSnapshotData).items)
  );
}

/**
 * v3 장바구니 REST API (실제 변경은 여기서, WS는 스냅샷 수신만)
 */
export const cartApiV3 = {
  /**
   * 장바구니 조회 (현재 테이블 이용 기준)
   * GET /api/v3/django/cart/detail/?table_usage_id=
   */
  getDetail: async (): Promise<CartSnapshotData | null> => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId) {
      throw new Error('booth_id 또는 table_usage_id 없음');
    }

    const res = await instance.get<unknown>('/api/v3/django/cart/detail/', {
      headers: { 'Booth-ID': boothId },
      params: { table_usage_id: tableUsageId },
    });

    const body = res.data as Record<string, unknown> | null | undefined;
    if (!body) return null;

    if (isCartSnapshot(body)) return body;
    const inner = body.data;
    if (isCartSnapshot(inner)) return inner;
    return null;
  },

  /**
   * 장바구니 담기
   * POST /api/v3/django/cart/
   * body: { table_usage_id, type: "menu"|"fee"|"setmenu", menu_id, set_menu_id, quantity }
   */
  add: async (params: {
    type: 'menu' | 'fee' | 'setmenu';
    menu_id?: number;
    set_menu_id?: number;
    quantity: number;
  }) => {
    const tableUsageId = getTableUsageId();
    const boothId = getBoothId();
    if (!tableUsageId || !boothId)
      throw new Error('table_usage_id 또는 booth_id 없음');

    const { type, quantity } = params;

    const body =
      type === 'setmenu'
        ? {
            table_usage_id: tableUsageId,
            type: 'setmenu' as const,
            menu_id: null,
            set_menu_id: params.set_menu_id ?? null,
            quantity,
          }
        : type === 'fee'
          ? {
              table_usage_id: tableUsageId,
              type: 'fee' as const,
              menu_id: params.menu_id ?? null,
              set_menu_id: null,
              quantity,
            }
          : {
              table_usage_id: tableUsageId,
              type: 'menu' as const,
              menu_id: params.menu_id ?? null,
              set_menu_id: null,
              quantity,
            };

    if (type === 'setmenu' && body.set_menu_id == null) {
      throw new Error('set_menu_id가 필요합니다.');
    }
    if ((type === 'menu' || type === 'fee') && body.menu_id == null) {
      throw new Error('menu_id가 필요합니다.');
    }

    const res = await instance.post('/api/v3/django/cart/', body, {
      headers: { 'Booth-ID': boothId },
    });
    return res.data;
  },

  /**
   * 장바구니 메뉴 수량 변경
   * PATCH /api/v3/django/cart/menu/
   * body: { table_usage_id, cart_item_id, quantity }
   */
  updateQuantity: async (cartItemId: number, quantity: number) => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId) {
      throw new Error('booth_id 또는 table_usage_id 없음');
    }

    const res = await instance.patch(
      '/api/v3/django/cart/menu/',
      {
        table_usage_id: tableUsageId,
        cart_item_id: cartItemId,
        quantity,
      },
      { headers: { 'Booth-ID': boothId } },
    );
    return res.data;
  },

  /**
   * 장바구니 항목 삭제
   * DELETE /api/v3/django/cart/menu/delete/
   * body: { table_usage_id, cart_item_id }
   */
  deleteItem: async (cartItemId: number) => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId) {
      throw new Error('booth_id 또는 table_usage_id 없음');
    }

    const res = await instance.delete('/api/v3/django/cart/menu/delete/', {
      headers: { 'Booth-ID': boothId },
      data: {
        table_usage_id: tableUsageId,
        cart_item_id: cartItemId,
      },
    });
    return res.data;
  },

  /**
   * 쿠폰 적용
   * POST /api/v3/django/coupon/apply-coupon/
   * body: { table_usage_id: int, coupon_code: string }
   */
  applyCoupon: async (couponCode: string) => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId)
      throw new Error('booth_id 또는 table_usage_id 없음');

    const res = await instance.post(
      '/api/v3/django/coupon/apply-coupon/',
      {
        table_usage_id: tableUsageId,
        coupon_code: String(couponCode).trim(),
      },
      { headers: { 'Booth-ID': boothId } },
    );
    return res.data;
  },

  /**
   * 쿠폰 적용 취소
   * POST /api/v3/django/coupon/apply-coupon/
   * body: { table_usage_id, coupon_code } (백엔드가 coupon_code를 필수로 요구)
   */
  cancelCoupon: async (couponCode: string) => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId)
      throw new Error('booth_id 또는 table_usage_id 없음');

    const code = String(couponCode ?? '').trim();
    if (!code) throw new Error('coupon_code가 필요합니다.');

    const res = await instance.delete('/api/v3/django/coupon/apply-coupon/', {
      headers: { 'Booth-ID': boothId },
      data: { table_usage_id: tableUsageId, coupon_code: code },
    });
    return res.data;
  },

  /**
   * 주문하기(결제 정보 조회)
   * POST /api/v3/django/cart/payment-info/
   * body: { table_usage_id }
   */
  getPaymentInfo: async () => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId)
      throw new Error('booth_id 또는 table_usage_id 없음');

    const res = await instance.post(
      '/api/v3/django/cart/payment-info/',
      { table_usage_id: tableUsageId },
      { headers: { 'Booth-ID': boothId } },
    );
    return res.data;
  },

  /**
   * 직원 호출 생성 (공통)
   * POST /api/v3/spring/server/staffcall/request
   * 응답: subscribe_token + data(staff_call_id 등)
   */
  staffCallRequest: async (params: {
    tableId: number;
    cartId: number;
    callType: string;
    category?: 'GENERAL' | 'SERVING';
  }) => {
    const boothId = getBoothId();
    if (!boothId) throw new Error('Booth-ID가 없습니다.');

    const { tableId, cartId, callType, category = 'GENERAL' } = params;
    if (!Number.isFinite(tableId) || !Number.isFinite(cartId)) {
      throw new Error('table_id 또는 cart_id가 유효하지 않습니다.');
    }
    if (!callType?.trim()) {
      throw new Error('call_type이 필요합니다.');
    }

    const res = await instance.post(
      '/api/v3/spring/server/staffcall/request',
      {
        tableId,
        cartId,
        callType,
        category,
      },
      { headers: { 'Booth-ID': boothId } },
    );

    return res.data;
  },

  /**
   * 송금 확인 요청 (직원 호출·주문 처리 트리거)
   * POST /api/v3/spring/server/staffcall/request
   */
  requestPaymentConfirmation: async (params: {
    tableId: number;
    cartId: number;
    category?: 'GENERAL' | 'SERVING';
  }) => {
    return cartApiV3.staffCallRequest({
      ...params,
      callType: 'PAYMENT_CONFIRM',
    });
  },

  /**
   * POST /api/v3/spring/server/staffcall/delete
   * body: { staffCallId, subscribeToken }
   */
  deleteStaffCall: async (params: {
    staffCallId: number;
    subscribeToken: string;
  }) => {
    const boothId = getBoothId();
    if (!boothId) throw new Error('Booth-ID가 없습니다.');

    const staffCallId = Number(params.staffCallId);
    const subscribeToken = String(params.subscribeToken ?? '').trim();
    if (!Number.isFinite(staffCallId))
      throw new Error('staffCallId가 유효하지 않습니다.');
    if (!subscribeToken) throw new Error('subscribeToken이 필요합니다.');

    const res = await instance.post(
      '/api/v3/spring/server/staffcall/delete',
      { staffCallId, subscribeToken },
      { headers: { 'Booth-ID': boothId } },
    );
    return res.data;
  },

  /**
   * 결제 대기 취소 (pending_payment → active 복귀)
   * POST /api/v3/django/cart/payment-cancel/
   * body: { table_usage_id }
   */
  paymentCancel: async () => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId)
      throw new Error('booth_id 또는 table_usage_id 없음');

    const res = await instance.post(
      '/api/v3/django/cart/payment-cancel/',
      { table_usage_id: tableUsageId },
      { headers: { 'Booth-ID': boothId } },
    );
    return res.data;
  },

  /**
   * 장바구니 초기화 (주문 완료 후 다음 라운드 시작)
   * POST /api/v3/django/cart/reset/
   * ORDERED → ACTIVE (round+1)
   */
  reset: async () => {
    const boothId = getBoothId();
    const tableUsageId = getTableUsageId();
    if (!boothId || !tableUsageId)
      throw new Error('booth_id 또는 table_usage_id 없음');

    const res = await instance.post(
      '/api/v3/django/cart/reset/',
      { table_usage_id: tableUsageId },
      { headers: { 'Booth-ID': boothId } },
    );
    return res.data;
  },

  /**
   * 메뉴 등에서 일반 직원 호출 (물/직원 등)
   * POST /api/v3/spring/server/staffcall/request
   */
  requestGeneralStaffCall: async (params: {
    tableId: number;
    cartId: number;
    category?: 'GENERAL' | 'SERVING';
  }) => {
    return cartApiV3.staffCallRequest({
      ...params,
      callType: 'STAFF_CALL',
    });
  },
};
