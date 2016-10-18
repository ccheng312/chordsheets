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
    vm.keys = chords.keys();
    vm.mode = chords.mode;
  }
}());
