//  QuickSearch
//
//  Created by Matthew Lin.
//  Contact: matthewlinplusprogramming@gmail.com
//
//  Entrypoint for server, initializes behavior
//
//  Copyright © 2021 Matthew Lin. All rights reserved.
//

// Environment import
import dotenv from 'dotenv';
dotenv.config();

// Regular imports
import { initializeDatabase, saveToDatabase } from './dbInterface';
import { Trie } from './typedefs';
import cors from 'cors';
import express from 'express';

// Global state
const globalTrie = initializeDatabase();

// Utility
const addToTrie: (trie: Trie, phraseToAdd: string) => void = (
  trie,
  phraseToAdd,
) => {
  if (phraseToAdd === '') {
    trie['**'] = true;
    return;
  }

  const nextChar = phraseToAdd[0];
  if (typeof trie[nextChar] === 'undefined' || trie[nextChar] === null) {
    // Create new trie
    trie[nextChar] = {};
  }
  // Continue traversing
  addToTrie(trie[nextChar] as Trie, phraseToAdd.substring(1));
  saveToDatabase(globalTrie);
};

const removeFromTrie: (trie: Trie, phraseToRemove: string) => void = (
  trie,
  phraseToRemove,
) => {
  let currentTrie = trie;
  let newTailNode = trie;
  let indexCharacterToDelete =
    phraseToRemove.length > 0 ? phraseToRemove[0] : null;

  for (
    let characterIndex = 0;
    characterIndex < phraseToRemove.length;
    ++characterIndex
  ) {
    // Walk through
    const currentCharacter = phraseToRemove[characterIndex];
    if (
      typeof currentTrie[currentCharacter] === 'undefined' ||
      currentTrie[currentCharacter] === null
    ) {
      return;
    }

    // Don't delete any nodes that have other solutions
    const previousTrie = currentTrie;
    const previousTrieSolutionDefined =
      typeof previousTrie['**'] !== 'undefined' && previousTrie['**'] !== null;
    currentTrie = currentTrie[currentCharacter] as Trie;
    if (
      previousTrie['**'] === true ||
      (!previousTrieSolutionDefined && Object.keys(previousTrie).length > 1)
    ) {
      newTailNode = previousTrie;
      indexCharacterToDelete = currentCharacter;
    }
  }

  // If this is a valid word in the trie
  if (currentTrie['**'] === true && indexCharacterToDelete !== null) {
    // Delete if there are no children
    if (Object.keys(currentTrie).length < 2) {
      delete newTailNode[indexCharacterToDelete];
    } else {
      // Just delete ** entry if can't delete node
      delete currentTrie['**'];
    }
  }
  saveToDatabase(globalTrie);
};

// ! REMOVE ME BEFORE PRODUCTION. For development purposes only
const printTrie = () => {
  console.log(JSON.stringify(globalTrie, undefined, 2));
};

// REST API
const app = express();
app.use(cors());
app.use(express.json());
app.use(
  (err: Error, _1: any, res: express.Response, next: express.NextFunction) => {
    // Catch error from express.json()
    if (err instanceof SyntaxError) {
      res.status(400).send({ success: false, message: 'Invalid json' });
      return;
    }
    next();
  },
);

// ! REMOVE ME BEFORE PRODUCTION. For development purposes only
app.get('/', (req, res) => {
  console.log('received request');
  console.log(JSON.stringify(req.body));

  printTrie();
  res.status(200).send('OK');
});
app.post('/add', (req, res) => {
  console.log('Request to add received');
  const { keyword } = req.body;

  // Input validation
  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  addToTrie(globalTrie, keyword);
  res
    .status(201)
    .send({ success: true, message: 'Added to trie successfully' });
});
app.delete('/delete', (req, res) => {
  console.log('Request to delete received');
  const { keyword } = req.body;

  // Input validation
  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  removeFromTrie(globalTrie, keyword);
  res
    .status(200)
    .send({ success: true, message: 'Deleted from trie successfully' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
