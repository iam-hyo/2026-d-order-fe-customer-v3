import styled, { keyframes, css } from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BoothAdItem, fetchBoothAds } from './service/BoothInfo';
import AdFooter from './_components/AdFooter';
import adLogoWh from '@assets/images/adLogoWh.png';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';

// ─── Types ────────────────────────────────────────────────

type Status = 'AVAILABLE' | 'SOON' | 'FULL';
type DateValue = '2026-05-26' | '2026-05-27' | '2026-05-28';
type SortOrder = 'desc' | 'asc';
type SlideDir = 'left' | 'right' | 'none';

interface BoothDisplay {
  name: string;
  location: string;
  remaining: number; // remaining seats (boothAllTable - boothUsageTable)
  used: number;      // occupied seats (boothUsageTable)
  capacity: number;  // total seats (boothAllTable)
  usageRate: number; // used / capacity  (0–1)
  status: Status;
  boothImage: string;
}

// ─── Constants ────────────────────────────────────────────

const DATE_OPTIONS = [
  { label: '05.26', day: '화', value: '2026-05-26' as DateValue },
  { label: '05.27', day: '수', value: '2026-05-27' as DateValue },
  { label: '05.28', day: '목', value: '2026-05-28' as DateValue },
] as const;

const STATUS_LABELS: Record<Status, string> = {
  AVAILABLE: '여유',
  SOON: '임박',
  FULL: '만석',
};

const STATUS_COLORS: Record<Status, string> = {
  AVAILABLE: '#4ade80',
  SOON: '#fb923c',
  FULL: '#ef4444',
};

// ─── Helpers ──────────────────────────────────────────────

// remaining = boothAllTable - boothUsageTable (from API/mock)
// FULL  : usageRate = 1 (remaining ≤ 0)
// SOON  : usageRate ≥ 75 % OR remaining ≤ 10
// AVAILABLE: otherwise
const getBoothStatus = (remaining: number, capacity: number): Status => {
  if (capacity <= 0) return 'AVAILABLE';
  if (remaining <= 0) return 'FULL';
  const usageRate = (capacity - remaining) / capacity;
  if (usageRate >= 0.75 || remaining <= 10) return 'SOON';
  return 'AVAILABLE';
};

const sparklePoints = (cx: number, cy: number, ro: number): string => {
  const ri = ro * 0.35;
  const s = Math.SQRT1_2;
  return [
    `${cx},${cy - ro}`,
    `${cx + ri * s},${cy - ri * s}`,
    `${cx + ro},${cy}`,
    `${cx + ri * s},${cy + ri * s}`,
    `${cx},${cy + ro}`,
    `${cx - ri * s},${cy + ri * s}`,
    `${cx - ro},${cy}`,
    `${cx - ri * s},${cy - ri * s}`,
  ].join(' ');
};

const getInitialDate = (): DateValue => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  if (month === 5) {
    if (day >= 28) return '2026-05-28';
    if (day === 27) return '2026-05-27';
  }
  return '2026-05-26';
};

const getTodayStr = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

// ─── Background data ──────────────────────────────────────

const STARS = Array.from({ length: 40 }, (_, i) => {
  const s = i + 1;
  return {
    x: Math.abs(Math.sin(s * 7.3)) * 100,
    y: Math.abs(Math.sin(s * 13.7)) * 100,
    size: 0.4 + Math.abs(Math.sin(s * 3.1)) * 1.1,
    opacity: 0.08 + Math.abs(Math.sin(s * 5.9)) * 0.28,
    duration: 3 + Math.abs(Math.sin(s * 2.1)) * 4,
    delay: Math.abs(Math.sin(s * 11.3)) * 7,
  };
});

const SPARKLES = [
  { x: 14, y: 7,  size: 9,  dur: 4.8, delay: 0   },
  { x: 83, y: 18, size: 8,  dur: 3.9, delay: 1.5  },
  { x: 38, y: 4,  size: 7,  dur: 5.5, delay: 3.1  },
  { x: 68, y: 32, size: 10, dur: 4.2, delay: 2.2  },
];

