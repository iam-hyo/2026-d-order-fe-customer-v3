import { forwardRef } from 'react';
import * as S from './MenuListPageHeader.styled';

import { MENULISTPAGE_CONSTANTS } from '../../_constants/menulistpageconstants';

interface MenuListPageHeaderProps {
  title: string;
  tableNumber: number;
  selectedCategory: 'tableFee' | 'set' | 'menu' | 'drink';
  onSelectCategory: (category: 'tableFee' | 'set' | 'menu' | 'drink') => void;
}

const MenuListPageHeader = forwardRef<HTMLDivElement, MenuListPageHeaderProps>(
  function MenuListPageHeader(
    { title, tableNumber, selectedCategory, onSelectCategory },
    ref,
  ) {
  return (
    <S.Wrapper ref={ref}>
      <S.TableInfo>
        <S.Title>{title}</S.Title>
        <S.TableNumber>
          {MENULISTPAGE_CONSTANTS.LISTPAGEHEADER.TEXT.TABLE}
          {tableNumber}
        </S.TableNumber>
      </S.TableInfo>
      <S.SelectCategory>
        <S.Category
          onClick={() => onSelectCategory('tableFee')}
          className={selectedCategory === 'tableFee' ? 'selected' : ''}
        >
          {MENULISTPAGE_CONSTANTS.LISTPAGEHEADER.TEXT.TABELFEE}
        </S.Category>
        <S.Category
          onClick={() => onSelectCategory('set')}
          className={selectedCategory === 'set' ? 'selected' : ''}
        >
          {MENULISTPAGE_CONSTANTS.LISTPAGEHEADER.TEXT.SET}
        </S.Category>
        <S.Category
          onClick={() => onSelectCategory('menu')}
          className={selectedCategory === 'menu' ? 'selected' : ''}
        >
          {MENULISTPAGE_CONSTANTS.LISTPAGEHEADER.TEXT.MENU}
        </S.Category>
        <S.Category
          onClick={() => onSelectCategory('drink')}
          className={selectedCategory === 'drink' ? 'selected' : ''}
        >
          {MENULISTPAGE_CONSTANTS.LISTPAGEHEADER.TEXT.BEVERAGE}
        </S.Category>
      </S.SelectCategory>
    </S.Wrapper>
  );
  },
);

export default MenuListPageHeader;
