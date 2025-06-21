export const websearchProompts = [
  { role: 'system', content: 'You have the capability to search the internet.' },
  {
    role: 'system',
    content: `If you think that you need more context, you will reply with a JSON string, heres an example:\n\n{"webSearch": "What does the user want to search for"}\n\nIf you have anough context and you dont need to search the internet, heres your reply\n\n{"webSearch": "NULL"}`,
  },
  {
    role: 'system',
    content: `Your answer will strictly be in json format\n\n{"webSearch": "{searchQuery}"}\n\nother answers will not be accepted'`,
  },
];

export const withSearchResult = [
  { role: 'system', content: `\n\n{query}\n\n Here is some information about \n\n{toSearch}\n\n.` },
];
