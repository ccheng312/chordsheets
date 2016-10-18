'use strict';

/**
 * Module dependencies
 */
var songsPolicy = require('../policies/songs.server.policy'),
  songs = require('../controllers/songs.server.controller');

module.exports = function (app) {
  // Songs collection routes
  app.route('/api/songs').all(songsPolicy.isAllowed)
    .get(songs.list)
    .post(songs.create);

  // Single song routes
  app.route('/api/songs/:songId').all(songsPolicy.isAllowed)
    .get(songs.read)
    .put(songs.update)
    .delete(songs.delete);

  // Finish by binding the song middleware
  app.param('songId', songs.songByID);
};
