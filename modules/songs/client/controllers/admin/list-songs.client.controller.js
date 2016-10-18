(function () {
  'use strict';

  angular
    .module('songs.admin')
    .controller('SongsAdminListController', SongsAdminListController);

  SongsAdminListController.$inject = ['SongsService'];

  function SongsAdminListController(SongsService) {
    var vm = this;

    vm.songs = SongsService.query();
  }
}());
