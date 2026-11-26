'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteHeader({ siteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { brand, header } = siteContent;

  return (
    <header id="header" className="header position-relative">
      <div className="container-fluid container-xl position-relative">
        <div className="top-row d-flex align-items-center justify-content-between">
          <Link href="/" className="logo d-flex align-items-end" aria-label={header.logoAriaLabel}>
            <h1 className="sitename">{brand.name}</h1><span>{brand.logoSuffix}</span>
          </Link>
          <div className="d-flex align-items-center">
            <div className="social-links" aria-label={header.socialAriaLabel}>
              {header.socialIcons.map((icon) => (
                <span className={`bi bi-${icon}`} aria-hidden="true" key={icon} />
              ))}
            </div>
            <a className="search-form ms-4" href={header.searchHref} aria-label={header.searchAriaLabel}>
              <span>{header.searchLabel}</span>
              <i className="bi bi-search" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="nav-wrap">
        <div className="container d-flex justify-content-center position-relative">
          <nav id="navmenu" className={`navmenu${menuOpen ? ' navmenu-open' : ''}`} aria-label={header.navigationAriaLabel}>
            <ul>
              {header.navigation.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    className={item.href === pathname || (item.href !== '/' && pathname.startsWith(`${item.href}/`)) ? 'active' : ''}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              className={`mobile-nav-toggle d-xl-none bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`}
              type="button"
              aria-label={menuOpen ? header.menuCloseLabel : header.menuOpenLabel}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            />
          </nav>
        </div>
      </div>
    </header>
  );
}
