import styled from 'styled-components';

export const Wrapper = styled.div<{ $soldout?: boolean; disabled?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  gap: 0.5rem;

  opacity: ${({ $soldout }) => ($soldout ? 0.4 : 1)};
  pointer-events: ${({ disabled, $soldout }) =>
    disabled || $soldout ? 'none' : 'auto'};
  cursor: ${({ disabled, $soldout }) =>
    disabled || $soldout ? 'default' : 'pointer'};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1.5rem;
`;

export const Row2 = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 0.5rem;
`;

export const MenuImage = styled.img<{ $isDefaultImage?: boolean }>`
  width: 70px;
  flex-shrink: 0;
  border-radius: 7px;
  background-color: ${({ theme }) => theme.colors.Gray01};

  ${({ $isDefaultImage }) =>
    $isDefaultImage
      ? `
    aspect-ratio: 1 / 1;
    height: auto;
    object-fit: contain;
    object-position: center;
  `
      : `
    height: 70px;
    object-fit: cover;
    object-position: center;
  `}
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
`;

export const Col2 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

export const ItemName = styled.div`
  ${({ theme }) => theme.fonts.Bold14};
  color: ${({ theme }) => theme.colors.Black01};

  width: 100%;
`;

export const ItemDes = styled.div<{ $soldout?: boolean; disabled?: boolean }>`
  ${({ theme, $soldout }) =>
    $soldout ? theme.fonts.ExtraBold12 : theme.fonts.SemiBold12};
  color: ${({ theme, $soldout }) =>
    $soldout ? theme.colors.Orange01 : theme.colors.Black01};

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  width: 100%;
`;

export const ItemPrice = styled.div`
  ${({ theme }) => theme.fonts.Bold12};
  color: ${({ theme }) => theme.colors.Black01};

  white-space: nowrap;
`;

export const ItemPrice_deco = styled.div`
  ${({ theme }) => theme.fonts.SemiBold10};
  color: ${({ theme }) => theme.colors.Black01};

  text-decoration-line: line-through;

  white-space: nowrap;
`;

export const Discount = styled.div`
  ${({ theme }) => theme.fonts.Bold12};
  color: ${({ theme }) => theme.colors.Orange01};

  white-space: nowrap;
`;
