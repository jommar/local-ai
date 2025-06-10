const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config.json');

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

    const dirPath = path.resolve(context.root, './messages');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let messages = getMessageHistory(filePath);
    messages.push({ role: 'user', content: context.chat.prompt });

    if (config?.prompts?.system) messages.unshift({ role: 'system', content: config.prompts.system });

    const model = context?.chat?.model || context?.model;
    const response = await context.ollama.post('/chat', {
      model,
      stream: false,
      messages,
    });

    const { message } = response.data;
    messages.push(message);
    saveMessageHistory(filePath, messages);

    return { uuid, message, model };
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
