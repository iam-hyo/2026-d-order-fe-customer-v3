import { useState } from "react";
import { enterTable } from "../_api/LoginAPI";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANTS } from "@constants/RouteConstants";

export const useLogin = (boothId: string | null) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTableError, setIsTableError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(
    "실제와 다른 테이블 번호 입력 시, 이용이 제한될 수 있어요."
  );

  const handleStartOrder = async (tableValue: string) => {
    if (!tableValue) {
      return;
    }

    setIsLoading(true);
    setIsTableError(false);
    setErrorMessage(
      "실제와 다른 테이블 번호 입력 시, 이용이 제한될 수 있어요."
    );

    try {
      const storedBoothId = sessionStorage.getItem("boothId") || boothId;
      if (!storedBoothId) {
        throw new Error("부스 ID가 없습니다.");
      }

      const response = await enterTable(storedBoothId, tableValue);
      const body = response.data;

      // v3 성공 시 200 + message, data 반환
      if (body?.data?.table_num != null) {
        sessionStorage.setItem("tableNum", String(body.data.table_num));
        if (typeof body?.data?.table_usage_id === "number") {
          sessionStorage.setItem("tableUsageId", String(body.data.table_usage_id));
        }
        // 로그인 성공 시 응답 헤더에 booth_id가 있으면 저장 (이후 API에서 헤더로 사용)
        const headerBoothId =
          response.headers["booth_id"] ??
          response.headers["booth-id"] ??
          response.headers["Booth-ID"];
        if (headerBoothId) {
          sessionStorage.setItem(
            "boothId",
            typeof headerBoothId === "string" ? headerBoothId : String(headerBoothId)
          );
        }
        // 테이블 입장마다 새 clientId 발급, 이전 결제 소유권 초기화
        sessionStorage.setItem("clientId", crypto.randomUUID());
        sessionStorage.removeItem("paymentOwner");
        sessionStorage.removeItem("paymentAccountInfo");
        navigate(ROUTE_CONSTANTS.MENULIST);
      } else {
        setIsTableError(true);
        setErrorMessage(body?.message ?? "테이블 입장에 실패했습니다.");
      }
    } catch (error) {
      let message = "테이블 입장 중 오류가 발생했습니다.";
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as {
          code?: number;
          message?: string;
        };
        if (apiError.code === 404) {
          message = "없는 테이블 번호입니다.";
        } else if (apiError.code === 400) {
          message = "유효하지 않은 요청입니다.";
        } else {
          message = apiError.message || message;
        }
      }
      setIsTableError(true);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleStartOrder,
    isLoading,
    isTableError,
    errorMessage,
    setIsTableError,
    setErrorMessage,
  };
};
