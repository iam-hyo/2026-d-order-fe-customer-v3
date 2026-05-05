// src/pages/orderList/_components/OrderListItems.tsx
import React from 'react';
import * as S from '../OrderListPage.styled';

type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface OrderItemProps {
  name: string;
  price: number;
  quantity: number;
  image: string | SvgComp;
}

const OrderListItems = ({ name, price, quantity, image }: OrderItemProps) => {
  const isUrl = typeof image === 'string';

  return (
    <S.ItemWrapper>
      <S.ImageWrapper>
        {isUrl ? (
          <img src={image} alt={`${name} 이미지`} />
        ) : (
          React.createElement(image as SvgComp, {
            role: 'img',
            'aria-label': `${name} 이미지`,
          })
        )}
      </S.ImageWrapper>

      <S.ContentContainer>
        <S.TitleWrapper>
          <p>{name}</p>
        </S.TitleWrapper>

        <S.InfoContainer>
          <S.PriceWrapper>{price.toLocaleString()}원</S.PriceWrapper>
          <S.AmountWrapper>{quantity}</S.AmountWrapper>
        </S.InfoContainer>
      </S.ContentContainer>
    </S.ItemWrapper>
  );
};

export default OrderListItems;