(function () {
  'use strict';

  angular
    .module('songs')
    .controller('SongsListController', SongsListController);

  SongsListController.$inject = ['SongsService'];

  function SongsListController(SongsService) {
    var vm = this;

    vm.songs = SongsService.query();
  }
}());
