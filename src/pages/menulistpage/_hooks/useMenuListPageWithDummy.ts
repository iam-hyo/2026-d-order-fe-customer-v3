import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import { MenuListPageService } from '../_Dummy/MenuListPageService';
import { CartService } from '../_services/CartService';
import { sortByPriceDesc } from '../_utils/sortByPrice';

const SCROLL_OFFSET = 120;

type MenuCategory = 'tableFee' | 'set' | 'menu' | 'drink';
interface BaseMenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  soldOut: boolean;
  category: MenuCategory;
}

interface SetMenuItem extends BaseMenuItem {
  category: 'set';
  menuItems: {
    menu_id: number;
    quantity: number;
  }[];
}

/**
 * 메뉴 리스트 페이지 - 더미 데이터 전용 훅.
 * 실제 API 연결 시 useMenuListPage 로 import 변경하면 됨.
 */
const useMenuListPageWithDummy = () => {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState<boolean>(false);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [boothName, setBoothName] = useState<string>('');

  const tableFeeRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const drinkRef = useRef<HTMLDivElement>(null);

  const sectionRefs = {
    tableFee: tableFeeRef,
    set: setRef,
    menu: menuRef,
    drink: drinkRef,
  };

  const [selectedCategory, setSelectedCategory] = useState<
    'tableFee' | 'set' | 'menu' | 'drink'
  >('tableFee');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [tableNum, setTableNum] = useState<number | null>(null);

  const [count, setCount] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const resetCount = () => setCount(1);
  const isMin = count <= 1;
  const isMax = selectedItem ? count > selectedItem.quantity : false;
  const isMax2 = selectedItem ? count >= selectedItem.quantity : false;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initCartState = async () => {
      try {
        const cartId = sessionStorage.getItem('cartId');
        if (!cartId) return;
        const cartNumber = parseInt(cartId, 10);
        if (Number.isNaN(cartNumber)) return;

        const hasItems = await CartService.exists(cartNumber);
        setCartCount(hasItems);
      } catch (e) {
        // console.error('cart exists check failed', e);
        setCartCount(false);
      }
    };
    initCartState();
  }, []);

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      try {
        const tableId = sessionStorage.getItem('tableNum');
        const parsed = tableId ? parseInt(tableId, 10) : NaN;
        const tableNumber = Number.isNaN(parsed) ? null : parsed;
        // 더미: 테이블 번호 없어도 헤더(카테고리 탭) 노출을 위해 기본값 1 사용
        setTableNum(tableNumber !== null ? tableNumber : 1);

        const menuItemsData = MenuListPageService.fetchMenuItems();
        const setMenusData = MenuListPageService.fetchSetMenus();
        const allItems = [...menuItemsData, ...setMenusData] as (
          | BaseMenuItem
          | SetMenuItem
        )[];
        const allItemsSorted = sortByPriceDesc(allItems, (i) => i.price);
        setMenuItems(allItemsSorted);
        setBoothName('더미 부스');
      } catch (e) {
        // console.error(e);
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDecrease = () => {
    if (!isMin) setCount((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (isMax2) {
      setShowToast(true);
    }
    setCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  const handleScrollTo = (category: 'tableFee' | 'set' | 'menu' | 'drink') => {
    setSelectedCategory(category);
    const target = sectionRefs[category].current;
    if (target) {
      const top = target.offsetTop - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let activeCategory: 'tableFee' | 'set' | 'menu' | 'drink' | null = null;
      let maxTop = -Infinity;

      const scrollTop = window.scrollY;
      const scrollBottom = scrollTop + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      if (pageHeight - scrollBottom < 10) {
        setSelectedCategory('drink');
        return;
      }

      Object.entries(sectionRefs).forEach(([key, ref]) => {
        if (ref.current) {
          const rectTop = ref.current.getBoundingClientRect().top;
          if (rectTop <= SCROLL_OFFSET && rectTop > maxTop) {
            maxTop = rectTop;
            activeCategory = key as 'tableFee' | 'set' | 'menu' | 'drink';
          }
        }
      });

      if (activeCategory && activeCategory !== selectedCategory) {
        setSelectedCategory(activeCategory);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedCategory]);

  const handleOpenModal = (item: any) => {
    if (item.category === 'tableFee' && item.soldOut) return;
    if (item.category === 'tableFee' && Number(item?.price ?? 0) === 0) return;
    setSelectedItem(item);
    resetCount();
    setIsModalOpen(true);
  };

  const [errorToast, setErrorToast] = useState<string | null>(null);

  const refreshCartCount = async () => {
    try {
      const cid = CartService.getLocalCartId();
      if (cid == null) {
        setCartCount(false);
        return;
      }
      const has = await CartService.exists(cid);
      setCartCount(has);
    } catch (e) {
      // console.error('refreshCartCount failed', e);
    }
  };

  const handleSubmitItem = async () => {
    if (!selectedItem) return;
    if (!tableNum) {
      setErrorToast('테이블 번호를 확인할 수 없어요.');
      return;
    }
    if (count <= 0) return;

    const type: 'menu' | 'set_menu' =
      selectedItem.category === 'set' ? 'set_menu' : 'menu';

    try {
      await CartService.add({
        table_num: tableNum,
        type,
        id: selectedItem.id,
        quantity: count,
      });

      refreshCartCount();

      setIsClosing(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setIsClosing(false);
        setIsModalOpen2(true);
      }, 300);
    } catch (e: any) {
      // console.error(e);
      setErrorToast(
        e?.response?.data?.message ||
          '장바구니 담기 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      );
    } finally {
    }
  };

  const handleFirstModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSecondModal = () => {
    setIsModalOpen2(false);
  };

  return {
    isLoading,
    menuItems,
    boothName,
    tableNum,
    cartCount,
    sectionRefs,
    selectedCategory,
    handleScrollTo,
    handleOpenModal,
    selectedItem,
    isModalOpen,
    isModalOpen2,
    isClosing,
    handleSubmitItem,
    handleFirstModal,
    handleSecondModal,
    handleNavigate: () => navigate(ROUTE_CONSTANTS.SHOPPINGCART),
    handleReceipt: () => navigate(ROUTE_CONSTANTS.ORDERLIST),
    count,
    isMin,
    isMax,
    showToast,
    handleDecrease,
    handleIncrease,
    errorToast,
  };
};

export default useMenuListPageWithDummy;
