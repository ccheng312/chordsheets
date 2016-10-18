(function (app) {
  'use strict';

  app.registerModule('songs', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('songs.admin', ['core.admin']);
  app.registerModule('songs.admin.routes', ['core.admin.routes']);
  app.registerModule('songs.services');
  app.registerModule('songs.routes', ['ui.router', 'core.routes', 'songs.services']);
}(ApplicationConfiguration));
