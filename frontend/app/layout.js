import './vendor/bootstrap.min.css';
import './vendor/bootstrap-icons.min.css';
import './blogy-main.css';
import './globals.css';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import { getSiteContent } from '../lib/siteContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const { brand } = await getSiteContent();
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
      title: {
        default: brand.defaultTitle,
        template: brand.titleTemplate,
      },
      description: brand.description,
      openGraph: {
        type: 'website',
        siteName: brand.name,
        title: brand.defaultTitle,
        description: brand.openGraphDescription,
      },
    };
  } catch (error) {
    console.error('Unable to load site metadata:', error);
    return { title: 'Site content unavailable' };
  }
}

export default async function RootLayout({ children }) {
  let siteContent;
  let siteContentError = '';

  try {
    siteContent = await getSiteContent();
  } catch (error) {
    siteContentError = error instanceof Error ? error.message : 'The site content API could not be reached.';
  }

  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          {siteContent
            ? <SiteHeader siteContent={siteContent} />
            : <div className="container site-config-error" role="alert">{siteContentError}</div>}
          <div className="site-content">{children}</div>
          {siteContent && (
            <footer id="footer" className="footer">
              <div className="container footer-top">
                <div className="row gy-4">
                  <div className="col-lg-4 col-md-6 footer-about">
                    <Link href="/" className="logo d-flex align-items-center">
                      <span className="sitename">{siteContent.brand.name}</span>
                    </Link>
                    <div className="footer-contact pt-3">
                      <p>{siteContent.footer.description}</p>
                    </div>
                    <div className="social-links d-flex mt-4" aria-label={siteContent.footer.socialAriaLabel}>
                      {siteContent.footer.socialIcons.map((icon) => (
                        <span className={`bi bi-${icon}`} aria-hidden="true" key={icon} />
                      ))}
                    </div>
                  </div>
                  {siteContent.footer.columns.map((column) => (
                    <div className="col-lg-2 col-md-3 footer-links" key={column.title}>
                      <h4>{column.title}</h4>
                      <ul>
                        {column.links.map((item) => (
                          <li key={`${item.href}-${item.label}`}><Link href={item.href}>{item.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="container copyright text-center mt-4">
                <p>{siteContent.footer.copyrightSymbol} <span>{siteContent.footer.copyrightLabel}</span> <strong className="px-1 sitename">{siteContent.brand.name}</strong> <span>{siteContent.footer.rightsText}</span></p>
              </div>
            </footer>
          )}
        </div>
      </body>
    </html>
  );
}
