(function (app) {
  'use strict';

  // The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('songs', ['core', 'ngSanitize']);
  app.registerModule('songs.services');
  app.registerModule('songs.routes', ['ui.router', 'core.routes', 'songs.services']);
}(ApplicationConfiguration));
