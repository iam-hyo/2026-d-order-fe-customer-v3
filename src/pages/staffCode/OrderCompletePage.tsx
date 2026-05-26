//주문완료 페이지
import * as S from './OrderCompletePage.styled';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import fireWork from '@assets/lottie/fireworks.json';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';
import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import { useCartSnapshotStore } from '@stores/cartSnapshotStore';
import { cartApiV3 } from '../shoppingCart/_api/cartApiV3';

const OrderCompletePage = () => {
  const navigate = useNavigate();
  const setSnapshot = useCartSnapshotStore((s) => s.setSnapshot);

  // 주문 완료 시 백엔드 cart reset 호출 → ACTIVE(round+1)로 전환
  useEffect(() => {
    cartApiV3.reset()
      .then(() => {
        // console.log('[OrderComplete] 장바구니 reset 성공');
        setSnapshot(null);
      })
      .catch(() => {
        // console.error('[OrderComplete] 장바구니 reset 실패:', err);
        setSnapshot(null);
      });
  }, [setSnapshot]);

  return (
    <S.Wrapper>
      <S.TitleWrapper>
        <S.CheckIcon src={IMAGE_CONSTANTS.CHECK} alt="체크" />
        <S.Title>주문이 완료되었어요!</S.Title>
      </S.TitleWrapper>

      <S.LogoWrapper>
        <S.LottieWrapper>
          <Lottie animationData={fireWork} loop={true} />
        </S.LottieWrapper>
        <S.Logo />
      </S.LogoWrapper>
      {/* <S.ToDevPageBtn onClick= {() => navigate(ROUTE_CONSTANTS.DEVPAGE)}>
        <img src={IMAGE_CONSTANTS.TODEVPAGE} alt="개발자 페이지로" />
      </S.ToDevPageBtn> */}
      <S.BtnWrapper>
        {/* <S.ToDevPageBtn onClick= {() => navigate(ROUTE_CONSTANTS.DEVPAGE)}>
          <img src={IMAGE_CONSTANTS.TODEVPAGE} alt="개발자 페이지로" />
        </S.ToDevPageBtn> */}
        <S.Row>
          <S.Btn onClick={() => navigate(ROUTE_CONSTANTS.ORDERLIST)}>
            주문 내역보기
          </S.Btn>
          <S.Btn
            $moreMenu={true}
            onClick={() => navigate(ROUTE_CONSTANTS.MENULIST)}
          >
            다른 메뉴 더 보기
          </S.Btn>
        </S.Row>
      </S.BtnWrapper>
    </S.Wrapper>
  );
};

export default OrderCompletePage;
