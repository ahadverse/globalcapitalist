require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const connectDB = require('./config/database');
const Blog = require('./models/Blog');
const Admin = require('./models/Admin');
const SiteContent = require('./models/SiteContent');
const defaultSiteContent = require('./seed/siteContent');

const seedPosts = [
  {
    title: 'A quieter morning routine',
    content: 'A thoughtful morning does not need to be complicated. Start with a little quiet, a glass of water, and one clear intention for the day.\n\nSmall rituals create room to focus before the noise of the day begins.',
    excerpt: 'A few quiet rituals can make space for a more thoughtful, focused start to the day.',
    slug: 'a-quieter-morning-routine',
    author: 'globalcapitalist Team',
    categories: ['Lifestyle'],
    tags: ['Morning', 'Wellbeing'],
    featuredImage: '/blogy/assets/img/blog/blog-post-3.webp',
    featuredImageAlt: 'Two people reading together in a bright shared space',
    status: 'published',
  },
  {
    title: 'Why small notes matter',
    content: 'Ideas often arrive between the big moments: on a walk, in a conversation, or just before sleep. Writing them down gives those thoughts somewhere to go.\n\nA notebook is less about having the perfect answer and more about staying curious long enough to find one.',
    excerpt: 'Writing down small ideas helps us stay curious and notice where a thought might lead.',
    slug: 'why-small-notes-matter',
    author: 'globalcapitalist Team',
    categories: ['Creativity'],
    tags: ['Writing', 'Ideas'],
    featuredImage: '/blogy/assets/img/blog/blog-post-9.webp',
    featuredImageAlt: 'A quiet desk arranged for focused work',
    status: 'published',
  },
  {
    title: 'Finding focus in a noisy world',
    content: 'Focus is not always about doing more. Sometimes it starts with choosing one useful thing and giving it your full attention.\n\nMake a little space, turn down the distractions, and let steady progress be enough.',
    excerpt: 'A practical reminder that focus begins by choosing one useful thing and giving it your attention.',
    slug: 'finding-focus-in-a-noisy-world',
    author: 'globalcapitalist Team',
    categories: ['Culture'],
    tags: ['Focus', 'Habits'],
    featuredImage: '/blogy/assets/img/blog/blog-post-7.webp',
    featuredImageAlt: 'A calm, light-filled interior',
    status: 'published',
  },
  {
    title: 'How cities change when we walk',
    content: 'A city reveals itself differently when we move at walking speed. Shop windows become little exhibitions, side streets open up, and familiar routes begin to hold unexpected details.\n\nWalking also gives a neighborhood time to speak. You notice who gathers on the steps, where the afternoon light settles, and which places invite you to stay a little longer. The experience is not about covering ground quickly; it is about being present enough to see what was already there.\n\nThe next time a destination is close, leave a few minutes early and take the slower route. You may arrive with a better sense of the place—and a clearer head.',
    excerpt: 'At walking speed, familiar streets become places to notice, explore, and understand.',
    slug: 'how-cities-change-when-we-walk',
    author: 'globalcapitalist Team',
    categories: ['Culture', 'Travel'],
    tags: ['Cities', 'Walking', 'Slow living'],
    featuredImage: '/blogy/assets/img/blog/blog-post-6.webp',
    featuredImageAlt: 'A close view of everyday objects in a thoughtfully arranged room',
    seoTitle: 'How Cities Change When We Walk',
    seoDescription: 'A reflection on how walking helps us notice the details and character of a city.',
    status: 'published',
  },
  {
    title: 'The case for asking better questions',
    content: 'A good question can change the shape of a conversation. Instead of rushing toward an answer, it gives people room to explain what they mean and what they have not said yet.\n\nTry replacing “Is this finished?” with “What would make this stronger?” or “What are we missing?” The shift is small, but it turns a judgement into an invitation to think together.\n\nCuriosity is a practical skill. It helps teams find clearer problems, makes everyday conversations more generous, and reminds us that understanding is usually a process rather than a quick conclusion.',
    excerpt: 'Better questions make more room for understanding, useful feedback, and shared ideas.',
    slug: 'the-case-for-asking-better-questions',
    author: 'globalcapitalist Team',
    categories: ['Creativity', 'Culture'],
    tags: ['Curiosity', 'Communication', 'Ideas'],
    featuredImage: '/blogy/assets/img/blog/blog-post-5.webp',
    featuredImageAlt: 'An inviting still life with warm colors',
    seoTitle: 'The Case for Asking Better Questions',
    seoDescription: 'How thoughtful questions can lead to clearer ideas and more generous conversations.',
    status: 'published',
  },
  {
    title: 'A more thoughtful digital day',
    content: 'Digital tools are most useful when they support an intention. Before opening another tab or checking another notification, pause long enough to decide what you came to do.\n\nA few simple boundaries can help: keep the first minutes of the morning screen-free, silence alerts that do not need an immediate answer, and leave one task visible until it is complete. These are not rules for using technology less; they are ways to use it with more purpose.\n\nAttention is limited, but it can be directed. A calmer digital day often begins with one deliberate choice.',
    excerpt: 'Small boundaries can make technology feel more intentional and protect time for focused work.',
    slug: 'a-more-thoughtful-digital-day',
    author: 'globalcapitalist Team',
    categories: ['Technology', 'Lifestyle'],
    tags: ['Attention', 'Technology', 'Habits'],
    featuredImage: '/blogy/assets/img/blog/blog-post-2.webp',
    featuredImageAlt: 'A bright, organized workspace',
    seoTitle: 'A More Thoughtful Digital Day',
    seoDescription: 'Simple ways to make everyday technology use more deliberate and focused.',
    status: 'published',
  },
  {
    title: 'Designing places for conversation',
    content: 'The best places to talk are not always the most impressive. A shared table, a comfortable corner, or a bench beside a busy path can make it easier for people to settle in and listen.\n\nSmall choices in a room change how it feels: where the light falls, whether chairs face one another, and whether there is space to put down a cup. Good design does not demand attention. It makes connection feel natural.\n\nThat idea applies beyond interiors. In a meeting, a classroom, or a neighborhood, leaving room for people to meet can be as important as the plan itself.',
    excerpt: 'A few thoughtful details can turn an ordinary space into an invitation to connect.',
    slug: 'designing-places-for-conversation',
    author: 'globalcapitalist Team',
    categories: ['Culture', 'Lifestyle'],
    tags: ['Design', 'Community', 'Spaces'],
    featuredImage: '/blogy/assets/img/blog/blog-post-4.webp',
    featuredImageAlt: 'A warm, lived-in room with a welcoming atmosphere',
    status: 'published',
  },
  {
    title: 'What a slower afternoon can teach us',
    content: 'An unplanned afternoon can feel unfamiliar when every hour already has a purpose. But leaving a little room in the day makes it possible to notice what has been crowded out: a book waiting on the table, a longer walk, or a conversation without a clock beside it.\n\nRest is not a reward for finishing everything. It is part of how we return to our work with patience and perspective. Even a short pause can change the pace of the hours that follow.\n\nTry protecting one small stretch of time this week and let it remain open. The point is not to fill it well, but to see what happens when you do not have to.',
    excerpt: 'An open patch of time can make space for rest, attention, and a fresh perspective.',
    slug: 'what-a-slower-afternoon-can-teach-us',
    author: 'globalcapitalist Team',
    categories: ['Lifestyle', 'Wellbeing'],
    tags: ['Rest', 'Slow living', 'Wellbeing'],
    featuredImage: '/blogy/assets/img/blog/blog-post-10.webp',
    featuredImageAlt: 'A quiet room set up for an unhurried afternoon',
    status: 'published',
  },
  {
    title: 'Making space for a creative practice',
    content: 'Creative work rarely arrives on command, but it does respond to an invitation. A regular place to begin, a simple set of tools, and a manageable amount of time can lower the barrier between an idea and the first attempt.\n\nThe practice does not need to be impressive or public. It can be a page of notes, a rough sketch, or a few minutes spent learning something new. Repetition creates room for surprises that a perfect plan might never allow.\n\nStart small enough that you can return tomorrow. The habit of showing up is often more useful than waiting for the ideal moment.',
    excerpt: 'A modest routine can make creative work easier to begin and easier to return to.',
    slug: 'making-space-for-a-creative-practice',
    author: 'globalcapitalist Team',
    categories: ['Creativity', 'Lifestyle'],
    tags: ['Creativity', 'Practice', 'Ideas'],
    featuredImage: '/blogy/assets/img/blog/blog-post-1.webp',
    featuredImageAlt: 'A workspace prepared for a creative session',
    status: 'published',
  },
  {
    title: 'A reading list for slower days',
    content: 'A few books, a comfortable chair, and an unhurried afternoon can be a good place to begin. Add your favorite titles here and share the list when it is ready.',
    excerpt: 'A draft list of books and reading ideas for a slower afternoon.',
    slug: 'a-reading-list-for-slower-days',
    author: 'globalcapitalist Team',
    categories: ['Books'],
    tags: ['Reading', 'Recommendations'],
    featuredImage: '/blogy/assets/img/blog/blog-post-6.webp',
    featuredImageAlt: 'A quiet setting for an afternoon of reading',
    status: 'draft',
  },
];

