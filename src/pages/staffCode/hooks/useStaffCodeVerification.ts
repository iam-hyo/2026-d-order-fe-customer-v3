import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANTS } from "@constants/RouteConstants";

import { createOrderWithStaffCode } from "../_api/StaffCodeAPI";
import { StaffCodeInputRef } from "../_components/StaffCodeInput";

type Options = {
  couponCode?: string;
  cartId?: number | string;
};

export const useStaffCodeVerification = (options?: Options) => {
  const navigate = useNavigate();
  const codeInputRef = useRef<StaffCodeInputRef>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [showError, setShowError] = useState(false);
  const verifiedRef = useRef(false);

  const resetErrorAndCode = () => {
    setShowError(false);
    codeInputRef.current?.resetCode();
  };

  const handleCodeVerification = async (code: string) => {
    if (verifiedRef.current) return;
    if (isVerifying) return;
    if (!/^\d{4}$/.test(code)) return;

    setIsVerifying(true);
    try {
      // ✅ 직원코드로 '주문 생성' (POST /tables/orders/order_check/)
      const ok = await createOrderWithStaffCode(code, {
        couponCode: options?.couponCode,
        cartId: options?.cartId,
      });

      if (ok) {
        verifiedRef.current = true;
        sessionStorage.removeItem("cartId");
        navigate(ROUTE_CONSTANTS.ORDERCOMPLETE);
      } else {
        setShowError(true);
        setTimeout(resetErrorAndCode, 800);
      }
    } catch {
      alert("처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      resetErrorAndCode();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = () => {
    if (showError) setShowError(false);
  };

  return {
    codeInputRef,
    isVerifying,
    showError,
    handleCodeVerification,
    handleInputChange,
  };
};
