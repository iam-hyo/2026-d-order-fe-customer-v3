import styled, { css, keyframes } from 'styled-components';

const floatIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.82) rotate(-1.5deg);
  }
  68% {
    opacity: 1;
    transform: translateY(-5px) scale(1.035) rotate(0.4deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
`;

const floatOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
  to {
    opacity: 0;
    transform: translateY(18px) scale(0.9) rotate(1deg);
  }
`;

const shine = keyframes`
  0% {
    transform: translateX(-145%) skewX(-18deg);
    opacity: 0;
  }
  24% {
    opacity: 0.55;
  }
  72% {
    opacity: 0.25;
  }
  100% {
    transform: translateX(145%) skewX(-18deg);
    opacity: 0;
  }
`;

export const PageWrap = styled.div`
  width: 100%;
  max-width: 720px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 16px 18px 40px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.Bg};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.Orange01};

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  img {
    width: 24px;
    height: 24px;
  }

  p {
    margin: 0;
    ${({ theme }) => css(theme.fonts.ExtraBold20)};
  }
`;

export const Toolbar = styled.div`
  margin-bottom: 22px;
  overflow: visible;
`;

export const FilterBox = styled.div`
  display: flex;
  gap: clamp(3px, 1.1vw, 8px);
  width: 100%;
  overflow: visible;
  padding: 4px 0 10px;
`;

export const FilterBtn = styled.button<{ $active?: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  min-height: 34px;
  padding: 0 clamp(3px, 1.5vw, 10px);
  border: 1px solid ${({ $active}) => ($active ? "#FF8E69" : 'rgba(65, 65, 65, 0.16)')};
  border-radius: 999px;
  background: ${({ $active, theme }) => ($active ? "#FF8E69" : theme.colors.White)};
  color: ${({ $active, theme }) => ($active ? theme.colors.White : theme.colors.Black02)};
  ${({ theme }) => css(theme.fonts.Bold14)};
  font-size: clamp(10px, 2.6vw, 14px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 8px 18px rgba(255, 110, 63, 0.24)' : 'none')};
  transform: translateY(${({ $active }) => ($active ? '-1px' : '0')});
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    color 0.22s ease,
    transform 0.22s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.Orange02};
    color: ${({ $active, theme }) => ($active ? theme.colors.White : theme.colors.Orange01)};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const ImageCard = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  // border: 1px solid rgba(65, 65, 65, 0.12);
  border-radius: 26px;
  // background: ${({ theme }) => theme.colors.Bg};
  background: #FAFAFA;

  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.055);
  cursor: pointer;
  transition:
    // border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: rgba(255, 110, 63, 0.36);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.09);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.985);
  }
`;

export const DeveloperImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  border-radius: 14px;
  object-fit: contain;
`;

export const FloatingOverlay = styled.div<{ $closing?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  border: 0;
  background: rgba(0, 0, 0, ${({ $closing }) => ($closing ? 0 : 0.58)});
  cursor: pointer;
  opacity: ${({ $closing }) => ($closing ? 0 : 1)};
  transition:
    background 0.22s ease,
    opacity 0.22s ease;
`;

export const FloatingCard = styled.div<{ $closing?: boolean }>`
  position: relative;
  width: min(84vw, 390px);
  max-height: 82vh;
  padding: 0;
  overflow: hidden;
  border-radius: 42px;
  // background: ${({ theme }) => theme.colors.White};
  // box-shadow:
  //   0 26px 70px rgba(0, 0, 0, 0.34);
  //   // 0 0 0 1px rgba(255, 255, 255, 0.5);
  cursor: default;
  animation: ${({ $closing }) => ($closing ? floatOut : floatIn)} ${({ $closing }) => ($closing ? '0.2s' : '0.42s')}
    cubic-bezier(0.2, 0.82, 0.24, 1) forwards;

  &::after {
    content: '';
    position: absolute;
    top: -20%;
    left: 0;
    width: 44%;
    height: 140%;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.54), transparent);
    animation: ${shine} 0.72s ease 0.08s both;
  }
`;

export const FloatingImage = styled.img`
  display: block;
  width: 100%;
  max-height: 82vh;
  object-fit: contain;
`;
