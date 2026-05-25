import CartToast from '@pages/shoppingCart/_components/CartToast';
import { useCartWebSocket } from '@hooks/useCartWebSocket';
import { consumePendingMergeToast } from '@services/cartTableMerge';
import { useCartMergeToastStore } from '@stores/cartMergeToastStore';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MERGE_TOAST_DURATION_MS = 2800;

/**
 * table_usage_id가 sessionStorage에 있으면 실시간 장바구니 WebSocket에 연결합니다.
 * DefaultLayout 하위에서 사용합니다.
 *
 * sessionStorage는 탭별로 격리되므로 다른 탭의 변경이 이 탭에 전파되지 않는다
 * (그래서 storage 이벤트 리스너는 필요 없음).
 */
export function CartWsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const mergeToastMessage = useCartMergeToastStore((s) => s.message);
  const [tableUsageId, setTableUsageId] = useState<string | null>(() => {
    return typeof window !== 'undefined'
      ? sessionStorage.getItem('tableUsageId')
      : null;
  });

  // CART_MERGED 후 로그인 화면 도착 시 저장해 둔 메시지로 토스트 표시
  useEffect(() => {
    const pending = consumePendingMergeToast();
    if (!pending) return;
    useCartMergeToastStore
      .getState()
      .show(pending, MERGE_TOAST_DURATION_MS);
  }, [location.key]);

  // 같은 탭에서 sessionStorage가 갱신돼도 re-render가 안 나기 때문에,
  // 라우트 이동 시점에 다시 읽어 WS를 즉시 연결한다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTableUsageId(sessionStorage.getItem('tableUsageId'));
  }, [location.key]);

  useCartWebSocket(tableUsageId);
  return (
    <>
      {children}
      <CartToast message={mergeToastMessage} elevated />
    </>
  );
}
