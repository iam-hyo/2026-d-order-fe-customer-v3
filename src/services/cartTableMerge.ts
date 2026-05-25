import { useCartSnapshotStore } from '@stores/cartSnapshotStore';

export const CART_MERGE_TOAST_KEY = 'cartMergeToastMessage';

const CART_MERGED_TOAST_MESSAGE =
  '테이블이 합쳐졌어요. 테이블 번호를 다시 입력해 주세요.';

let mergeHandlingInFlight = false;

function clearTableSession() {
  sessionStorage.removeItem('tableUsageId');
  sessionStorage.removeItem('cartId');
  sessionStorage.removeItem('paymentOwner');
  sessionStorage.removeItem('paymentAccountInfo');
  sessionStorage.removeItem('paymentStaffCall');
  useCartSnapshotStore.getState().setSnapshot(null);
}

/** 이동 후 로그인 화면에서 토스트로 표시할 메시지 (1회성) */
export function consumePendingMergeToast(): string | null {
  const raw = sessionStorage.getItem(CART_MERGE_TOAST_KEY);
  if (!raw?.trim()) return null;
  sessionStorage.removeItem(CART_MERGE_TOAST_KEY);
  mergeHandlingInFlight = false;
  return raw.trim();
}

/** CART_MERGED: 즉시 로그인 화면으로 이동 → 도착 후 토스트 표시 */
export function handleCartMerged(): void {
  if (mergeHandlingInFlight) return;
  mergeHandlingInFlight = true;

  clearTableSession();
  sessionStorage.setItem(CART_MERGE_TOAST_KEY, CART_MERGED_TOAST_MESSAGE);

  const boothId = sessionStorage.getItem('boothId');
  window.location.href = boothId ? `/?id=${boothId}` : '/';
}
