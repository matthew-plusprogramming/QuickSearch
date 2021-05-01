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
import { globalTrie } from './singletons';
import { addToTrie, removeFromTrie, searchTrie } from './trieUtility';
import cors from 'cors';
import express from 'express';

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

  const { status, success, message } = removeFromTrie(globalTrie, keyword);
  res.status(status).send({ success: success, message: message });
});
app.get('/search', (req, res) => {
  console.log('Request to search received');
  const { keyword } = req.body;

  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  const found = searchTrie(globalTrie, keyword);
  res.status(200).send({
    success: true,
    message: 'Searched trie successfully',
    found: found,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
