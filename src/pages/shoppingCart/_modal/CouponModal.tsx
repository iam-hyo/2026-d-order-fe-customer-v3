import { useState } from 'react';
import styled from 'styled-components';
import React, { SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';

interface CouponModalProps {
  onClose: () => void;
  CheckCoupon: (code: string) => Promise<unknown>;
  appliedCoupon: boolean;
  setAppliedCoupon: () => void;
  couponCode: string;
  setCouponCode: React.Dispatch<SetStateAction<string>>;
  couponName: string;
  setCouponName: React.Dispatch<SetStateAction<string>>;
  setUsingCoupon: React.Dispatch<SetStateAction<string>>;
  setCouponType: React.Dispatch<SetStateAction<string>>;
  couponType: string;
}

const CouponModal = ({
  onClose,
  CheckCoupon,
  appliedCoupon,
  setAppliedCoupon,
  couponCode,
  setCouponCode,
  couponName,
  setCouponName,
  setUsingCoupon,
  setCouponType,
  couponType,
}: CouponModalProps) => {
  const [couponError, setCouponError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');

    try {
      if (appliedCoupon) return;
      setSubmitting(true);
      const result = await CheckCoupon(couponCode);
      const payload = result as {
        data?: { coupon_name?: string; discount_type?: string };
      };
      setCouponName(String(payload?.data?.coupon_name ?? ''));
      setUsingCoupon(couponCode);
      setCouponType(String(payload?.data?.discount_type ?? ''));
      setCouponCode('');
      setCouponError('');
      onClose();
    } catch (error) {
      const err = error as Error & { status?: number; errorCode?: string };
      const msg = err.message || '유효하지 않은 쿠폰 번호입니다.';
      const TOAST_ONLY_CODES = ['COUPON_CODE_IN_USE', 'COUPON_ALREADY_APPLIED', 'CART_NOT_ACTIVE'];
      const isToastOnly = err.errorCode
        ? TOAST_ONLY_CODES.includes(err.errorCode)
        : err.status === 409;
      if (!isToastOnly) setCouponError(msg);
      toast.error(msg, {
        icon: <img src={IMAGE_CONSTANTS.CHECK} alt="" />,
        closeButton: false,
        style: {
          backgroundColor: '#FF6E3F',
          color: '#FAFAFA',
          fontSize: '14px',
          fontWeight: '800',
          borderRadius: '8px',
          padding: '0.75rem 0.875rem',
          zIndex: 100,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    if (couponError) setCouponError('');
  };

  const isDisabled = couponCode === '' || appliedCoupon;
  const handleDeleteCoupon = () => {
    if (submitting) return;
    setAppliedCoupon();
  };
  return (
    <Wrapper>
      <ModalContainer>
        <Title>쿠폰 번호를 입력해 주세요</Title>
        <InputContainer>
          <CouponInput
            type="text"
            value={couponCode}
            onChange={handleInputChange}
            placeholder="쿠폰 번호 입력"
            disabled={appliedCoupon}
            $hasError={!!couponError}
          />
          {couponError && <ErrorText>{couponError}</ErrorText>}
        </InputContainer>
        {appliedCoupon && (
          <CouponContainer>
            <SubTitle>현재 적용된 쿠폰</SubTitle>
            <CouponWraper>
              <img
                src={
                  couponType === 'percent'
                    ? IMAGE_CONSTANTS.COUPONICONPERCENT
                    : IMAGE_CONSTANTS.COUPONICON
                }
                alt="쿠폰 이미지"
                id="coupon"
              />
              <div>
                {couponName?.trim() ? couponName : '쿠폰'}
                <img
                  src={IMAGE_CONSTANTS.XICON}
                  alt="쿠폰 적용 취소하기"
                  id="close"
                  onClick={() => handleDeleteCoupon()}
                />
              </div>
            </CouponWraper>
          </CouponContainer>
        )}
      </ModalContainer>
      <ButtonContainer>
        <CancelButton onClick={onClose}>취소</CancelButton>
        <Divider />
        <ApplyButton onClick={handleApply} disabled={isDisabled || submitting}>
          쿠폰 적용
        </ApplyButton>
      </ButtonContainer>
    </Wrapper>
  );
};

export default CouponModal;

const Wrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  border-radius: 14px;
  background-color: white;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;
const ModalContainer = styled.div`
  padding: 24px 24px 12px 24px;
  min-width: 300px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
  ${({ theme }) => theme.fonts.SemiBold16}
`;

const InputContainer = styled.div`
  margin-bottom: 24px;
`;

const CouponInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 48px;
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.status.error : theme.colors.Black02};
  border-radius: 8px;
  padding: 0 16px;
  font-size: 16px;
  box-sizing: border-box;
  ${({ theme }) => theme.fonts.SemiBold12}
  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.status.error : theme.colors.Black02};
  }
`;

const ErrorText = styled.p`
  position: absolute;
  margin: 6px 0 0;
  color: ${({ theme }) => theme.status.error};
  ${({ theme }) => theme.fonts.SemiBold12}
`;

const CouponContainer = styled.section`
  display: flex;
  flex-direction: column;
`;

const SubTitle = styled.p`
  ${({ theme }) => theme.fonts.SemiBold10};
  color: ${({ theme }) => theme.colors.Black01};
`;

const CouponWraper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.Orange01};
  width: 100%;
  ${({ theme }) => theme.fonts.SemiBold12}
  box-sizing: border-box;
  border-radius: 4px;
  padding: 4px;
  margin-top: 8px;
  div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  #coupon {
    width: 32px;
    padding: 8px;
  }
  #close {
    cursor: pointer;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.Black02};
  height: 50px;
`;

const CancelButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  color: #888888;
  padding: 8px 0;
  cursor: pointer;
  ${({ theme }) => theme.fonts.Medium16}
`;

const Divider = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.Black02};
`;

const ApplyButton = styled.button<{ disabled: boolean }>`
  flex: 1;
  background: none;
  border: none;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.Black02 : theme.colors.Orange01};
  padding: 8px 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  ${({ theme }) => theme.fonts.Medium16}
`;
