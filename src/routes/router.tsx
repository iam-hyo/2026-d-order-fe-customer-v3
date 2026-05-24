import { createBrowserRouter, Navigate } from "react-router-dom";
import { useGoogleAnalytics } from "@hooks/useGoogleAnalytics"; // GA 훅 import
// components
import DefaultLayout from "@components/layout/DefaultLayout";

import { ROUTE_CONSTANTS } from "@constants/RouteConstants";

// pages
import LoginPage from "@pages/login/LoginPage";
import OrderListPage from "@pages/orderList/OrderListPage";
import MenulistPage from "@pages/menulistpage/MenuListPage";
import ShoppingCartPage from "@pages/shoppingCart/ShoppingCartpage";
import StaffCodePage from "@pages/staffCode/StaffCodePage";
import OrderCompletePage from "@pages/staffCode/OrderCompletePage";
import DevPage from "@pages/devpage/devPage";

import AdPage from "@pages/advertisement/AdPage";
import ErrorPage from "@components/error/ErrorPage";
// GA 추적을 위한 래퍼 컴포넌트
const LayoutWithAnalytics = ({ children }: { children: React.ReactNode }) => {
  useGoogleAnalytics(); // GA 자동 추적
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: ROUTE_CONSTANTS.LOGIN,
    element: (
      <LayoutWithAnalytics>
        <DefaultLayout />
      </LayoutWithAnalytics>
    ),
    children: [
      { path: ROUTE_CONSTANTS.LOGIN, element: <LoginPage /> },
      { path: ROUTE_CONSTANTS.ORDERLIST, element: <OrderListPage /> },
      { path: ROUTE_CONSTANTS.SHOPPINGCART, element: <ShoppingCartPage /> },
      { path: ROUTE_CONSTANTS.MENULIST, element: <MenulistPage /> },
      { path: ROUTE_CONSTANTS.STAFFCODE, element: <StaffCodePage /> },
      { path: ROUTE_CONSTANTS.ORDERCOMPLETE, element: <OrderCompletePage /> },
      { path: ROUTE_CONSTANTS.DEVPAGE, element: <DevPage /> },
      { path: ROUTE_CONSTANTS.ADVERTISEMENT, element: <AdPage /> },
      { path: ROUTE_CONSTANTS.ERROR, element: <ErrorPage /> },
      { path: "*", element: <Navigate to={ROUTE_CONSTANTS.LOGIN} replace /> },
    ],
  },
]);

export default router;
