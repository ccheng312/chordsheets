(function () {
  'use strict';

  angular
    .module('songs.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('songs', {
        abstract: true,
        url: '/songs',
        template: '<ui-view/>'
      })
      .state('songs.list', {
        url: '',
        templateUrl: '/modules/songs/client/views/list-songs.client.view.html',
        controller: 'SongsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Songs List'
        }
      })
      .state('songs.view', {
        url: '/:songId',
        templateUrl: '/modules/songs/client/views/view-song.client.view.html',
        controller: 'SongsController',
        controllerAs: 'vm',
        resolve: {
          songResolve: getSong
        },
        data: {
          pageTitle: 'Song {{ songResolve.title }}'
        }
      });
  }

  getSong.$inject = ['$stateParams', 'SongsService'];

  function getSong($stateParams, SongsService) {
    return SongsService.get({
      songId: $stateParams.songId
    }).$promise;
  }
}());
