(function () {
  'use strict';

  // Configuring the Songs Admin module
  angular
    .module('songs.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Songs',
      state: 'admin.songs.list'
    });
  }
}());
