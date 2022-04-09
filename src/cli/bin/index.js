#!/usr/bin/env node

const axios = require('axios').default;
const yargs = require('yargs');

const SERVER_URL = 'http://18.217.159.242';

// Construct the phrase potentially with spaces
const constructPhrase = (argv) => {
  let extraWords = [];
  if (argv._.length > 1) {
    extraWords = [...argv._];
    extraWords.shift();
  }

  const toReturn =
    argv.phrase +
    (extraWords.length === 0
      ? ''
      : ` ${extraWords.reduce(
          (runningString, currentString) => `${runningString} ${currentString}`,
        )}`);

  return toReturn;
};

// Usage options
yargs
  .usage('Usage: [a <phrase> | r <phrase> | s <phrase> | c <phrase> | d]')
  .command({
    command: 'add <phrase>',
    aliases: ['a'],
    desc: 'Add a phrase to trie',
    handler: async (argv) => {
      const phraseToAdd = constructPhrase(argv);
      try {
        const { status, data } = await axios.post(`${SERVER_URL}/add`, {
          keyword: phraseToAdd,
        });
        console.log(`Status: ${status}\nMessage: ${data.message}`);
      } catch (e) {
        const { response } = e;
        const { data } = response;
        console.log(`Status: ${response.status}\nMessage: ${data.message}`);
      }
    },
  })
  .command({
    command: 'remove <phrase>',
    aliases: ['r'],
    desc: 'Remove a phrase from trie',
    handler: async (argv) => {
      const phraseToRemove = constructPhrase(argv);
      try {
        const { status, data } = await axios.delete(`${SERVER_URL}/delete`, {
          data: {
            keyword: phraseToRemove,
          },
        });
        console.log(`Status: ${status}\nMessage: ${data.message}`);
      } catch (e) {
        const { response } = e;
        const { data } = response;
        console.log(`Status: ${response.status}\nMessage: ${data.message}`);
      }
    },
  })
  .command({
    command: 'search <phrase>',
    aliases: ['s'],
    desc: 'Search for a phrase in trie',
    handler: async (argv) => {
      const phraseToSearch = constructPhrase(argv);
      try {
        const { status, data } = await axios.get(`${SERVER_URL}/search`, {
          data: {
            keyword: phraseToSearch,
          },
        });
        console.log(
          `Status: ${status}\nMessage: ${data.message}\nFound: ${data.found}`,
        );
      } catch (e) {
        const { response } = e;
        const { data } = response;
        console.log(`Status: ${response.status}\nMessage: ${data.message}`);
      }
    },
  })
  .command({
    command: 'autocomplete <phrase>',
    aliases: ['c'],
    desc: 'Generate autocomplete suggestions',
    handler: async (argv) => {
      const phraseToAutocomplete = constructPhrase(argv);
      try {
        const { status, data } = await axios.get(`${SERVER_URL}/autocomplete`, {
          data: {
            keyword: phraseToAutocomplete,
          },
        });
        console.log(
          `Status: ${status}\nMessage: ${data.message}\nAutocompletions:`,
        );
        for (let i = 0; i < data.suggestions.length; ++i) {
          console.log(data.suggestions[i]);
        }
      } catch (e) {
        const { response } = e;
        const { data } = response;
        console.log(`Status: ${response.status}\nMessage: ${data.message}`);
      }
    },
  })
  .command({
    command: 'display',
    aliases: ['d'],
    desc: 'Display trie in JSON format',
    handler: async () => {
      const { status, data } = await axios.get(`${SERVER_URL}/display`);
      console.log(`Status: ${status}\nMessage: ${data.message}\nTrie:`);
      console.log(JSON.stringify(data.trie, null, 2));
    },
  })
  .demandCommand(
    1,
    1,
    'You need at least one command',
    'You can only run one command at a time',
  )
  .help().argv;