function mergeMissingDefaults(current, defaults) {
  if (Array.isArray(defaults)) {
    return Array.isArray(current) ? current : defaults;
  }
  if (defaults && typeof defaults === 'object') {
    const merged = { ...defaults, ...(current || {}) };
    for (const [key, value] of Object.entries(defaults)) {
      merged[key] = mergeMissingDefaults(current?.[key], value);
    }
    return merged;
  }
  return current === undefined ? defaults : current;
}

function migrateDefaultPageLinks(content) {
  if (content.header?.searchHref === '#post-search') {
    content.header.searchHref = '/#post-search';
  }

  const linkMigrations = new Map([
    ['Home|/#home', '/'],
    ['About|/#about', '/about'],
    ['About the journal|/#about', '/about'],
    ['Our journal|/#about', '/about'],
    ['Category|/#category-section', '/category'],
    ['Categories|/#category-section', '/category'],
    ['Culture|/#category-section', '/category'],
    ['Creativity|/#category-section', '/category'],
    ['Lifestyle|/#category-section', '/category'],
    ['Technology|/#category-section', '/category'],
    ['Travel|/#category-section', '/category'],
    ['Contact|/#footer', '/contact'],
  ]);
  const migrate = (item) => {
    const href = linkMigrations.get(`${item.label}|${item.href}`);
    return href ? { ...item, href } : item;
  };

  if (Array.isArray(content.header?.navigation)) {
    content.header.navigation = content.header.navigation.map(migrate);
  }
  if (Array.isArray(content.footer?.columns)) {
    content.footer.columns = content.footer.columns.map((column) => ({
      ...column,
      links: Array.isArray(column.links) ? column.links.map(migrate) : column.links,
    }));
  }
  if (content.footer) {
    delete content.footer.creditPrefix;
    delete content.footer.creditLabel;
    delete content.footer.creditHref;
  }
}

