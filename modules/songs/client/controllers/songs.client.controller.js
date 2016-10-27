(function () {
  'use strict';

  angular
    .module('songs')
    .controller('SongsController', SongsController);

  SongsController.$inject = ['$scope', 'songResolve', 'ChordsService', 'ChordProService', 'Authentication'];

  function SongsController($scope, song, chords, chordpro, Authentication) {
    var vm = this;

    vm.song = song;
    vm.key = song.defaultKey;
    vm.chordpro = chordpro;
    vm.authentication = Authentication;
    vm.isAdmin = isAdmin;
    vm.keys = chords.keys();
    vm.mode = chords.mode;
    vm.transposeDown = transposeDown;
    vm.transposeUp = transposeUp;

    function isAdmin() {
      var user = Authentication.user;
      return user && user.roles.includes('admin');
    }

    function transposeUp() {
      vm.key = chords.transposeKey(vm.key, 1);
    }

    function transposeDown() {
      vm.key = chords.transposeKey(vm.key, -1);
    }

  }
}());
