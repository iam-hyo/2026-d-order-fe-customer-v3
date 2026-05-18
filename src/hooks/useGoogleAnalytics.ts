import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ReactGA from "react-ga4";

// 타입 선언을 훅 파일에 직접 추가
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
let isGAInitialized = false; // GA 초기화 상태 추적
let boothAccessTracked = false; // 부스 접속 이벤트 중복 방지

export const useGoogleAnalytics = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const boothId = searchParams.get("id"); // URL에서 부스 ID 추출

  // GA4 초기화 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    if (MEASUREMENT_ID) {
      // 로컬 환경에서는 GA 비활성화
      if (window.location.hostname === "localhost") {
        //console.log("🚫 로컬 환경 - GA4 초기화 건너뜀");
        isGAInitialized = false; // 로컬에서는 초기화 상태를 false로 설정
        return;
      }

      ReactGA.initialize(MEASUREMENT_ID);
      isGAInitialized = true; // 초기화 완료 표시
      //console.log("✅ GA4 초기화 완료:", MEASUREMENT_ID);
    }
  }, []);

  // 부스 ID 설정 및 최초 접속 이벤트 (한 번만 실행)
  useEffect(() => {
    if (MEASUREMENT_ID && isGAInitialized && boothId && !boothAccessTracked) {
      // 로컬스토리지에 부스 ID 저장 (다른 컴포넌트에서 사용할 수 있도록)
      sessionStorage.setItem("boothId", boothId);

      // 부스 ID를 GA4에 커스텀 매개변수로 설정
      ReactGA.set({ booth_id: boothId });

      // 부스 접속 이벤트 전송 (QR 코드 스캔 추적) - 한 번만
      ReactGA.event("booth_access", {
        booth_id: boothId,
        access_method: "qr_code",
        page: location.pathname,
      });

      boothAccessTracked = true; // 중복 방지 플래그 설정
      //console.log("🏪 부스 접속 추적 (최초 1회):", boothId);
    }
  }, [boothId, isGAInitialized, location.pathname]);

  // 페이지 변경 시마다 페이지뷰 전송
  useEffect(() => {
    // GA가 초기화되었을 때만 페이지뷰 전송
    if (MEASUREMENT_ID && isGAInitialized) {
      // 로컬스토리지에서 부스 ID 가져오기 (URL에 없어도 유지)
      const storedBoothId = sessionStorage.getItem("boothId");

      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
        // 저장된 부스 ID가 있으면 페이지뷰에 포함
        ...(storedBoothId && { booth_id: storedBoothId }),
      });
      //console.log("📊 페이지뷰 전송:", location.pathname + location.search);
    } else if (window.location.hostname === "localhost") {
      //console.log("🚫 로컬 환경 - 페이지뷰 전송 건너뜀:", location.pathname);
    }
  }, [location]);
};

// // 커스텀 이벤트 추적 함수 (부스 ID 자동 포함)
// export const trackEvent = (
//   eventName: string,
//   parameters?: Record<string, any>
// ) => {
//   // GA가 초기화되었을 때만 이벤트 전송
//   if (MEASUREMENT_ID && isGAInitialized) {
//     // 로컬스토리지에서 부스 ID 가져오기
//     const storedBoothId = sessionStorage.getItem("boothId");

//     ReactGA.event(eventName, {
//       ...parameters,
//       ...(storedBoothId && { booth_id: storedBoothId }), // 부스 ID 자동 추가
//     });
//     //console.log("🎯 이벤트 전송:", eventName, parameters);
//   }
// };

// // 주문 관련 이벤트 (부스 ID 포함)
// export const trackOrderEvent = (menuItem: string, quantity?: number) => {
//   if (isGAInitialized) {
//     trackEvent("order_placed", {
//       menu_item: menuItem,
//       quantity: quantity || 1,
//       page: window.location.pathname,
//     });
//   }
// };

// // 장바구니 이벤트
// export const trackCartEvent = (action: "add" | "remove", menuItem: string) => {
//   if (isGAInitialized) {
//     trackEvent("cart_action", {
//       action: action,
//       menu_item: menuItem,
//       page: window.location.pathname,
//     });
//   }
// };

// // 직원 호출 이벤트
// export const trackStaffCallEvent = () => {
//   if (isGAInitialized) {
//     trackEvent("staff_call", {
//       page: window.location.pathname,
//     });
//   }
// };
