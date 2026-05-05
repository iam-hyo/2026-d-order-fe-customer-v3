// src/pages/orderList/hooks/useOrderList.ts
import { useEffect, useState } from "react";
import { getOrderList, type OrderListUiResponse } from "../apis/getOrderList";

export const useOrderList = (tableUsageId: number) => {
  const [orderData, setOrderData] = useState<OrderListUiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const data = await getOrderList(tableUsageId);
      if (!mounted) return;

      if (data.status === "success") {
        setOrderData(data);
      } else {
        setOrderData(null);
        setError(data.message || `요청 실패 (code: ${data.code})`);
      }

      setLoading(false);
    };

    if (tableUsageId) {
      fetchOrders();
    } else {
      setLoading(false);
      setOrderData(null);
      setError("유효한 세션(table_usage_id)이 필요합니다.");
    }

    return () => {
      mounted = false;
    };
  }, [tableUsageId]);

  return { orderData, loading, error };
};