function replaceSeededAboutCopy(content) {
  const about = content.pages?.about;
  const oldSectionTitles = ['Curiosity comes first', 'A journal for the details'];
  const matchesOldSeed = about?.description === 'globalcapitalist is an independent journal about creativity, culture, and the details that shape everyday life.'
    && Array.isArray(about.sections)
    && about.sections.length === oldSectionTitles.length
    && about.sections.every((section, index) => section.title === oldSectionTitles[index]);

  if (matchesOldSeed) {
    content.pages.about = {
      ...about,
      eyebrow: defaultSiteContent.pages.about.eyebrow,
      title: defaultSiteContent.pages.about.title,
      description: defaultSiteContent.pages.about.description,
      imageAlt: defaultSiteContent.pages.about.imageAlt,
      sections: defaultSiteContent.pages.about.sections,
    };
  }

  const contact = content.pages?.contact;
  if (contact?.description === 'Have a question, a story idea, or feedback about the journal? Send us a message and our team will follow up.') {
    contact.description = defaultSiteContent.pages.contact.description;
    contact.successMessage = defaultSiteContent.pages.contact.successMessage;
  }
}

async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is required to seed the initial admin');
  }

  await connectDB();
  let inserted = 0;
  let existing = 0;

  for (const post of seedPosts) {
    const result = await Blog.updateOne(
      { slug: post.slug },
      { $setOnInsert: post },
      { upsert: true }
    );
    if (result.upsertedCount) {
      inserted += 1;
    } else {
      existing += 1;
      if (post.featuredImage) {
        await Blog.updateOne(
          {
            slug: post.slug,
            $or: [
              { featuredImage: { $exists: false } },
              { featuredImage: null },
              { featuredImage: '' },
            ],
          },
          {
            $set: {
              featuredImage: post.featuredImage,
              featuredImageAlt: post.featuredImageAlt,
            },
          }
        );
      }
      await Blog.updateOne(
        { slug: post.slug, author: 'Fieldnotes Team' },
        { $set: { author: 'globalcapitalist Team' } }
      );
    }
  }

  const siteContentResult = await SiteContent.updateOne(
    { key: 'globalcapitalist' },
    { $setOnInsert: { content: defaultSiteContent } },
    { upsert: true }
  );
  if (siteContentResult.upsertedCount) {
    console.log('Site content created.');
  } else {
    const existingSiteContent = await SiteContent.findOne({ key: 'globalcapitalist' }).lean();
    const content = mergeMissingDefaults(existingSiteContent.content, defaultSiteContent);
    migrateDefaultPageLinks(content);
    replaceSeededAboutCopy(content);
    if (JSON.stringify(content) !== JSON.stringify(existingSiteContent.content)) {
      await SiteContent.updateOne({ key: 'globalcapitalist' }, { $set: { content } });
      console.log('Missing site content defaults added.');
    } else {
      console.log('Site content already existed.');
    }
  }

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error('ADMIN_PASSWORD is required to seed the initial admin');
    }

    const passwordHash = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 12);
    await Admin.create({ email: adminEmail, passwordHash });
    console.log('Initial admin created.');
  } else {
    console.log('Admin already existed; credentials were left unchanged.');
  }

  console.log(`Post seed complete: ${inserted} inserted, ${existing} already existed.`);
}

seed()
  .catch((error) => {
    console.error('Unable to seed blog posts:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
