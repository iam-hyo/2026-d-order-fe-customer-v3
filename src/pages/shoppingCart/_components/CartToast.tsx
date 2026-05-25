import * as S from './CartToast.styled';

import { IMAGE_CONSTANTS } from '@constants/ImageConstants';

type Props = {
  message: string | null;
  /** 입금·직원호출 모달 등 오버레이 위에 표시 */
  elevated?: boolean;
};

export default function CartToast({ message, elevated }: Props) {
  if (!message) return null;
  return (
    <S.Toast $elevated={elevated}>
      <S.ToastIcon src={IMAGE_CONSTANTS.Notice} alt="" />
      {message}
    </S.Toast>
  );
}

