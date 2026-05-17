import React from 'react';
import * as S from '../devPage.styled';

export type DevRole = 'All' | 'PM' | 'EX' | 'Front-End' | 'Back-End';

const ROLES: DevRole[] = ['All', 'PM', 'Front-End', 'Back-End', 'EX' ];

type Props = {
  active: DevRole;
  onChange: (next: DevRole) => void;
};

const RoleFilter: React.FC<Props> = ({ active, onChange }) => {
  return (
    <S.FilterBox role="tablist" aria-label="Developer role filter">
      {ROLES.map((role) => (
        <S.FilterBtn
          key={role}
          type="button"
          role="tab"
          aria-selected={active === role}
          $active={active === role}
          onClick={() => onChange(role)}
        >
          {role}
        </S.FilterBtn>
      ))}
    </S.FilterBox>
  );
};

export default RoleFilter;
