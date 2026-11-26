import { getSiteContent } from '../../lib/siteContent';

export async function generateMetadata() {
  const { brand, pages } = await getSiteContent();
  return {
    title: pages.about.title,
    description: pages.about.description || brand.description,
  };
}

export default async function AboutPage() {
  const { pages } = await getSiteContent();
  const about = pages.about;

  return (
    <main className="main separate-page about-page">
      <div className="page-title">
        <div className="title-wrapper">
          <p className="page-eyebrow">{about.eyebrow}</p>
          <h1>{about.title}</h1>
          <p>{about.description}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5">
              <img className="about-image img-fluid rounded-4" src={about.image} alt={about.imageAlt} />
            </div>
            <div className="col-lg-7">
              <div className="about-copy">
                {about.sections.map((section) => (
                  <section className="about-copy-section" key={section.title}>
                    <h2>{section.title}</h2>
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
