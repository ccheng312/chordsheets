(function () {
  'use strict';

  angular
    .module('songs')
    .controller('SongsController', SongsController);

  SongsController.$inject = ['$scope', 'songResolve', 'Authentication'];

  function SongsController($scope, song, Authentication) {
    var vm = this;

    vm.song = song;
    vm.authentication = Authentication;

  }
}());
