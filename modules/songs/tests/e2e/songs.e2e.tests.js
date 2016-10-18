'use strict';

describe('Songs E2E Tests:', function () {
  describe('Test songs page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/songs');
      expect(element.all(by.repeater('song in songs')).count()).toEqual(0);
    });
  });
});
