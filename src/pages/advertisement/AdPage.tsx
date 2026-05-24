import styled, { keyframes, css } from 'styled-components';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';
import ContactBoothCard from './_components/ContactBoothCard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BoothAdItem, fetchBoothAds } from './service/BoothInfo';


type Status = 'AVAILABLE' | 'SOON' | 'FULL';

const DATE_OPTIONS = [
  { label: '5/26 (화)', value: '2026-05-26' },
  { label: '5/27 (수)', value: '2026-05-27' },
  { label: '5/28 (목)', value: '2026-05-28' },
] as const;

const getTodayStr = () => {
  const t = new Date();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const dd = String(t.getDate()).padStart(2, '0');
  return `${t.getFullYear()}-${mm}-${dd}`;
};

const getBoothStatus = (remaining: number, capacity: number): Status => {
  if (capacity <= 0 || remaining <= 0) return 'FULL';
  const ratio = remaining / capacity;
  if (ratio <= 0.2) return 'SOON';
  return 'AVAILABLE';
};

const getInitialDate = (): string => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  if (month === 5) {
    if (day === 28) return '2026-05-28';
    if (day === 27) return '2026-05-27';
    if (day === 26) return '2026-05-26';
  }

  return '2026-05-26';
};

const AdPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [booths, setBooths] = useState<BoothAdItem[]>([]);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const boothWrapperRef = useRef<HTMLDivElement>(null);

  const isComingSoon = selectedDate !== '2026-05-26' && selectedDate > getTodayStr();

  const fetchData = async (date: string) => {
    try {
      const data = await fetchBoothAds(date);
      setBooths(data);
    } catch {
      setBooths([]);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
    boothWrapperRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [selectedDate]);

  const onReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    await fetchData(selectedDate);
    setIsReloading(false);
  };

  // location 같은 곳끼리 + 만석은 하단
  const contactBoothsToRender = useMemo(() => {
    return booths
      .map((b) => {
        const capacity = b.totalTable ?? 0;
        const remaining = b.remainingTable ?? 0;
        const status = getBoothStatus(remaining, capacity);
        return {
          hostName: b.boothName,
          boothImage: '',
          location: b.location ?? '',
          remaining,
          capacity,
          status,
        };
      })
      .sort((a, b) => {
        if (a.status === 'FULL' && b.status !== 'FULL') return 1;
        if (a.status !== 'FULL' && b.status === 'FULL') return -1;
        return a.location.localeCompare(b.location, 'ko');
      });
  }, [booths]);

  return (
    <Wrapper>
      {/* 헤더 영역 */}
      <HeaderSection>
        <HeaderRow>
          <AdLogoLink href='https://2602-d-order-home-page.vercel.app/' target='_blank' rel='noopener noreferrer'>
            <AdLogo src={IMAGE_CONSTANTS.AD_LOGO} alt='D-order 로고' />
          </AdLogoLink>
          <ReloadButton
            onClick={onReload}
            disabled={isReloading}
            aria-label='데이터 새로고침'
            $isReloading={isReloading}
          >
            <ReloadIcon src={IMAGE_CONSTANTS.RELOAD_V3} alt='reload' />
          </ReloadButton>
        </HeaderRow>
        <Title>지금 어느 부스로 가야할까?</Title>
      </HeaderSection>

      {/* 날짜 탭 */}
      <DateTabsSection>
        {DATE_OPTIONS.map((d) => (
          <DateTab
            key={d.value}
            $active={d.value === selectedDate}
            onClick={() => setSelectedDate(d.value)}
            type='button'
          >
            {d.label}
          </DateTab>
        ))}
      </DateTabsSection>

      {/* 부스 카드 리스트 */}
      <BoothListContainer>
        <BoothListWrapper ref={boothWrapperRef} $locked={isComingSoon}>
          {contactBoothsToRender.map((b, idx) => (
            <ContactBoothCard
              key={`${b.hostName}-${idx}`}
              hostName={b.hostName}
              boothImage={b.boothImage}
              location={b.location}
              remaining={b.remaining}
              capacity={b.capacity}
              status={b.status}
            />
          ))}
        </BoothListWrapper>
        {isComingSoon && (
          <ComingSoonOverlay>
            <ComingSoonCard>
              <ComingSoonText>COMING SOON</ComingSoonText>
            </ComingSoonCard>
          </ComingSoonOverlay>
        )}
      </BoothListContainer>

      {/* 하단 인스타그램 연락처 */}
      <ContactInfoWrapper
        as='a'
        href='https://www.instagram.com/d_order.official/'
        target='_blank'
        rel='noopener noreferrer'
      >
        <ContactText>Contact: </ContactText>
        <ContactIcon src={IMAGE_CONSTANTS.INSTAGRAMICON} />
        <ContactText $insta>@d_order.official</ContactText>
      </ContactInfoWrapper>
    </Wrapper>
  );
};

export default AdPage;

/* ─── Styled Components ──────────────────────────────────────── */

const rotate = keyframes`
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  box-sizing: border-box;
  background: url(${IMAGE_CONSTANTS.BACKGROUND_V3}) center / cover no-repeat;
  position: relative;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 49px 16px 0;
  box-sizing: border-box;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const AdLogoLink = styled.a`
  display: flex;
  flex-shrink: 0;
`;

const AdLogo = styled.img`
  height: 36px;
  width: auto;
  object-fit: contain;
`;

const ReloadButton = styled.button<{ $isReloading?: boolean }>`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  cursor: pointer;
  flex-shrink: 0;

  ${({ $isReloading }) =>
    $isReloading &&
    css`
      & > img {
        animation: ${rotate} 1s linear;
      }
    `}

  &:disabled {
    cursor: default;
    opacity: 0.8;
  }
`;

const ReloadIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const Title = styled.p`
  ${({ theme }) => theme.fonts.ExtraBold24};
  color: #414141;
  margin: 0;
`;

const DateTabsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
  margin-top: 12px;
`;

const DateTab = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? '#FF6E3F' : 'transparent')};
  cursor: pointer;

  font-family: 'SUIT', sans-serif;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  color: ${({ $active }) => ($active ? '#FF6E3F' : '#6a6a6a')};
  white-space: nowrap;
`;

const BoothListContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1 1 0%;
  min-height: 0;
`;

const BoothListWrapper = styled.div<{ $locked?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: ${({ $locked }) => ($locked ? 'hidden' : 'auto')};
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  gap: 16px;
  padding: 16px 0 20px;
  box-sizing: border-box;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ComingSoonOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 16px 0;
  box-sizing: border-box;
  pointer-events: none;
`;

const ComingSoonCard = styled.div`
  width: 91%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
`;

const ComingSoonText = styled.p`
  ${({ theme }) => theme.fonts.ExtraBold24};
  color: ${({ theme }) => theme.colors.Orange01};
  letter-spacing: 4px;
  margin: 0;
`;

const ContactInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 12px 15px;
  box-sizing: border-box;
  gap: 4px;
  flex-shrink: 0;
`;

const ContactText = styled.span<{ $insta?: boolean }>`
  color: ${({ theme }) => theme.colors.White};
  ${({ theme }) => theme.fonts.SemiBold12};
  ${({ theme, $insta }) => $insta && theme.fonts.ExtraBold12};
`;

const ContactIcon = styled.img`
  width: 14px;
  height: 14px;
`;