const CONSTELLATIONS = [
  {
    nodes: [[5,9],[9,8],[10,11],[6,12],[5,15],[5.5,18],[7,21]] as [number,number][],
    edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]] as [number,number][],
    path: 'M7,21 L5.5,18 L5,15 L6,12 L5,9 L9,8 L10,11 L6,12',
    dashLen: 30, cycleDur: '22s', flashFrac: 0.023, begin: '0.5s',
  },
  {
    nodes: [[75,8],[82,7],[76,13],[78,14],[80,15],[74,20],[82,21]] as [number,number][],
    edges: [[0,2],[1,4],[2,3],[3,4],[5,2],[4,6]] as [number,number][],
    path: 'M75,8 L76,13 L74,20 L76,13 L78,14 L80,15 L82,21 L80,15 L82,7',
    dashLen: 50, cycleDur: '18s', flashFrac: 0.031, begin: '4s',
  },
  {
    nodes: [[75,63],[78,65],[80,66],[82,67],[84,68],[86,70],[87,73],[86,76],[84,78],[85,80]] as [number,number][],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]] as [number,number][],
    path: 'M75,63 L78,65 L80,66 L82,67 L84,68 L86,70 L87,73 L86,76 L84,78 L85,80',
    dashLen: 38, cycleDur: '26s', flashFrac: 0.025, begin: '8s',
  },
] as const;

const grainSvgData = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/></filter>" +
  "<rect width='200' height='200' filter='url(#n)'/></svg>"
);

// ─── Keyframes ────────────────────────────────────────────

const twinkle = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(0.65); }
`;

const sparkleGlow = keyframes`
  0%, 100%  { transform: scale(0.2); opacity: 0; }
  35%, 65%  { transform: scale(1);   opacity: 1; }
  80%       { transform: scale(0.2); opacity: 0; }
`;

const nebulaShift = keyframes`
  0%, 100% { transform: scale(1) translateY(0); }
  50%      { transform: scale(1.04) translateY(-6px); }
`;

const constellationPulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.85; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideInFromRight = keyframes`
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const slideInFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-32px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const rotateAnim = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Component ────────────────────────────────────────────

