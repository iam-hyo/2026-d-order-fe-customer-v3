import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';
import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import DevCard from './components/devCard';
import RoleFilter, { DevRole } from './components/roleFilter';
import * as S from './devPage.styled';

const DEV_IMAGES = {
  LDG: '/images/donggeonLee.svg',
  CEH: '/images/eunhoCha.svg',
  KGW: '/images/geunwooKang.svg',
  JHJ: '/images/hyojunJeon.svg',
  LHW: '/images/hyunwooLim.svg',
  PJH: '/images/jinheePark.svg',
  LSB: '/images/soobinLim.svg',
  JSW: '/images/sunwooJang.svg',
  PSW: '/images/sunwooPark.svg',
  OTJ: '/images/taehunOh.svg',
  SYC: '/images/youngchaeSon.svg',
} as const;

type DevImageKey = keyof typeof DEV_IMAGES;

type SelectedImage = {
  src: string;
  alt: string;
};

const DEV_GROUPS: Record<Exclude<DevRole, 'All'>, DevImageKey[]> = {
  'PM': ['PJH', 'JSW', 'SYC'],
  'EX': ['PJH', 'JSW', 'SYC', 'LHW', 'JHJ'],
  'Front-End': ['KGW', 'LDG', 'OTJ'],
  'Back-End': ['KGW', 'LDG', 'OTJ', 'CEH', 'LSB', 'PSW'],
};

const ALL_IMAGES = Array.from(new Set(Object.values(DEV_GROUPS).flat()));

const getImagesByRole = (role: DevRole): DevImageKey[] => {
  return role === 'All' ? ALL_IMAGES : DEV_GROUPS[role];
};

const DevPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<DevRole>('All');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const selectedImages = useMemo(() => getImagesByRole(role), [role]);

  const openFloatingCard = (imageKey: DevImageKey) => {
    setIsClosing(false);
    setSelectedImage({
      src: DEV_IMAGES[imageKey],
      alt: `${role} ${imageKey}`,
    });
  };

  const closeFloatingCard = () => {
    if (!selectedImage || isClosing) return;

    setIsClosing(true);
    window.setTimeout(() => {
      setSelectedImage(null);
      setIsClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFloatingCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, isClosing]);

  return (
    <S.PageWrap>
      <S.Header>
        <button type="button" onClick={() => navigate(ROUTE_CONSTANTS.MENULIST)} aria-label="Go back">
          <img src={IMAGE_CONSTANTS.BACKICON} alt="" />
        </button>
        <p>Team D-Order</p>
      </S.Header>

      <S.Toolbar>
        <RoleFilter active={role} onChange={setRole} />
      </S.Toolbar>

      <S.Grid>
        {selectedImages.map((imageKey) => (
          <DevCard
            key={imageKey}
            src={DEV_IMAGES[imageKey]}
            alt={`${role} ${imageKey}`}
            onClick={() => openFloatingCard(imageKey)}
          />
        ))}
      </S.Grid>

      {selectedImage && (
        <S.FloatingOverlay
          role="button"
          tabIndex={-1}
          aria-label="Close enlarged image"
          $closing={isClosing}
          onClick={closeFloatingCard}
        >
          <S.FloatingCard $closing={isClosing} onClick={(event) => event.stopPropagation()}>
            <S.FloatingImage src={selectedImage.src} alt={selectedImage.alt} />
          </S.FloatingCard>
        </S.FloatingOverlay>
      )}
    </S.PageWrap>
  );
};

export default DevPage;
