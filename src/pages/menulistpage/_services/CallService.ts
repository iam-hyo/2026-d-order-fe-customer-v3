// src/pages/MenuListPage/_services/CallService.ts
import { cartApiV3 } from '@pages/shoppingCart/_api/cartApiV3';
import { useCartSnapshotStore } from '@stores/cartSnapshotStore';

export const CallService = {
  /** 메뉴 리스트 헤더 직원 호출 — Spring staffcall/request (일반 STAFF_CALL) */
  callStaff: async () => {
    const boothId = sessionStorage.getItem('boothId');
    if (!boothId) throw new Error('Booth-ID가 없습니다.');

    // WS 첫 snapshot 메시지 도착 전 race를 피하기 위해 REST로 fallback
    let snap = useCartSnapshotStore.getState().snapshot;
    if (snap?.table_usage?.table_id == null || snap?.cart?.id == null) {
      snap = await cartApiV3.getDetail();
    }

    const tableId = snap?.table_usage?.table_id;
    const cartId = snap?.cart?.id;
    if (tableId == null || cartId == null) {
      throw new Error('테이블 또는 장바구니 정보가 없습니다.');
    }

    return cartApiV3.requestGeneralStaffCall({ tableId, cartId });
  },
};
