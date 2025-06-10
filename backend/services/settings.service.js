const fs = require('fs');
const path = require('path');

const saveSettings = ({ context, body }) => {
  delete body.model;
  const filePath = path.resolve(context.root, `./settings/custom.log`);
  const dirPath = path.resolve(context.root, './settings');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(body), 'utf-8');

  return { done: true };
};

const getSettings = ({ context }) => {
  const filePath = path.resolve(context.root, `./settings/custom.log`);
  const settings = fs.readFileSync(filePath, 'utf-8');

  return { data: JSON.parse(settings) };
};

module.exports = { saveSettings, getSettings };
