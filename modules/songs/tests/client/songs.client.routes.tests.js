(function () {
  'use strict';

  describe('Songs Route Tests', function () {
    // Initialize global variables
    var $scope,
      SongsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _SongsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      SongsService = _SongsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('songs');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/songs');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('songs.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/songs/client/views/list-songs.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          SongsController,
          mockSong;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('songs.view');
          $templateCache.put('/modules/songs/client/views/view-song.client.view.html', '');

          // create mock song
          mockSong = new SongsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'A Test Song',
            content: 'This is just a test'
          });

          // Initialize Controller
          SongsController = $controller('SongsController as vm', {
            $scope: $scope,
            songResolve: mockSong
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:songId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.songResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            songId: 1
          })).toEqual('/songs/1');
        }));

        it('should attach an song to the controller scope', function () {
          expect($scope.vm.song._id).toBe(mockSong._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/songs/client/views/view-song.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/songs/client/views/list-songs.client.view.html', '');

          $state.go('songs.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('songs/');
          $rootScope.$digest();

          expect($location.path()).toBe('/songs');
          expect($state.current.templateUrl).toBe('/modules/songs/client/views/list-songs.client.view.html');
        }));
      });
    });
  });
}());
