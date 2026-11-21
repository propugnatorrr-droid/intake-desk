import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigation } from 'react-router';
import { bp, color, font, space } from '../theme';
import { LinkButton, VisuallyHidden } from './ui';

const SkipLink = styled.a`
  position: absolute;
  left: ${space(2)};
  top: -64px;
  z-index: 100;
  background: ${color.primary};
  color: ${color.onPrimary};
  padding: ${space(1.5)} ${space(2)};
  border-radius: 8px;
  &:focus {
    top: ${space(2)};
  }
`;

const Header = styled.header`
  border-bottom: 1px solid ${color.line};
  background: ${color.paper};
`;

const HeaderInner = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: ${space(2)} ${space(2)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${space(2)};

  @media (min-width: ${bp.tablet}) {
    padding: ${space(2.5)} ${space(4)};
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${space(1.25)};
  font-family: ${font.heading};
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
  color: ${color.primary};
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${space(1)};
`;

const NavItem = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 ${space(1.5)};
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  color: ${color.muted};
  &[aria-current='page'] {
    color: ${color.ink};
    box-shadow: inset 0 -3px 0 ${color.accent};
    border-radius: 0;
  }
`;

const Main = styled.main`
  max-width: 1040px;
  margin: 0 auto;
  padding: ${space(3)} ${space(2)} ${space(8)};
  outline: none;

  @media (min-width: ${bp.tablet}) {
    padding: ${space(5)} ${space(4)} ${space(10)};
  }
`;

const Progress = styled.div<{ active: boolean }>`
  height: 3px;
  background: ${color.accent};
  transform-origin: left;
  transform: scaleX(${({ active }) => (active ? 0.7 : 0)});
  opacity: ${({ active }) => (active ? 1 : 0)};
  transition: transform 600ms ease, opacity 200ms ease;
`;

const Footer = styled.footer`
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 ${space(2)} ${space(5)};
  color: ${color.muted};
  font-size: 0.85rem;
  @media (min-width: ${bp.tablet}) {
    padding: 0 ${space(4)} ${space(5)};
  }
`;

export function Layout() {
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigation = useNavigation();
  const lastPath = useRef(location.pathname);

  // After a route change, move focus to the content so keyboard and screen reader users land in the right place.
  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    mainRef.current?.focus({ preventScroll: false });
  }, [location.pathname]);

  return (
    <>
      <SkipLink href="#content">Skip to content</SkipLink>
      <Header>
        <HeaderInner>
          <Brand to="/" aria-label="Intake Desk, home">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <rect width="32" height="32" rx="8" fill={color.primary} />
              <path d="M9 10h14M9 16h14M9 22h8" stroke={color.onPrimary} strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <circle cx="23" cy="22" r="2.4" fill={color.accent} />
            </svg>
            Intake Desk
          </Brand>
          <Nav aria-label="Primary">
            <NavItem to="/" end>
              Enquiries
            </NavItem>
            <LinkButton to="/new">New enquiry</LinkButton>
          </Nav>
        </HeaderInner>
        <Progress active={navigation.state !== 'idle'} aria-hidden="true" />
        <VisuallyHidden role="status">{navigation.state === 'idle' ? '' : 'Loading'}</VisuallyHidden>
      </Header>
      <Main id="content" tabIndex={-1} ref={mainRef}>
        <Outlet />
      </Main>
      <Footer>Sample data only. Every name and company here is fictional.</Footer>
    </>
  );
}
