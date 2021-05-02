import { saveToDatabase } from './dbInterface';
import { globalTrie } from './singletons';
import { Trie } from './typedefs';

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

const searchTrieSolutions: (
  trie: Trie,
  currentPhrase: string,
  runningArray: string[],
) => string[] = (trie, currentPhrase, runningArray) => {
  if (trie['**'] === true) {
    runningArray.push(currentPhrase);
  }

  // Perform a depth first search and find all items
  Object.keys(trie).forEach((key) => {
    searchTrieSolutions(trie[key] as Trie, currentPhrase + key, runningArray);
  });

  return runningArray;
};
const autocompleteFromTrie: (
  trie: Trie,
  phraseToAutocomplete: string,
) => string[] = (trie, phraseToAutocomplete) => {
  let currentTrie = trie;

  for (
    let characterIndex = 0;
    characterIndex < phraseToAutocomplete.length;
    ++characterIndex
  ) {
    // Check if character is present in trie
    const currentCharacter = phraseToAutocomplete[characterIndex];
    if (
      typeof currentTrie[currentCharacter] === 'undefined' ||
      currentTrie[currentCharacter] === null
    ) {
      return [];
    }
    currentTrie = currentTrie[currentCharacter] as Trie;
  }

  const autocompleteSuggestions: string[] = [];
  // Return alphabetized
  return searchTrieSolutions(
    currentTrie,
    phraseToAutocomplete,
    autocompleteSuggestions,
  ).sort();
};

const removeFromTrie: (
  trie: Trie,
  phraseToRemove: string,
) => { status: number; success: boolean; message: string } = (
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
      return { status: 404, success: false, message: 'Not found' };
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
  return {
    status: 200,
    success: true,
    message: 'Deleted from trie successfully',
  };
};

const searchTrie: (trie: Trie, phraseToSearchFor: string) => boolean = (
  trie,
  phraseToSearchFor,
) => {
  let currentTrie = trie;
  for (
    let characterIndex = 0;
    characterIndex < phraseToSearchFor.length;
    ++characterIndex
  ) {
    // Check if character is present in trie
    const currentCharacter = phraseToSearchFor[characterIndex];
    if (
      typeof currentTrie[currentCharacter] === 'undefined' ||
      currentTrie[currentCharacter] === null
    ) {
      return false;
    }
    currentTrie = currentTrie[currentCharacter] as Trie;
  }

  return currentTrie['**'] === true;
};

export { addToTrie, autocompleteFromTrie, removeFromTrie, searchTrie };
