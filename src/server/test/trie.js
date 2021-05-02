const axios = require('axios').default;
const expect = require('chai').expect;

const serverURL = 'http://localhost:3000';

// Debug port is 3000, production port is 80
describe('Trie', () => {
  describe('Adding to trie', () => {
    const addURL = `${serverURL}/add`;

    it('Returns status 201 on good request', async () => {
      await axios.post(addURL, { keyword: 'tes' });
      await axios.post(addURL, { keyword: 'test2' });
      const res = await axios.post(addURL, { keyword: 'test' });
      expect(res.status).to.equal(201);
    });
    it('Returns status 400 on bad request', async () => {
      try {
        await axios.post(addURL);
      } catch (e) {
        const { response: res } = e;
        expect(res.status).to.equal(400);
      }
    });
  });
  describe('Removing from trie', () => {
    const removeURL = `${serverURL}/delete`;

    it('Returns status 200 on good request', async () => {
      const res = await axios.delete(removeURL, { data: { keyword: 'test' } });
      expect(res.status).to.equal(200);
    });
    it('Returns status 404 on duplicate requests', async () => {
      try {
        const res = await axios.delete(removeURL, {
          data: { keyword: 'test' },
        });
      } catch (e) {
        const { response: res } = e;
        expect(res.status).to.equal(404);
      }
    });
    it('Returns status 400 on bad request', async () => {
      try {
        await axios.delete(removeURL, { keyword: null });
      } catch (e) {
        const { response: res } = e;
        expect(res.status).to.equal(400);
      }
    });
  });
  describe('Searching trie', () => {
    const searchURL = `${serverURL}/search`;

    it('Returns status 200 on good request', async () => {
      const res = await axios.get(searchURL, { data: { keyword: 'test' } });
      expect(res.status).to.equal(200);
    });
    it('Returns found if keyword found', async () => {
      const res = await axios.get(searchURL, { data: { keyword: 'test2' } });
      expect(res.data.found).to.equal(true);
    });
    it('Returns not found if keyword not found', async () => {
      const res = await axios.get(searchURL, { data: { keyword: 'test' } });
      expect(res.data.found).to.equal(false);
    });
    it('Returns status 400 on bad request', async () => {
      try {
        await axios.get(searchURL);
      } catch (e) {
        const { response: res } = e;
        expect(res.status).to.equal(400);
      }
    });
  });
  describe('Returning autocomplete suggestions from trie', () => {
    const autocompleteURL = `${serverURL}/autocomplete`;

    it('Returns status 200 on good request', async () => {
      const res = await axios.get(autocompleteURL, {
        data: { keyword: 'test' },
      });
      expect(res.status).to.equal(200);
    });
    it('Returns 1 suggestion', async () => {
      const res = await axios.get(autocompleteURL, {
        data: { keyword: 'test' },
      });
      expect(res.data.suggestions.length).to.equal(1);
    });
    it('Returns 2 suggestions', async () => {
      const res = await axios.get(autocompleteURL, { data: { keyword: 'te' } });
      expect(res.data.suggestions.length).to.equal(2);
    });
    it('Returns 0 suggestions', async () => {
      const res = await axios.get(autocompleteURL, {
        data: { keyword: 'nomatch' },
      });
      expect(res.data.suggestions.length).to.equal(0);
    });
    it('Returns status 400 on bad request', async () => {
      try {
        await axios.get(autocompleteURL);
      } catch (e) {
        const { response: res } = e;
        expect(res.status).to.equal(400);
      }
    });
  });
  describe('Displaying trie', () => {
    const displayURL = `${serverURL}/display`;

    it('Returns status 200 on good request', async () => {
      const res = await axios.get(displayURL);
      expect(res.status).to.equal(200);
    });
    it('Returns trie', async () => {
      const res = await axios.get(displayURL);
      expect(Object.keys(res.data.trie).length).to.be.above(0);
    });
    it('Returns empty trie', async () => {
      await axios.delete(`${serverURL}/delete`, { data: { keyword: 'tes' } });
      await axios.delete(`${serverURL}/delete`, { data: { keyword: 'test2' } });
      const res = await axios.get(displayURL);
      expect(Object.keys(res.data.trie).length).to.equal(0);
    });
  });
});
