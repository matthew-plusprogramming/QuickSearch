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
import {
  addToTrie,
  autocompleteFromTrie,
  removeFromTrie,
  searchTrie,
} from './trieUtility';
import cors from 'cors';
import express from 'express';

// Task queue
enum TrieOperation {
  Add,
  Autocomplete,
  Delete,
  Search,
  Display,
  Error,
}
let processingTasks = false;
let taskQueue: [
  TrieOperation,
  string,
  (params: { [key: string]: any }) => void,
][] = [];

const processTasks = () => {
  processingTasks = true;

  while (taskQueue.length > 0) {
    const nextTask = taskQueue.shift();
    const [taskOperation, taskKeyword, taskEndFunction] = nextTask ?? [
      TrieOperation.Error,
      'Task Queue Empty Error',
      () => {},
    ];

    switch (taskOperation) {
      case TrieOperation.Add:
        addToTrie(globalTrie, taskKeyword);
        taskEndFunction({});
        break;
      case TrieOperation.Autocomplete:
        const autocompleteSuggestions = autocompleteFromTrie(
          globalTrie,
          taskKeyword,
        );
        taskEndFunction({ autocompleteSuggestions });
        break;
      case TrieOperation.Delete:
        const { status, success, message } = removeFromTrie(
          globalTrie,
          taskKeyword,
        );
        taskEndFunction({ status, success, message });
        break;
      case TrieOperation.Search:
        const found = searchTrie(globalTrie, taskKeyword);
        taskEndFunction({ found });
        break;
      case TrieOperation.Display:
        taskEndFunction({});
        break;
    }
  }

  processingTasks = false;
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

app.post('/add', (req, res, next) => {
  console.log('Request to add received');
  const { keyword } = req.body;

  // Input validation
  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  taskQueue.push([
    TrieOperation.Add,
    keyword,
    () => {
      res
        .status(201)
        .send({ success: true, message: 'Added to trie successfully' });
    },
  ]);
  next();
});
app.get('/autocomplete', (req, res, next) => {
  console.log('Request to autocomplete received');
  const { keyword } = req.body;

  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  taskQueue.push([
    TrieOperation.Autocomplete,
    keyword,
    (params) => {
      const { autocompleteSuggestions } = params;
      res.status(200).send({
        success: true,
        message: 'Generated autocomplete suggestions successfully',
        suggestions: autocompleteSuggestions,
      });
    },
  ]);
  next();
});
app.delete('/delete', (req, res, next) => {
  console.log('Request to delete received');
  const { keyword } = req.body;

  // Input validation
  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  taskQueue.push([
    TrieOperation.Delete,
    keyword,
    (params) => {
      const { status, success, message } = params;
      res.status(status).send({ success, message });
    },
  ]);
  next();
});
app.get('/search', (req, res, next) => {
  console.log('Request to search received');
  const { keyword } = req.body;

  if (typeof keyword === 'undefined' || keyword === null) {
    res.status(400).send({ success: false, message: 'Must specify keyword' });
    return;
  }

  taskQueue.push([
    TrieOperation.Search,
    keyword,
    (params) => {
      const { found } = params;
      res.status(200).send({
        success: true,
        message: 'Searched trie successfully',
        found: found,
      });
    },
  ]);
  next();
});
app.get('/display', (_1: any, res, next) => {
  console.log('Request to display received');

  taskQueue.push([
    TrieOperation.Display,
    '',
    () => {
      res.status(200).send({
        success: true,
        message: 'Fetched trie successfully',
        trie: globalTrie,
      });
    },
  ]);
  next();
});

// Final middleware to check if there are tasks
app.use(() => {
  if (!processingTasks) processTasks();
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
