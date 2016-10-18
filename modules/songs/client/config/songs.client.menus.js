(function () {
  'use strict';

  angular
    .module('songs')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Songs',
      state: 'songs',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'songs', {
      title: 'List Songs',
      state: 'songs.list',
      roles: ['*']
    });
  }
}());
