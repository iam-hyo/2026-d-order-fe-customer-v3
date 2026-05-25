import { useCartSnapshotStore } from '@stores/cartSnapshotStore';

/**
 * 테이블 초기화(BE의 reset_tables) 또는 410 응답 발생 시 호출.
 *
 * 손님이 직접 테이블 번호를 다시 입력하도록 로그인 화면으로 보낸다.
 * (자동 재입장은 사용하지 않음 — 새로운 손님처럼 테이블 번호 입력부터 시작)
 *
 * 호출 지점:
 *  - useCartWebSocket.ts: WS로 `CART_RESET` + `data.ended === true` 수신 시
 *  - services/instance.ts: API가 410(Gone)을 반환했을 때
 *
 * WS와 410이 거의 동시에 트리거될 수 있으므로 inFlight 플래그로 중복 이동 방지.
 */

let inFlight = false;

export function redirectToLoginAfterTableReset(): void {
  if (inFlight) return;
  inFlight = true;

  // 만료된 세션 흔적 제거
  sessionStorage.removeItem('tableUsageId');
  sessionStorage.removeItem('cartId');
  sessionStorage.removeItem('paymentOwner');
  sessionStorage.removeItem('paymentAccountInfo');
  sessionStorage.removeItem('paymentStaffCall');
  useCartSnapshotStore.getState().setSnapshot(null);

  const boothId = sessionStorage.getItem('boothId');
  window.location.href = boothId ? `/?id=${boothId}` : '/';
}
