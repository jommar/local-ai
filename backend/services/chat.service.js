const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config.json');

const ALLOW_WEB_SEARCH = true;
const SEARXNG_MAX_RESULTS = 5;

const getMessageHistory = filePath => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', 'utf-8');
  }

  const log = fs.readFileSync(filePath, 'utf-8').trim();
  return log ? JSON.parse(log) : [];
};

const saveMessageHistory = (filePath, messages) => {
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');
};

const withSystemRoles = ({ messages, context, searchResults = [] }) => {
  const systemMessages = context.chat.systemMessages
    .filter(m => m.enabled)
    .map(content => ({ role: 'system', content: content.message }));
  const withSystemRoles = [...messages];

  if (searchResults?.length) withSystemRoles.unshift(...searchResults);
  if (systemMessages?.length) withSystemRoles.unshift(...systemMessages);
  if (config?.prompts?.system) withSystemRoles.unshift({ role: 'system', content: config?.prompts?.system });

  const filePath = path.resolve(context.root, `./settings/custom.log`);
  const settings = fs.readFileSync(filePath, 'utf-8');

  if (settings?.trim().length) {
    withSystemRoles.unshift({
      role: 'system',
      content: `Known information about the user: ${settings}. Use these information to tailor your response.`,
    });
  }

  return withSystemRoles;
};

const _processChatStream = async ({ context, res, payload, uuid }) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const filePath = path.resolve(context.root, `./messages/${uuid}.log`);
  const messages = getMessageHistory(filePath);

  messages.push({ role: 'user', content: context.chat.prompt });

  // Send streaming request
  const apiRes = await context.ollama.post('/chat', payload, {
    responseType: 'stream',
  });

  let assistantText = '';

  // Handle stream chunks
  apiRes.data.on('data', chunk => {
    const lines = chunk.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const content = parsed.message?.content || '';
        assistantText += content;
        res.write(`data: ${JSON.stringify({ delta: content, uuid })}\n\n`);
      } catch (err) {
        console.error('Invalid JSON from Ollama:', line);
      }
    }
  });

  // Wait for stream to end
  await new Promise((resolve, reject) => {
    apiRes.data.on('end', resolve);
    apiRes.data.on('error', reject);
  });

  // Save response history and close connection
  messages.push({ role: 'assistant', content: assistantText });
  saveMessageHistory(filePath, messages);
  res.end();
};

const _generateWebSearch = async ({ context, prevMessages }) => {
  if (!ALLOW_WEB_SEARCH) return null;
  try {
    const messages = [
      {
        role: 'system',
        content:
          'Basedon the given information, you will need to search the web for more information. You will reply with a JSON string for the most accurate answer for the user to search for.\n\nExample: {"webSearch": "What does the user want to search for"}',
      },
      {
        role: 'system',
        content:
          'Your answer will strictly be in json format \n\n{"webSearch": "{searchQuery}"}\n\n other answers will not be accepted',
      },
      ...prevMessages,
    ];
    const res = await context.ollama.post('/chat', {
      model: context.chat.model,
      messages,
      think: false,
      stream: false,
    });
    const { content } = res?.data?.message;
    const { webSearch } = JSON.parse(content);

    if (webSearch === 'NULL') return null;

    return webSearch;
  } catch (e) {
    return null;
  }
};

const performWebSearch = async ({ context, toSearch }) => {
  const { data } = await context.searxng.get('/search', {
    params: {
      q: toSearch,
      format: 'json',
    },
  });

  const results = data.results.slice(0, SEARXNG_MAX_RESULTS);
  const formattedResults = results.map(r => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
  // TODO: use cheerio to get the full page text in formattedResults.url

  return formattedResults;
};

const withWebSearchRoles = async ({ context, messages }) => {
  const toSearch = await _generateWebSearch({ context, prevMessages: messages });
  if (!toSearch) return [];

  try {
    const webSearchRes = await performWebSearch({ context, toSearch });
    const query = JSON.stringify(webSearchRes);
    return [{ role: 'system', content: `\n\n${query}\n\n Here is some information about \n\n${toSearch}\n\n.` }];
  } catch (e) {
    return [];
  }
};

const processChat = async ({ context, res }) => {
  // 1️⃣ Prepare UUID, file paths, and load history
  const uuid = context.chat.uuid || uuidv4();
  const dirPath = path.resolve(context.root, './messages');
  const filePath = path.resolve(dirPath, `${uuid}.log`);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const messages = getMessageHistory(filePath);
  messages.push({ role: 'user', content: context.chat.prompt });

  // 2️⃣ Build the payload
  const searchResults = await withWebSearchRoles({ context, messages });
  const model = context.chat.model || context.model;
  const payload = {
    model: context.chat.model,
    messages: withSystemRoles({ context, messages, searchResults }),
    stream: context.chat.stream,
    think: context.chat.think,
  };

  // 3️⃣ STREAMING branch
  if (payload.stream) return await _processChatStream({ context, res, payload, uuid });

  // 5️⃣ NON-STREAMING branch
  const apiRes = await context.ollama.post('/chat', payload);
  const { message } = apiRes.data;

  messages.push(message);
  saveMessageHistory(filePath, messages);

  // 6️⃣ Finally return the JSON blob
  return res.send({ uuid, message, model });
};

module.exports = { processChat };

const getChatHistory = ({ context }) => {
  const { uuid } = context.chat;
  const filePath = path.resolve(context.root, `./messages/${uuid}.log`);
  const messages = getMessageHistory(filePath);

  return { messages, uuid, model: context.model };
};

const getChats = ({ context }) => {
  const messagesDir = path.resolve(context.root, './messages');
  const chats = fs.readdirSync(messagesDir);

  return chats
    .map(filename => {
      const fullPath = path.join(messagesDir, filename);
      const stats = fs.statSync(fullPath);

      const clean = filename.replace('.log', '');
      const isUuid = clean.length === 36 && clean.split('-')?.length === 5;
      return {
        text: isUuid ? clean.slice(0, 8) : clean,
        value: clean,
        updatedAt: stats.mtime,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(chat => ({
      ...chat,
      updatedAt: chat.updatedAt,
    }));
};

const deleteChat = ({ context, file }) => {
  const messagesDir = path.resolve(context.root, './messages');
  const filePath = path.join(messagesDir, `${file}.log`);

  fs.unlinkSync(filePath);
};

const renameChat = ({ context, originalName, newName }) => {
  const messagesDir = path.resolve(context.root, './messages');
  const oldPath = path.join(messagesDir, `${originalName}.log`);
  const newPath = path.join(messagesDir, `${newName}.log`);

  fs.renameSync(oldPath, newPath);
};

module.exports = { processChat, getChatHistory, getChats, deleteChat, renameChat };