const AdPage = () => {
  const [activeDay, setActiveDay] = useState<DateValue>(getInitialDate());
  const [booths, setBooths] = useState<BoothAdItem[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [slideDir, setSlideDir] = useState<SlideDir>('none');
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const isComingSoon = activeDay !== '2026-05-26' && activeDay > getTodayStr();

  // API hook point: toggle mock ↔ real API in BoothInfo.ts
  const fetchData = async (date: DateValue) => {
    try {
      const data = await fetchBoothAds(date);
      setBooths(data);
      setLastUpdated(formatTime(new Date()));
    } catch {
      setBooths([]);
    }
  };

  useEffect(() => {
    fetchData(activeDay);
  }, [activeDay]);

  // Changes date with directional slide animation
  const changeDate = (newDate: DateValue) => {
    if (newDate === activeDay) return;
    const curIdx = DATE_OPTIONS.findIndex((d) => d.value === activeDay);
    const newIdx = DATE_OPTIONS.findIndex((d) => d.value === newDate);
    setSlideDir(newIdx > curIdx ? 'right' : 'left');
    setActiveDay(newDate);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    const idx = DATE_OPTIONS.findIndex((d) => d.value === activeDay);
    if (dx < 0 && idx < DATE_OPTIONS.length - 1) changeDate(DATE_OPTIONS[idx + 1].value);
    else if (dx > 0 && idx > 0) changeDate(DATE_OPTIONS[idx - 1].value);
  };

  // API hook point: BoothAdItem → BoothDisplay
  // remaining = totalTable - remainingTable already maps to boothAllTable - boothUsageTable in mock
  const displayItems: BoothDisplay[] = useMemo(
    () =>
      booths
        .map((b) => {
          const capacity = b.totalTable ?? 0;
          const remaining = b.remainingTable ?? 0;
          const used = Math.max(0, capacity - remaining);
          const usageRate = capacity > 0 ? used / capacity : 0;
          return {
            name: b.boothName,
            location: b.location ?? '',
            remaining: Math.max(0, remaining),
            used,
            capacity,
            usageRate,
            status: getBoothStatus(remaining, capacity),
            boothImage: b.boothImage ?? '',
          };
        })
        .sort((a, b) =>
          sortOrder === 'desc' ? b.usageRate - a.usageRate : a.usageRate - b.usageRate
        ),
    [booths, sortOrder]
  );

  const onReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    // 최소 700ms 스피너 유지 (mock 데이터는 즉시 완료되므로)
    await Promise.all([
      fetchData(activeDay),
      new Promise<void>((resolve) => setTimeout(resolve, 700)),
    ]);
    setIsReloading(false);
  };

  return (
    <PageWrapper>
      {/* ── Fixed background ── */}
      <Background>
        <GrainLayer />
        <Fog style={{ left: '0%',  top: '5%',  width: '60%', height: '45%', filter: 'blur(55px)', background: 'radial-gradient(ellipse, rgba(200,200,210,0.055), transparent)' }} />
        <Fog style={{ left: '45%', top: '35%', width: '65%', height: '55%', filter: 'blur(42px)', background: 'radial-gradient(ellipse, rgba(185,185,195,0.045), transparent)' }} />
        <Fog style={{ left: '15%', top: '0%',  width: '75%', height: '38%', filter: 'blur(38px)', background: 'radial-gradient(ellipse, rgba(190,190,200,0.04),  transparent)' }} />
        <Nebula style={{ left: '25%',  top: '10%', width: '55%', height: '55%', animationDuration: '11s', background: 'radial-gradient(ellipse, rgba(90,90,100,0.38),  transparent)' }} />
        <Nebula style={{ left: '-5%',  top: '45%', width: '50%', height: '58%', animationDuration: '14s', background: 'radial-gradient(ellipse, rgba(75,75,85,0.32),   transparent)' }} />
        <Nebula style={{ left: '55%',  top: '50%', width: '55%', height: '55%', animationDuration: '12s', background: 'radial-gradient(ellipse, rgba(82,82,92,0.30),   transparent)' }} />
        <BrushStreak style={{ top: '20%', transform: 'rotate(-27deg)', background: 'linear-gradient(90deg, transparent, rgba(130,130,140,0.08), transparent)', filter: 'blur(14px)' }} />
        <BrushStreak style={{ top: '58%', transform: 'rotate(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(120,120,130,0.06), transparent)', filter: 'blur(19px)' }} />
        {STARS.map((s, i) => (
          <Star key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} />
        ))}
        {SPARKLES.map((sp, i) => (
          <Sparkle key={i} style={{ left: `${sp.x}%`, top: `${sp.y}%`, fontSize: `${sp.size}px`, animationDuration: `${sp.dur}s`, animationDelay: `${sp.delay}s` }}>✦</Sparkle>
        ))}
        <ConstellationSvg viewBox='0 0 100 100' preserveAspectRatio='none'>
          <defs>
            <filter id='c-glow'>
              <feGaussianBlur stdDeviation='1.2' result='blur' />
              <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
            </filter>
            <filter id='c-glow-strong'>
              <feGaussianBlur stdDeviation='2.5' result='blur' />
              <feMerge><feMergeNode in='blur' /><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
            </filter>
          </defs>
          {CONSTELLATIONS.map((c, ci) => {
            const ft = c.flashFrac;
            const strokeKT = `0;${ft};1`;
            const opacityKT = `0;${(ft * 0.1).toFixed(4)};${(ft * 0.35).toFixed(4)};${ft};${(ft * 1.5).toFixed(4)};1`;
            const dotOpacityKT = `0;${(ft * 0.05).toFixed(4)};${(ft * 0.5).toFixed(4)};${ft};${(ft * 1.3).toFixed(4)};1`;
            const rKT = `0;${(ft * 0.3).toFixed(4)};${ft};${(ft * 1.3).toFixed(4)};1`;
            return (
              <ConstellationGroup key={ci}>
                {c.edges.map(([a, b], ei) => (
                  <line key={ei} x1={c.nodes[a][0]} y1={c.nodes[a][1]} x2={c.nodes[b][0]} y2={c.nodes[b][1]} stroke='rgba(175,90,40,0.28)' strokeWidth='0.22' strokeDasharray='0.5 1.8' />
                ))}
                {c.nodes.map(([x, y], ni) => (
                  <polygon key={ni} points={sparklePoints(x, y, 0.55)} fill='rgba(210,190,150,0.65)' />
                ))}
                <path d={c.path} fill='none' stroke='rgba(200,220,255,0.88)' strokeWidth='0.38' strokeDasharray={c.dashLen} strokeLinecap='round' filter='url(#c-glow)'>
                  <animate attributeName='stroke-dashoffset' values={`${c.dashLen};0;0`} keyTimes={strokeKT} dur={c.cycleDur} repeatCount='indefinite' begin={c.begin} />
                  <animate attributeName='opacity' values='0;0;1;1;0;0' keyTimes={opacityKT} dur={c.cycleDur} repeatCount='indefinite' begin={c.begin} />
                </path>
                <circle fill='rgba(215,235,255,1)' filter='url(#c-glow-strong)'>
                  <animateMotion {...({ path: c.path, keyPoints: `0;1;1`, keyTimes: strokeKT } as any)} dur={c.cycleDur} repeatCount='indefinite' begin={c.begin} calcMode='linear' />
                  <animate attributeName='opacity' values='0;0;1;0.8;0;0' keyTimes={dotOpacityKT} dur={c.cycleDur} repeatCount='indefinite' begin={c.begin} />
                  <animate attributeName='r' values='0.25;1.6;0.9;0.25;0.25' keyTimes={rKT} dur={c.cycleDur} repeatCount='indefinite' begin={c.begin} />
                </circle>
              </ConstellationGroup>
            );
          })}
        </ConstellationSvg>
      </Background>

      {/* ── Full-width sticky liquid glass header ── */}
      <StickyTopBar>
        <Header>
          <SubTitle>2026 봄 대동제 주점 실시간 좌석 현황</SubTitle>
          <MainTitle>지금 어느 부스로 가야할까?</MainTitle>
          <ProdBadge
            href='https://2602-d-order-home-page.vercel.app/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <ProdByText>Prod by.</ProdByText>
            <AdLogoImg src={adLogoWh} alt='D-Order' />
          </ProdBadge>
        </Header>

        {/* Date segmented control — swipe also works */}
        <DateNav onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {DATE_OPTIONS.map((d) => (
            <DateTab
              key={d.value}
              $active={d.value === activeDay}
              onClick={() => changeDate(d.value)}
            >
              <DateTabLabel>{d.label}</DateTabLabel>
              <DateTabDay>{d.day}</DateTabDay>
            </DateTab>
          ))}
        </DateNav>
      </StickyTopBar>

      {/* ── Centered content (max-width 480px) ── */}
      <Content>
        {/* Booth list */}
        <ListSection onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <ListHeader>
            <ListCount>총 {displayItems.length}개 부스</ListCount>
            <SortControls>
              <SortBtn $active={sortOrder === 'asc'} onClick={() => setSortOrder('asc')} title='가동률 오름차순'>↑</SortBtn>
              <SortBtn $active={sortOrder === 'desc'} onClick={() => setSortOrder('desc')} title='가동률 내림차순'>↓</SortBtn>
              <ReloadArea>
                {lastUpdated && <UpdateTime>{lastUpdated} 기준</UpdateTime>}
                <ReloadBtn onClick={onReload} disabled={isReloading} $spinning={isReloading}>↻</ReloadBtn>
              </ReloadArea>
            </SortControls>
          </ListHeader>

          {displayItems.length === 0 ? (
            <EmptyMsg>부스 정보가 없습니다</EmptyMsg>
          ) : (
            <BoothGrid key={activeDay} $slideDir={slideDir}>
              {displayItems.map((b, idx) => {
                const isFull = !isComingSoon && b.status === 'FULL';
                // Bar shows remaining percentage (remaining / capacity)
                // 6/50 remaining → 12% fill
                const progressPct = b.capacity > 0 ? (b.remaining / b.capacity) * 100 : 0;
                return (
                  <BoothCard key={idx} $isFull={isFull}>
                    <BoothCardImageBox>
                      {b.boothImage ? (
                        <BoothCardImg src={b.boothImage} alt={b.name} />
                      ) : (
                        <BoothCardDefaultImg src={IMAGE_CONSTANTS.CHARACTERMINI} alt='기본이미지' />
                      )}
                    </BoothCardImageBox>
                    <BoothCardBody>
                      {/* Name + status badge on same row */}
                      <BoothNameRow>
                        <BoothCardName>{b.name}</BoothCardName>
                        <StatusBadge $status={b.status}>{STATUS_LABELS[b.status]}</StatusBadge>
                      </BoothNameRow>
                      {b.location && <BoothCardLocation>{b.location}</BoothCardLocation>}

                      {isComingSoon ? (
                        <BoothCardPreview>총 {b.capacity}석</BoothCardPreview>
                      ) : (
                        <>
                          <RemainingLabel>남은 테이블</RemainingLabel>
                          <BoothProgressRow>
                            <BoothProgressBar $status={b.status}>
                              <BoothProgressFill $pct={progressPct} $status={b.status} />
                            </BoothProgressBar>
                            <BoothCapacityText $status={b.status}>
                              {isFull && '🔥'}{b.remaining}<span>/{b.capacity}</span>
                            </BoothCapacityText>
                          </BoothProgressRow>
                        </>
                      )}
                    </BoothCardBody>
                  </BoothCard>
                );
              })}
            </BoothGrid>
          )}

          <InfoText>디오더를 사용하는 부스들의 실시간 현황만 제공됩니다.</InfoText>
        </ListSection>

        <AdFooter />
      </Content>
    </PageWrapper>
  );
};

