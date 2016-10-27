(function () {
  'use strict';

  angular
    .module('songs')
    .controller('SongsEditController', SongsEditController);

  SongsEditController.$inject = [
    '$scope', '$state', '$window', 'songResolve',
    'ChordsService', 'ChordProService', 'Authentication', 'Notification'
  ];

  function SongsEditController($scope, $state, $window, song, chords, chordpro, Authentication, Notification) {
    var vm = this;

    vm.song = song;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.keys = chords.keys();
    vm.mode = chords.mode;
    vm.chordpro = chordpro;
    vm.formatPreview = formatPreview;
    vm.parsePreview = parsePreview;
    vm.preview = null;

    function formatPreview() {
      vm.preview = vm.song.content ? chordpro.formatRaw(vm.song.content) : '';
    }
    function parsePreview() {
      vm.song.content = vm.preview ? chordpro.parse(vm.preview) : vm.song.content;
      vm.preview = null;
    }

    // Remove existing Song
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.song.$remove(function() {
          $state.go('songs.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Song deleted successfully!' });
        });
      }
    }

    // Save Song
    function save(isValid) {
      if (vm.preview) {
        parsePreview();
      }
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.songForm');
        return false;
      }

      // Create a new song, or update the current instance
      vm.song.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('songs.list'); // should we send the User to the list or the updated Song's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Song saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Song save error!' });
      }
    }
  }
}());
