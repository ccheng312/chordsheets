(function () {
  'use strict';

  angular
    .module('songs.services')
    .factory('SongsService', SongsService);

  SongsService.$inject = ['$resource', '$log'];

  function SongsService($resource, $log) {
    var Song = $resource('/api/songs/:songId', {
      songId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Song.prototype, {
      createOrUpdate: function () {
        var song = this;
        return createOrUpdate(song);
      }
    });

    return Song;

    function createOrUpdate(song) {
      if (song._id) {
        return song.$update(onSuccess, onError);
      } else {
        return song.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(song) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
