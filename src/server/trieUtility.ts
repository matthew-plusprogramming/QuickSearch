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

export { addToTrie, removeFromTrie };