export default AdPage;

// ─── Styled Components ─────────────────────────────────────

const PageWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: calc(var(--vh, 1vh) * 100);
  background: #07080a;
  font-family: 'SUIT', sans-serif;
`;

const Background = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const GrainLayer = styled.div`
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,${grainSvgData}");
  background-size: 200px 200px;
  opacity: 0.038;
  mix-blend-mode: overlay;
`;

const Fog = styled.div`position: absolute;`;

const Nebula = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(85px);
  animation: ${nebulaShift} ease-in-out infinite;
`;

const BrushStreak = styled.div`
  position: absolute;
  left: -10%;
  width: 120%;
  height: 55px;
`;

const Star = styled.div`
  position: absolute;
  border-radius: 50%;
  background: rgba(230, 235, 245, 0.9);
  animation: ${twinkle} linear infinite;
`;

const Sparkle = styled.div`
  position: absolute;
  color: rgba(220, 220, 235, 0.6);
  animation: ${sparkleGlow} ease-in-out infinite;
`;

const ConstellationSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const ConstellationGroup = styled.g`
  animation: ${constellationPulse} 4s ease-in-out infinite;
`;

// ── Content ────────────────────────────────────────────────

const Content = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

// ── Sticky top bar ─────────────────────────────────────────

const StickyTopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  /* Liquid glass: semi-transparent gradient + blur + saturate */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(14, 12, 10, 0.38) 100%
  );
  backdrop-filter: blur(8px) saturate(160%);
  -webkit-backdrop-filter: blur(8px) saturate(160%);
  /* Glass rim highlights */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 6px 28px rgba(0, 0, 0, 0.25);
