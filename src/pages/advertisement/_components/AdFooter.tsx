import { Link } from 'react-router-dom';
import styled from 'styled-components';

const AdFooter = () => (
  <Footer>
    <FooterInner>
      <Brand>
        <BrandName>D-Order</BrandName>
        <BrandDesc>
          대학 축제의 새로운 기준.<br />
          테이블 오더 플랫폼 디오더입니다.
        </BrandDesc>
        <BrandMeta>
          <p>© 2026 D-Order Team. All rights reserved.</p>
          <p>Contact: hyojunj@naver.com</p>
        </BrandMeta>
      </Brand>

      <NavSection>
        <NavCol>
          <NavLabel>Service</NavLabel>
          <NavRouterLink to='https://2602-d-order-home-page.vercel.app/manual'>이용 가이드</NavRouterLink>
          <NavRouterLink to='https://2602-d-order-home-page.vercel.app/makers'>팀 소개</NavRouterLink>
        </NavCol>
        <NavCol>
          <NavLabel>Legal</NavLabel>
          <NavRouterLink to='https://2602-d-order-home-page.vercel.app/terms' target='_blank' rel='noopener noreferrer'>
            서비스 이용약관
          </NavRouterLink>
          <NavRouterLink to='https://2602-d-order-home-page.vercel.app/privacy' target='_blank' rel='noopener noreferrer'>
            개인정보 처리방침
          </NavRouterLink>
        </NavCol>
        <NavCol>
          <NavLabel>Social</NavLabel>
          <NavExternalLink
            href='https://www.instagram.com/d_order.official/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Instagram
          </NavExternalLink>
          <NavExternalLink
            href='http://pf.kakao.com/_xeKARX'
            target='_blank'
            rel='noopener noreferrer'
          >
            KakaoTalk Channel
          </NavExternalLink>
        </NavCol>
      </NavSection>
    </FooterInner>
  </Footer>
);

export default AdFooter;

const Footer = styled.footer`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 3rem 1.5rem;
  flex-shrink: 0;
  @media (min-width: 768px) {
    padding: 3rem 2.5rem;
  }
`;

const FooterInner = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Brand = styled.div``;

const BrandName = styled.h3`
  font-weight: 900;
  font-size: 1.2rem;
  margin: 0 0 0.75rem;
  color: #fb923c;
  font-family: 'SUIT', sans-serif;
`;

const BrandDesc = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.625;
  max-width: 20rem;
  margin: 0 0 1.25rem;
  font-family: 'SUIT', sans-serif;
`;

const BrandMeta = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.28);
  font-family: 'SUIT', sans-serif;
  p {
    margin: 0;
    line-height: 1.6;
  }
`;

const NavSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  font-size: 0.875rem;
  @media (min-width: 768px) {
    gap: 4rem;
  }
`;

const NavCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const NavLabel = styled.span`
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
  font-family: 'SUIT', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
`;

const linkBase = `
  font-family: 'SUIT', sans-serif;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.2s;
`;

const NavRouterLink = styled(Link)`
  ${linkBase}
  &:hover { color: rgba(255, 255, 255, 0.85); }
`;

const NavExternalLink = styled.a`
  ${linkBase}
  &:hover { color: rgba(255, 255, 255, 0.85); }
`;
