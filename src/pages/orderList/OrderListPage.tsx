// src/pages/orderList/OrderListPage.tsx
import * as S from './OrderListPage.styled';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type React from 'react';

import OrderListHeader from './_components/OrderListHeader';
import OrderListItems from './_components/OrderListItems';
import EmptyOrder from './_components/EmptyOrder';
import Loading from '@components/loading/Loading';

import ACCO from '@assets/images/characterV3.svg';
import menuLine from '@assets/images/menuLine.svg';

import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import { useOrderList } from './hooks/useOrderList';
import type { NormalizedOrderGroup } from './apis/getOrderList';

type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string | SvgComp;
  quantity: number;
}

interface OrderGroup {
  orderId: number;
  orderNumber: number;
  createdAt: string;
  items: OrderItem[];
}

const formatOrderTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const OrderListPage = () => {
  const navigate = useNavigate();
  const tableUsageId = Number(sessionStorage.getItem('tableUsageId') || 0);

  const { orderData, loading, error } = useOrderList(tableUsageId);
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);

  useEffect(() => {
    if (orderData?.status === 'success' && orderData.data) {
      const mappedGroups: OrderGroup[] = orderData.data.orderGroups.map(
        (group: NormalizedOrderGroup) => ({
          orderId: group.orderId,
          orderNumber: group.orderNumber,
          createdAt: group.createdAt,
          items: group.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image ?? ACCO,
            quantity: item.quantity,
          })),
        })
      );

      setOrderGroups(mappedGroups);
    } else {
      setOrderGroups([]);
    }
  }, [orderData]);

  if (loading) return <Loading />;

  const isListEmpty = !orderGroups || orderGroups.length === 0 || !!error;
  const totalPrice = orderData?.data?.order_amount ?? 0;

  return (
    <S.Wrapper>
      <S.HeaderWrapper>
        <OrderListHeader
          text='주문내역'
          goBack={() => navigate(ROUTE_CONSTANTS.MENULIST)}
          totalPrice={totalPrice}
        />
      </S.HeaderWrapper>

      <S.PageWrapper>
        <S.OrderListWrapper>
          {isListEmpty ? (
            <EmptyOrder />
          ) : (
            orderGroups.map((group, index) => (
              <S.OrderGroupSection key={group.orderId}>
                <S.OrderGroupHeader>
                  <S.OrderGroupTitle>
                    주문 {group.orderNumber}
                  </S.OrderGroupTitle>

                  <S.OrderGroupTime>
                    {formatOrderTime(group.createdAt)} 주문
                  </S.OrderGroupTime>
                </S.OrderGroupHeader>

                <S.OrderGroupItemList>
                  {group.items.map((item) => (
                    <OrderListItems
                      key={item.id}
                      name={item.name}
                      price={item.price}
                      quantity={item.quantity}
                      image={item.image}
                    />
                  ))}
                </S.OrderGroupItemList>

                {index !== orderGroups.length  && (
                  <S.OrderGroupDivider src={menuLine} alt='주문 구분선' />
                )}
              </S.OrderGroupSection>
            ))
          )}
        </S.OrderListWrapper>
      </S.PageWrapper>
    </S.Wrapper>
  );
};

export default OrderListPage;