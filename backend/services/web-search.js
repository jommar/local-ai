const FETCH_TIMEOUT_MS = 5000;
const SEARXNG_MAX_RESULTS = 3;
const DEFAULT_IGNORE_SELECTORS = [
  // ignores
  'img',
  'a',
  'button',

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

const summarizeScrapedText = async ({ context, text, toSearch }) => {
  try {
    if (!text) throw new Error('No text to summarize');
    const ollamaRes = await context.ollama.post('/chat', {
      // model: context.chat.model,
      model: 'qwen3:8b',
      messages: [
        {
          role: 'system',
          content: 'You will summarize the givent text and return the summarized version.',
        },
        {
          role: 'system',
          content: `Your summary should be relevant to this: \n\n${toSearch}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      think: false,
      stream: false,
      format: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
          },
        },
      },
      options: {
        seed: 101,
        temperature: 0,
      },
    });
    const { summary } = JSON.parse(ollamaRes.data.message.content);
    return summary;
  } catch (e) {
    console.error(`❌ Summarization failed`, e.message);
    throw e;
  }
};

export const scrapeVisibleText = async ({ item, context, toSearch, ignoreSelectors = DEFAULT_IGNORE_SELECTORS }) => {
  try {
    const html = await fetchHtml({ url: item.url, context });
    const $ = context.cheerio.load(html);
    cleanDom({ $, ignoreSelectors });
    const text = extractCleanText({ $ });

    if (!text) throw new Error('No text found');

    return {
      title: item.title,
      url: item.url,
      content: text,
    };
  } catch (error) {
    console.error(`❌ Scraping failed: ${item.url}`, error.message);
    throw error;
  }
};

export const performWebSearch = async ({ context, toSearch }) => {
  const defaultRes = {
    results: [],
    searchQuery: false,
    sources: [],
    messages: [],
  };
  if (!toSearch) return defaultRes;

  const { data } = await context.searxng.get('/search', {
    params: {
      q: toSearch,
      format: 'json',
    },
  });

  const results = data.results.slice(0, SEARXNG_MAX_RESULTS);
  const scraped = results.map(r => scrapeVisibleText({ item: r, context, toSearch }));
  const scrapedResults = await Promise.allSettled(scraped);
  const successfulScrapes = scrapedResults.filter(r => r.status === 'fulfilled');

  if (successfulScrapes.length) {
    const successResults = successfulScrapes.map(r => r.value);
    const resultString = JSON.stringify(successResults);

    defaultRes.results = successResults;
    defaultRes.searchQuery = toSearch;
    defaultRes.sources = successResults.map(item => item.url);
    defaultRes.messages = [
      { role: 'system', content: `${resultString}\n\n Here is some information about \n\n${toSearch}\n\n.` },
    ];
  }

  return defaultRes;
};

export const willUseSearch = async ({ context, messages = [] }) => {
  const userMessages =
    messages.length > 0 ? getUserMessages(messages) : [{ role: 'user', content: context.chat.prompt }];
  const payload = {
    model: context.chat.model,
    messages: [
      {
        role: 'system',
        content: 'Based on the user prompt, do you think you need to search the internet to answer confidently?',
      },
      {
        role: 'system',
        content: 'If the user prompt is gibberish, you should not search the internet',
      },
      {
        role: 'system',
        content: 'You shouuld always use the internet if the question is about latest news or current events',
      },
      {
        role: 'system',
        content: `Todays date is ${new Date().toISOString()}. Use this information to see if you have up to date information`,
      },
      ...userMessages,
    ],
    stream: false,
    think: false,
    format: {
      type: 'object',
      properties: {
        willSearchInternet: {
          type: 'boolean',
        },
      },
    },
  };

  const ollamaRes = await context.ollama.post('/chat', payload);
  const { willSearchInternet } = JSON.parse(ollamaRes.data.message.content);

  return willSearchInternet;
};

const getUserMessages = (messages, limit = 11) => {
  return messages.slice(-limit);
};

export const constructSearchTerm = async ({ context, messages = [] }) => {
  const userMessages =
    messages.length > 0 ? getUserMessages(messages) : [{ role: 'user', content: context.chat.prompt }];
  const payload = {
    model: context.chat.model,
    messages: [
      {
        role: 'system',
        content:
          'Construct a meaningful search term that will be used in search engines like google based on the user prompt',
      },
      {
        role: 'system',
        content: `Todays date is ${new Date().toISOString()}. Use this information to see if you have up to date information`,
      },
      ...userMessages,
    ],
    stream: false,
    think: false,
    format: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
        },
      },
    },
  };

  const ollamaRes = await context.ollama.post('/chat', payload);
  const { searchTerm } = JSON.parse(ollamaRes.data.message.content);

  return searchTerm;
};

export const canSearchInternet = ({ context }) => {
  return config?.enableWebSearch || context?.chat?.enableWebSearch;
};
