import type { CartSnapshotData } from '../types/cartWs';

/** REST/WS 전체 스냅샷인지 검사 (부분 이벤트 payload 제외) */
export function isCartSnapshot(obj: unknown): obj is CartSnapshotData {
  if (typeof obj !== 'object' || obj === null) return false;
  const data = obj as CartSnapshotData;
  const tableUsage = data.table_usage;
  const cart = data.cart;
  const summary = data.summary;
  return (
    tableUsage != null &&
    typeof tableUsage.booth_id === 'number' &&
    typeof tableUsage.table_num === 'number' &&
    cart != null &&
    typeof cart.id === 'number' &&
    summary != null &&
    typeof summary.subtotal === 'number' &&
    typeof summary.total === 'number' &&
    Array.isArray(data.items)
  );
}
