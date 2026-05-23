import styled from 'styled-components';

export const Wrapper = styled.div`
  min-height: calc(var(--vh, 1vh) * 100);
`;

// for OrderListHeader
export const Header = styled.header`
  box-sizing: border-box;
  padding: 2rem 1.25rem;

  display: flex;
  justify-content: space-between;
  width: 100%;

  button {
    padding: 0;
  }

  div {
    ${({ theme }) => theme.fonts.ExtraBold18};
  }
`;

export const TotalWrapper = styled.div`
  box-sizing: border-box;
  padding: 0.2rem 1.25rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const TotalPrice = styled.p`
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold16}
`;

export const PriceText = styled.p`
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.ExtraBold16}
`;

// for OrderListItems
export const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 4.3rem;
  box-sizing: border-box;
  gap: 20px;
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 0.3rem;
`;

export const ImageWrapper = styled.div<{ $isDefaultImage?: boolean }>`
  width: 4.3rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.colors.Gray01};
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  /* MenuItem의 MenuImage 스타일 조건문 적용 */
  ${({ $isDefaultImage }) =>
    $isDefaultImage
      ? `
    aspect-ratio: 1 / 1;
    height: auto;
  `
      : `
    height: 4.3rem;
  `}

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
`;

export const ContentContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
`;

export const TitleWrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  p {
    ${({ theme }) => theme.fonts.Bold16};
    color: ${({ theme }) => theme.colors.Black01};
  }
`;

export const InfoContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const PriceWrapper = styled.p`
  ${({ theme }) => theme.fonts.SemiBold14};
  color: ${({ theme }) => theme.colors.Black01};
  opacity: 0.6;
`;

export const AmountWrapper = styled.p`
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.ExtraBold16};
  margin-right: 2rem;
`;

// for OrderListPage
export const HeaderWrapper = styled.div`
  width: 100%;
  height: fit-content;
  box-shadow: 0px 4px 4px 0px #00000005;
`;

export const PageWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  box-sizing: border-box;
  padding: 0 1rem 1rem;
`;

export const OrderListWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

// for Order Group
export const OrderGroupSection = styled.section`
  width: 100%;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  padding-top: 1.5rem;
`;

export const OrderGroupHeader = styled.div`
  width: 100%;
  box-sizing: border-box;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const OrderGroupTitle = styled.p`
  ${({ theme }) => theme.fonts.Bold16};
  color: ${({ theme }) => theme.colors.Black01};
`;

export const OrderGroupTime = styled.p`
  ${({ theme }) => theme.fonts.Bold14};
  color: ${({ theme }) => theme.colors.Gray02};
`;

export const OrderGroupItemList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const OrderGroupDivider = styled.img`
  width: 100%;
  display: block;
  margin-top: 1.2rem;
`;
