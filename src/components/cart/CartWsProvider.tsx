import { useCartWebSocket } from '@hooks/useCartWebSocket';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * table_usage_id가 sessionStorage에 있으면 실시간 장바구니 WebSocket에 연결합니다.
 * DefaultLayout 하위에서 사용합니다.
 *
 * sessionStorage는 탭별로 격리되므로 다른 탭의 변경이 이 탭에 전파되지 않는다
 * (그래서 storage 이벤트 리스너는 필요 없음).
 */
export function CartWsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [tableUsageId, setTableUsageId] = useState<string | null>(() => {
    return typeof window !== 'undefined'
      ? sessionStorage.getItem('tableUsageId')
      : null;
  });

  // 같은 탭에서 sessionStorage가 갱신돼도 re-render가 안 나기 때문에,
  // 라우트 이동 시점에 다시 읽어 WS를 즉시 연결한다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTableUsageId(sessionStorage.getItem('tableUsageId'));
  }, [location.key]);

  useCartWebSocket(tableUsageId);
  return <>{children}</>;
}
