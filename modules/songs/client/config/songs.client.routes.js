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
      .state('songs.create', {
        url: '/create',
        templateUrl: '/modules/songs/client/views/form-song.client.view.html',
        controller: 'SongsEditController',
        controllerAs: 'vm',
        data: {
          roles: ['user']
        },
        resolve: {
          songResolve: newSong
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
      })
      .state('songs.edit', {
        url: '/:songId/edit',
        templateUrl: '/modules/songs/client/views/form-song.client.view.html',
        controller: 'SongsEditController',
        controllerAs: 'vm',
        data: {
          roles: ['user']
        },
        resolve: {
          songResolve: getSong
        }
      })
      .state('songs.copy', {
        url: '/:songId/copy',
        templateUrl: '/modules/songs/client/views/form-song.client.view.html',
        controller: 'SongsEditController',
        controllerAs: 'vm',
        data: {
          roles: ['user']
        },
        resolve: {
          songResolve: copySong
        }
      });
  }

  newSong.$inject = ['SongsService'];

  function newSong(SongsService) {
    return new SongsService();
  }

  getSong.$inject = ['$stateParams', 'SongsService'];

  function getSong($stateParams, SongsService) {
    return SongsService.get({
      songId: $stateParams.songId
    }).$promise;
  }

  copySong.$inject = ['$stateParams', 'SongsService', 'Authentication'];

  function copySong($stateParams, SongsService, Authentication) {
    return SongsService.get({
      songId: $stateParams.songId
    }).$promise.then(function(song) {
      song._id = null;
      song.title += ' (' + Authentication.user.username + ')';
      return song.$promise;
    });
  }

}());