`;

const Header = styled.div`
  padding: 44px 20px 16px;
`;

const SubTitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 8px;
  letter-spacing: 0.02em;
`;

const MainTitle = styled.h1`
  font-size: clamp(1.5rem, 5.5vw, 2.2rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.93);
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.2;
  white-space: nowrap;
`;

const ProdBadge = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 9px 16px 9px 13px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 110, 63, 0.2), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(255, 110, 63, 0.45);
  backdrop-filter: blur(8px);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  &:hover {
    background: linear-gradient(135deg, rgba(255, 110, 63, 0.28), rgba(251, 146, 60, 0.18));
    border-color: rgba(255, 110, 63, 0.6);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

const ProdByText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 200, 150, 0.88);
  font-family: 'SUIT', sans-serif;
`;

const AdLogoImg = styled.img`
  height: 22px;
  width: auto;
  object-fit: contain;
`;

// ── Date segmented control ─────────────────────────────────

const DateNav = styled.div`
  display: flex;
  padding: 3px 16px 12px;
  gap: 6px;
`;

const DateTab = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.04)')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)')};
  border-radius: 12px;
  color: ${({ $active }) => ($active ? 'rgba(255,255,255,0.93)' : 'rgba(255,255,255,0.32)')};
  padding: 10px 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  font-family: 'SUIT', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const DateTabLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
`;

