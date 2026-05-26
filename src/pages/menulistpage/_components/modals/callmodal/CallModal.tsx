import * as S from './CallModal.styled';

import { useState } from 'react';
import { CallService } from '@pages/menulistpage/_services/CallService';

interface CallModalProps {
  onClose: () => void;
  /** 메뉴 리스트 공통 오렌지 토스트(장바구니 담기 한도 알림과 동일 스타일) */
  onNotify: (message: string) => void;
}

const CallModal = ({ onClose, onNotify }: CallModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleCall = async () => {
    try {
      setLoading(true);

      await CallService.callStaff();
      onNotify('직원을 호출했어요.');
      onClose();
    } catch (e: unknown) {
      // console.error(e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (e instanceof Error ? e.message : null) ??
        '호출에 실패했어요. 다시 시도해 주세요.';
      onNotify(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <S.BackDrop onClick={onClose}>
      <S.ModalBox onClick={(e) => e.stopPropagation()}>
        <S.Box1>직원을 호출하시겠습니까?</S.Box1>
        <S.Box2>
          <S.Button1 onClick={onClose}>취소</S.Button1>
          <S.Button2 onClick={handleCall}>
            {loading ? '호출 중…' : '직원 호출'}
          </S.Button2>
        </S.Box2>
      </S.ModalBox>
    </S.BackDrop>
  );
};

export default CallModal;
