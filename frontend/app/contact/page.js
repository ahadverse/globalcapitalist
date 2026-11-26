import ContactForm from '../../components/ContactForm';
import { getSiteContent } from '../../lib/siteContent';

export async function generateMetadata() {
  const { brand, pages } = await getSiteContent();
  return {
    title: pages.contact.title,
    description: pages.contact.description || brand.description,
  };
}

export default async function ContactPage() {
  const { contact } = (await getSiteContent()).pages;

  return (
    <main className="main separate-page contact-page">
      <div className="page-title">
        <div className="title-wrapper">
          <p className="page-eyebrow">{contact.eyebrow}</p>
          <h1>{contact.title}</h1>
          <p>{contact.description}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="contact-card">
            <div className="section-title">
              <h2>{contact.formTitle}</h2>
            </div>
            <ContactForm content={contact} />
          </div>
        </div>
      </section>
    </main>
  );
}
