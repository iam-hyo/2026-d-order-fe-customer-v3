import styled, { keyframes, css } from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BoothAdItem,
  fetchBoothAds,
  // [MOCK ↔ API 전환 지점] 로컬 mock 데이터로 돌리려면 아래 import를 활성화하고
  // fetchData/onReload 의 mock 블록 주석을 해제하면 됨.
  // fetchBoothAdsMock0526,
  // fetchBoothAdsMock0527,
  // fetchBoothAdsMock0528,
} from './service/BoothInfo';
import AdFooter from './_components/AdFooter';
import FireworksCanvas from './_components/FireworksCanvas';
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

// 밝은 크림 카드 위에서 또렷하게 읽히도록 명도 낮춘 버전.
// AVAILABLE은 특히 너무 밝아 보이지 않도록 깊은 녹색으로.
const STATUS_COLORS: Record<Status, string> = {
  AVAILABLE: '#16a34a',
  SOON: '#ea580c',
  FULL: '#b91c1c',
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

// 밤하늘 실구름(권운) 느낌의 얇은 streak.
// 옅은 안개가 아니라, 약간 또렷하고 길게 흐르는 가로형 구름.
const CLOUD_STREAKS = [
  { left: '-8%',  top: '4%',  width: '85%', height: '38px', rot: -5, blur: 8,  op: 0.22 },
  { left: '25%',  top: '14%', width: '92%', height: '28px', rot: 4,  blur: 6,  op: 0.15 },
  { left: '-18%', top: '27%', width: '78%', height: '44px', rot: -3, blur: 9,  op: 0.18 },
  { left: '32%',  top: '41%', width: '88%', height: '32px', rot: 6,  blur: 7,  op: 0.14 },
  { left: '-15%', top: '56%', width: '80%', height: '42px', rot: -7, blur: 10, op: 0.18 },
  { left: '20%',  top: '72%', width: '95%', height: '30px', rot: 3,  blur: 7,  op: 0.13 },
  { left: '-12%', top: '88%', width: '74%', height: '38px', rot: -4, blur: 8,  op: 0.16 },
];

// 헤더 우측 상단 데코용 작은 별자리 (5개 별을 잇는 형태)
const CORNER_STARS: { cx: number; cy: number; r: number; o: number; delay: number }[] = [
  { cx: 14, cy: 36, r: 0.9, o: 0.85, delay: 0   },
  { cx: 34, cy: 18, r: 1.3, o: 1.0,  delay: 0.8 },
  { cx: 55, cy: 28, r: 1.0, o: 0.9,  delay: 1.6 },
  { cx: 75, cy: 14, r: 0.85, o: 0.85, delay: 2.2 },
  { cx: 86, cy: 38, r: 0.9, o: 0.85, delay: 0.4 },
];
const CORNER_EDGES: [number, number][] = [[0,1],[1,2],[2,3],[3,4]];

// 강조용 하이라이트 별 — 따뜻한 글로우와 함께 천천히 깜빡임.
const HIGHLIGHT_STARS = [
  { x: 18, y: 28, size: 4.0, dur: 3.6, delay: 0   },
  { x: 84, y: 42, size: 5.0, dur: 4.2, delay: 1.2 },
  { x: 32, y: 70, size: 4.0, dur: 3.8, delay: 2.8 },
  { x: 64, y: 84, size: 4.2, dur: 3.3, delay: 0.6 },
  { x: 46, y: 24, size: 3.2, dur: 4.8, delay: 3.5 },
  { x:  8, y: 50, size: 3.6, dur: 3.6, delay: 4.0 },
  { x: 92, y: 76, size: 4.6, dur: 4.5, delay: 1.8 },
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

const highlightTwinkle = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(0.85); }
  50%      { opacity: 1;    transform: scale(1.15); }
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

  // [MOCK ↔ API 전환 지점] 현재 실 API 사용.
  // mock 으로 돌리려면 아래 API 한 줄을 주석 처리하고 mock 블록 주석 해제.
  const fetchData = async (date: DateValue) => {
    try {
      const data = await fetchBoothAds(date);
      // ── mock 분기 (필요 시 활성화) ────────────────────────────
      // const data =
      //   date === '2026-05-26'
      //     ? await fetchBoothAdsMock0526()
      //     : date === '2026-05-27'
      //     ? await fetchBoothAdsMock0527()
      //     : await fetchBoothAdsMock0528();
      // ─────────────────────────────────────────────────────────
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

  // [MOCK ↔ API 전환 지점] 현재 실 API 재호출로 데이터 갱신.
  // mock 으로 돌리면 데이터가 정적이라 갱신이 보이지 않으므로,
  // 그 경우 아래 페이지 리로드 블록을 활성화하면 됨.
  const onReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    await Promise.all([
      fetchData(activeDay),
      new Promise<void>((resolve) => setTimeout(resolve, 700)),
    ]);
    setIsReloading(false);
    // ── mock 사용 시 페이지 리로드 분기 (필요 시 위 블록 대신 활성화) ──
    // setTimeout(() => {
    //   window.location.reload();
    // }, 600);
    // ─────────────────────────────────────────────────────────
  };

  return (
    <PageWrapper>
      {/* ── Fixed background ── */}
      <Background>
        <GrainLayer />
        {CLOUD_STREAKS.map((c, i) => (
          <CloudStreak
            key={i}
            style={{
              left: c.left,
              top: c.top,
              width: c.width,
              height: c.height,
              transform: `rotate(${c.rot}deg)`,
              filter: `blur(${c.blur}px)`,
              background: `linear-gradient(90deg, transparent 0%, rgba(225,230,240,${c.op}) 48%, rgba(225,230,240,${c.op * 0.6}) 60%, transparent 100%)`,
            }}
          />
        ))}
        {STARS.map((s, i) => (
          <Star key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} />
        ))}
        {SPARKLES.map((sp, i) => (
          <Sparkle key={i} style={{ left: `${sp.x}%`, top: `${sp.y}%`, fontSize: `${sp.size}px`, animationDuration: `${sp.dur}s`, animationDelay: `${sp.delay}s` }}>✦</Sparkle>
        ))}
        {HIGHLIGHT_STARS.map((s, i) => (
          <HighlightStar
            key={i}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
        <FireworksCanvas />
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
        <CornerConstellation viewBox="0 0 100 60" preserveAspectRatio="xMaxYMin meet">
          {CORNER_EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={CORNER_STARS[a].cx}
              y1={CORNER_STARS[a].cy}
              x2={CORNER_STARS[b].cx}
              y2={CORNER_STARS[b].cy}
              stroke="rgba(225,215,185,0.32)"
              strokeWidth="0.35"
              strokeDasharray="0.6 1.6"
              strokeLinecap="round"
            />
          ))}
          {CORNER_STARS.map((s, i) => (
            <CornerStar
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={`rgba(255,248,225,${s.o})`}
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}
        </CornerConstellation>
        <Header>
          <BrandLine>
            <AdLogoImg src={adLogoWh} alt='D-Order' />
            <BrandText>X 2026 동국대학교 봄 대동제</BrandText>
          </BrandLine>
          <MainTitle>지금 어느 부스로 가야할까?</MainTitle>
        </Header>

        {/* Date segmented control — swipe also works */}
        <DateNav onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {DATE_OPTIONS.map((d) => (
            <DateTab
              key={d.value}
              $active={d.value === activeDay}
              onClick={() => changeDate(d.value)}
            >
              <DateTabLabel>{d.label} <DateTabDay>{d.day}</DateTabDay></DateTabLabel>
              
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
                <ReloadBtn onClick={onReload} disabled={isReloading}>
                  <ReloadIcon $spinning={isReloading}>↻</ReloadIcon>
                </ReloadBtn>
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
                        {!isComingSoon && (
                          <StatusBadge $status={b.status}>{STATUS_LABELS[b.status]}</StatusBadge>
                        )}
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

// 밤하늘 권운 streak — 가로 방향으로 길게 흐르는 얇은 구름.
const CloudStreak = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
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

// 따뜻한 글로우 하이라이트 별 — 기존 Star보다 두드러지게.
const HighlightStar = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,250,225,1) 0%, rgba(255,220,160,0.65) 45%, transparent 75%);
  box-shadow:
    0 0 6px rgba(255, 220, 150, 0.75),
    0 0 14px rgba(255, 180, 100, 0.4);
  animation: ${highlightTwinkle} ease-in-out infinite;
  pointer-events: none;
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

const cornerStarTwinkle = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
`;

// 헤더 우측 상단 데코용 별자리.
// xMaxYMin meet로 우측 상단 정렬되도록 viewBox 매핑.
const CornerConstellation = styled.svg`
  position: absolute;
  top: 10px;
  right: 14px;
  width: 96px;
  height: 56px;
  pointer-events: none;
  z-index: 1;
`;

const CornerStar = styled.circle`
  animation: ${cornerStarTwinkle} 3.6s ease-in-out infinite;
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

// 카드가 밝은 톤이 되어 그 위로 비치면 텍스트 가독성이 떨어짐.
// → backdrop blur 유지하되 알파를 크게 올려 거의 불투명에 가깝게.
const StickyTopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(24, 18, 14, 0.92) 0%,
    rgba(14, 10, 8, 0.96) 100%
  );
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 6px 28px rgba(0, 0, 0, 0.4);
`;

const Header = styled.div`
  padding: 40px 20px 14px;
`;

// 로고 + 협업 문구를 한 줄로 배치.
const BrandLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const BrandText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.62);
  letter-spacing: 0.01em;
  font-family: 'SUIT', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MainTitle = styled.h1`
  font-size: clamp(1.5rem, 5.5vw, 2.2rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.2;
  white-space: nowrap;
`;

const AdLogoImg = styled.img`
  height: 20px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
`;

// ── Date segmented control ─────────────────────────────────

const DateNav = styled.div`
  display: flex;
  padding: 4px 12px 0;
  gap: 2px;
`;

const DateTab = styled.button<{ $active: boolean }>`
  flex: 1;
  background: transparent;
  border: none;
  color: ${({ $active }) => ($active ? 'rgba(255,248,230,0.96)' : 'rgba(255,255,255,0.38)')};
  padding: 10px 4px 14px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  font-family: 'SUIT', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: ${({ $active }) => ($active ? '72%' : '0')};
    height: 2px;
    background: linear-gradient(90deg, rgba(255,200,150,0.9), rgba(255,235,205,0.95));
    border-radius: 2px 2px 0 0;
    transition: width 0.25s ease;
  }
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
  opacity: 0.7;
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

const ReloadBtn = styled.button`
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
  &:disabled { opacity: 0.3; cursor: default; }
`;

const ReloadIcon = styled.span<{ $spinning: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  ${({ $spinning }) =>
    $spinning &&
    css`
      animation: ${rotateAnim} 1s linear infinite;
    `}
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

// ── 카드 팔레트 ──
// 어두운 밤하늘 위의 크림 종이/등롱 메타포.
// 살짝 따뜻한 톤(피치/크림)으로 화이트 느낌 회피.
// FULL은 opacity 떨어뜨리지 않고 배경을 한 단계 어둡게(토스트 종이).
const CARD_BG = 'rgba(249, 234, 209, 0.96)';
// FULL: 크림을 탈채도시킨 밝은 웜그레이. "바랜 종이" 톤으로 마감 표현.
const CARD_BG_FULL = 'rgba(230, 224, 216, 0.94)';
const CARD_BORDER = 'rgba(70, 45, 25, 0.1)';
const CARD_TEXT = 'rgba(28, 18, 12, 0.94)';
const CARD_TEXT_MUTED = 'rgba(54, 38, 24, 0.72)';
const CARD_TEXT_DIM = 'rgba(70, 50, 30, 0.6)';

const BoothCard = styled.div<{ $isFull: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 12px;
  background: ${({ $isFull }) => ($isFull ? CARD_BG_FULL : CARD_BG)};
  border: 1px solid ${CARD_BORDER};
  border-radius: 14px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 6px 18px rgba(0, 0, 0, 0.38),
    0 1px 3px rgba(0, 0, 0, 0.25);
`;

const BoothCardImageBox = styled.div`
  width: 76px;
  min-height: 76px;
  border-radius: 10px;
  background: rgba(45, 30, 20, 0.07);
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
  color: ${CARD_TEXT};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  font-family: 'SUIT', sans-serif;
`;

// 밝은 배경 위에서는 외곽선만으론 가독성이 약해 살짝 채운 pill 형태.
const StatusBadge = styled.span<{ $status: Status }>`
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  background: ${({ $status }) => `${STATUS_COLORS[$status]}1F`};
  border: 1px solid ${({ $status }) => `${STATUS_COLORS[$status]}66`};
  color: ${({ $status }) => STATUS_COLORS[$status]};
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.02em;
`;

const BoothCardLocation = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${CARD_TEXT_MUTED};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'SUIT', sans-serif;
`;

const RemainingLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: ${CARD_TEXT_MUTED};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 4px;
  font-family: 'SUIT', sans-serif;
`;

const BoothCardPreview = styled.span`
  font-size: 11px;
  color: ${CARD_TEXT_MUTED};
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
    $status === 'FULL' ? 'rgba(185, 28, 28, 0.18)' : 'rgba(50, 35, 25, 0.16)'};
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
    color: ${CARD_TEXT_DIM};
  }
`;
