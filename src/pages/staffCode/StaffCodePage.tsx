// staffCode/StaffCodePage.tsx
import * as S from "./StaffCodePage.styled";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ROUTE_CONSTANTS } from "@constants/RouteConstants";
import XIcon from "@assets/icons/xIcon.svg";

import OrderInfo from "./_components/OrderInfo";
import StaffCodeInput from "./_components/StaffCodeInput";
import Loading from "@components/loading/Loading";

import { fetchTableOrderInfo, TableOrderInfo } from "./_api/StaffCodeAPI";
import { useStaffCodeVerification } from "./hooks/useStaffCodeVerification";

const StaffCodePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ URL 파라미터 파싱 (price, coupon_code, cart_id)
  const { priceFromQuery, couponCodeFromQuery, cartIdFromQuery } =
    useMemo(() => {
      const params = new URLSearchParams(location.search);

      // price
      const priceParam = params.get("price");
      const price =
        priceParam && !Number.isNaN(parseInt(priceParam, 10))
          ? parseInt(priceParam, 10)
          : null;

      // coupon: coupon_code > code > coupon (대소문자 변형 허용)
      const rawCoupon =
        params.get("coupon_code") ||
        params.get("code") ||
        params.get("coupon") ||
        params.get("COUPON_CODE") ||
        params.get("CODE") ||
        params.get("COUPON") ||
        undefined;
      const coupon = rawCoupon ? String(rawCoupon).trim() : undefined;

      // cart_id: cart_id > cartId > cid (대소문자 변형 허용)  ← ★ 필수
      const rawCart =
        params.get("cart_id") ||
        params.get("cartId") ||
        params.get("cid") ||
        params.get("CART_ID") ||
        undefined;
      const cartIdNum =
        rawCart && !Number.isNaN(Number(rawCart)) ? Number(rawCart) : undefined;

      // ✅ 백업 저장: API가 URL/로컬에서 회수 가능하도록
      try {
        if (cartIdNum !== undefined)
          sessionStorage.setItem("cart_id", String(cartIdNum));
      } catch {}

      return {
        priceFromQuery: price,
        couponCodeFromQuery: coupon,
        cartIdFromQuery: cartIdNum,
      };
    }, [location.search]);

  // ✅ 직원 코드 검증 훅 (쿠폰/카트 정보 전달)
  const { codeInputRef, showError, handleCodeVerification, handleInputChange } =
    useStaffCodeVerification({
      couponCode: couponCodeFromQuery,
      cartId: cartIdFromQuery,
    });

  const [tableInfo, setTableInfo] = useState<TableOrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 테이블 정보 로드 (표시용 GET은 기존대로 table_num 사용)
  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const info = await fetchTableOrderInfo({
          couponCode: couponCodeFromQuery ?? undefined,
          cartId: cartIdFromQuery,
        });

        if (!info) {
          setError(
            "진행 중인 주문 정보가 없습니다. 주문 후 다시 시도해주세요."
          );
          return;
        }

        const finalPrice =
          typeof priceFromQuery === "number" && !Number.isNaN(priceFromQuery)
            ? priceFromQuery
            : info.totalPrice;

        setTableInfo({ ...info, totalPrice: finalPrice });
      } catch (e: any) {
        setError(
          e?.message ||
            "테이블 정보를 가져오는데 실패했습니다. 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTableInfo();
  }, [priceFromQuery, couponCodeFromQuery, cartIdFromQuery]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <S.StaffCodeWrapper>
        <S.Header>
          <S.XBtn onClick={() => navigate(ROUTE_CONSTANTS.SHOPPINGCART)}>
            <img src={XIcon} alt="x버튼" />
          </S.XBtn>
        </S.Header>
        <S.StaffCodeContents>
          <S.Title>
            <div>오류가 발생했습니다</div>
          </S.Title>
          <S.ErrorMessage>{error}</S.ErrorMessage>
        </S.StaffCodeContents>
      </S.StaffCodeWrapper>
    );
  }

  return (
    <S.StaffCodeWrapper>
      <S.Header>
        <S.XBtn onClick={() => navigate(ROUTE_CONSTANTS.SHOPPINGCART)}>
          <img src={XIcon} alt="x버튼" />
        </S.XBtn>
      </S.Header>

      <S.StaffCodeContents>
        <S.Title>
          <div>직원 확인 코드를</div>
          <div>입력해 주세요.</div>
        </S.Title>

        <S.InputContents>
          {tableInfo && (
            <OrderInfo
              table={tableInfo.tableNumber}
              seat_count={tableInfo.seat_count}
              price={tableInfo.totalPrice}
            />
          )}

          <StaffCodeInput
            ref={codeInputRef}
            onComplete={(codeArray) =>
              handleCodeVerification(codeArray.join(""))
            }
            onChange={handleInputChange}
          />

          {showError && (
            <S.ErrorMessage>일치하지 않는 코드에요!</S.ErrorMessage>
          )}
        </S.InputContents>
      </S.StaffCodeContents>
    </S.StaffCodeWrapper>
  );
};

export default StaffCodePage;