const DateTabDay = styled.span`
  font-size: 10px;
  font-weight: 500;
  opacity: 0.65;
  line-height: 1;
`;

// ── Booth list ─────────────────────────────────────────────

const ListSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
`;

const ListCount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SUIT', sans-serif;
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SortBtn = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? 'rgba(200,220,255,0.18)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(200,220,255,0.5)' : 'rgba(255,255,255,0.1)')};
  border-radius: 6px;
  color: ${({ $active }) => ($active ? 'rgba(200,220,255,0.92)' : 'rgba(255,255,255,0.28)')};
  font-size: 14px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
`;

const ReloadArea = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 2px;
`;

const UpdateTime = styled.span`
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.22);
  font-family: 'SUIT', sans-serif;
  white-space: nowrap;
`;

const ReloadBtn = styled.button<{ $spinning: boolean }>`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.32);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  ${({ $spinning }) =>
    $spinning &&
    css`
      animation: ${rotateAnim} 1s linear infinite;
    `}
  &:disabled { opacity: 0.3; cursor: default; }
`;

const BoothGrid = styled.div<{ $slideDir: SlideDir }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 0 16px;
  animation: ${({ $slideDir }) =>
    $slideDir === 'right'
      ? css`${slideInFromRight} 0.26s ease-out`
      : $slideDir === 'left'
      ? css`${slideInFromLeft} 0.26s ease-out`
      : css`${fadeInUp} 0.3s ease-out`};
`;

const EmptyMsg = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.28);
  font-size: 13px;
  padding: 48px 16px;
  margin: 0;
  font-family: 'SUIT', sans-serif;
`;

const InfoText = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 11px;
  padding: 20px 16px 32px;
  margin: 0;
  font-family: 'SUIT', sans-serif;
  letter-spacing: 0.01em;
`;

// ── Booth card ─────────────────────────────────────────────

const BoothCard = styled.div<{ $isFull: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 12px;
  background: rgba(22, 20, 16, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  opacity: ${({ $isFull }) => ($isFull ? 0.62 : 1)};
`;

const BoothCardImageBox = styled.div`
  width: 76px;
  min-height: 76px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BoothCardImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BoothCardDefaultImg = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  opacity: 0.55;
`;

const BoothCardBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

/* Status badge sits immediately after the name on the same row */
const BoothNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
`;

const BoothCardName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  font-family: 'SUIT', sans-serif;
`;

const StatusBadge = styled.span<{ $status: Status }>`
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid ${({ $status }) => STATUS_COLORS[$status]};
  color: ${({ $status }) => STATUS_COLORS[$status]};
  white-space: nowrap;
  flex-shrink: 0;
`;

const BoothCardLocation = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.32);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'SUIT', sans-serif;
`;

const RemainingLabel = styled.span`
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 4px;
  font-family: 'SUIT', sans-serif;
`;

const BoothCardPreview = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'SUIT', sans-serif;
  margin-top: 4px;
`;

const BoothProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const BoothProgressBar = styled.div<{ $status: Status }>`
  flex: 1;
  height: 4px;
  background: ${({ $status }) =>
    $status === 'FULL' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.1)'};
  border-radius: 100px;
  overflow: hidden;
`;

const BoothProgressFill = styled.div<{ $pct: number; $status: Status }>`
  height: 4px;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $status }) => STATUS_COLORS[$status]};
  border-radius: 100px;
  transition: width 0.4s ease;
`;

const BoothCapacityText = styled.span<{ $status: Status }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $status }) => STATUS_COLORS[$status]};
  white-space: nowrap;
  flex-shrink: 0;
  font-family: 'SUIT', sans-serif;
  span {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.3);
  }
`;
