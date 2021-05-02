# QuickSearch 🔎
QuickSearch is a publicly accessible autocomplete and trie server.

It is written in Node and TypeScript, using [the Express web framework](https://expressjs.com/).

This server uses a simple flatfile db for data persistance between instances.

For usage, install [the cli](#cli-installation).

## Server Installation
Clone the repository, then run the following commands in the server directoryto get started
```bash
$ npm install
```


```bash
# To run
$ npx tsc
$ node dist/index.js

# To develop
$ npm run dev
```

## CLI Installation
Use the node package manager (npm) to install quicksearch-cli
```
npm install quicksearch-cli
```
