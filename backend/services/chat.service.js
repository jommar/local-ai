const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

const processChat = async ({ context }) => {
  try {
    const uuid = context.chat.uuid || uuidv4();
    const filePath = path.resolve(context.root, `./messages/${uuid}.log`);

    let messages = getMessageHistory(filePath);
    messages.push({ role: 'user', content: context.chat.prompt });

    const response = await context.ollama.post('/chat', {
      model: context.model,
      stream: false,
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...messages],
    });

    const { message } = response.data;
    messages.push(message);
    saveMessageHistory(filePath, messages);

    return { uuid, message, model: context.model };
  } catch (error) {
    console.error('❌ Error in processChat:', error.message);
    throw error;
  }
};

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
      return {
        text: clean.slice(0, 8),
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

module.exports = { processChat, getChatHistory, getChats };
