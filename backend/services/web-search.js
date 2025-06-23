const FETCH_TIMEOUT_MS = 5000;
const SEARXNG_MAX_RESULTS = 5;
const DEFAULT_IGNORE_SELECTORS = [
  // Structural or metadata
  'script',
  'style',
  'noscript',
  'template',
  'meta',
  'link',
  'iframe',
  'svg',
  'canvas',
  'object',
  'embed',

  // Layout/navigation/UI elements
  'nav',
  'footer',
  'header',
  'form',
  'aside',

  // Common classes/IDs for ads and UI overlays
  '.ad',
  '.ads',
  '[class*="advert"]',
  '[id*="advert"]',
  '.sponsored',
  '.popup',
  '.modal',
  '.overlay',
  '.newsletter',
  '.subscribe',
  '.subscribe-box',
  '.subscription',
  '#cookie-banner',
  '.cookie-consent',
  '.sidebar',
  '.share-buttons',
  '.social-icons',

  // Hidden elements
  '[aria-hidden="true"]',
  '[style*="display:none"]',
  '[style*="visibility:hidden"]',
];

const fetchHtml = async ({ context, url }) => {
  const { data } = await context.axios.get(url, { timeout: FETCH_TIMEOUT_MS });
  return data;
};

const cleanDom = ({ $, ignoreSelectors }) => {
  ignoreSelectors.forEach(selector => $(selector).remove());
};

const extractCleanText = ({ $ }) => {
  const rawText = $('body').text();
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
};

const summarizeScrapedText = async ({ context, text }) => {
  try {
    const res = await context.ollama.post('/chat', {
      model: context.chat.model,
      messages: [
        {
          role: 'user',
          content: `Summarize this text: ${text}\n\nYou will only return the summarized version and no other context.`,
        },
      ],
      think: false,
      stream: false,
    });
    const { content } = res?.data?.message;

    return content;
  } catch (e) {
    console.error(`❌ Summarization failed`, e.message);
    return null;
  }
};

export const scrapeVisibleText = async ({ url, context, ignoreSelectors = DEFAULT_IGNORE_SELECTORS }) => {
  try {
    const html = await fetchHtml({ url, context });
    const $ = context.cheerio.load(html);
    cleanDom({ $, ignoreSelectors });
    const text = extractCleanText({ $ });

    if (!text) return null;

    const summarized = await summarizeScrapedText({ context, text });

    return summarized;
  } catch (error) {
    console.error(`❌ Scraping failed: ${url}`, error.message);
    return null;
  }
};

export const performWebSearch = async ({ context, toSearch }) => {
  const { data } = await context.searxng.get('/search', {
    params: {
      q: toSearch,
      format: 'json',
    },
  });

  const results = data.results.slice(0, SEARXNG_MAX_RESULTS);

  const formattedResults = await Promise.all(
    results.map(async r => {
      try {
        const content = await scrapeVisibleText({ url: r.url, context });
        if (!content) return null;

        return {
          title: r.title,
          url: r.url,
          content,
        };
      } catch (err) {
        console.error(`❌ Failed to scrape ${r.url}:`, err.message);
        return null;
      }
    })
  );

  return formattedResults.filter(Boolean);
};
