import React from 'react';
import * as S from '../devPage.styled';

type Props = {
  src: string;
  alt?: string;
  onClick?: () => void;
};

const DevCard: React.FC<Props> = ({ src, alt = 'Developer image', onClick }) => {
  return (
    <S.ImageCard type="button" onClick={onClick} aria-label={`Open ${alt}`}>
      <S.DeveloperImage src={src} alt={alt} loading="lazy" decoding="async" />
    </S.ImageCard>
  );
};

export default DevCard;
