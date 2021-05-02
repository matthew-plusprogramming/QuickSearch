import { Trie } from './typedefs';
import path from 'path';

import fs from 'fs';
const dbPath = path.join(__dirname, '/../db.json');

const initializeDatabase: () => Trie = () => {
  if (fs.existsSync(dbPath)) {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  return {};
};

const saveToDatabase: (data: Trie) => void = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data));
};

export { initializeDatabase, saveToDatabase };
