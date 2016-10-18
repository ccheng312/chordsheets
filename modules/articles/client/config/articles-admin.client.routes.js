(function () {
  'use strict';

  angular
    .module('songs.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.songs', {
        abstract: true,
        url: '/songs',
        template: '<ui-view/>'
      })
      .state('admin.songs.list', {
        url: '',
        templateUrl: '/modules/songs/client/views/admin/list-songs.client.view.html',
        controller: 'SongsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.songs.create', {
        url: '/create',
        templateUrl: '/modules/songs/client/views/admin/form-song.client.view.html',
        controller: 'SongsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          songResolve: newSong
        }
      })
      .state('admin.songs.edit', {
        url: '/:songId/edit',
        templateUrl: '/modules/songs/client/views/admin/form-song.client.view.html',
        controller: 'SongsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          songResolve: getSong
        }
      });
  }

  getSong.$inject = ['$stateParams', 'SongsService'];

  function getSong($stateParams, SongsService) {
    return SongsService.get({
      songId: $stateParams.songId
    }).$promise;
  }

  newSong.$inject = ['SongsService'];

  function newSong(SongsService) {
    return new SongsService();
  }
}());
