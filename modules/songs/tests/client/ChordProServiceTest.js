(function () {
  'use strict';

  describe('Chordpro Service Tests', function () {
    // Initialize global variables
    var $scope,
      ChordPro;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ChordProService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ChordPro = _ChordProService_;
    }));

    describe('Chordpro Unit Tests:', function() {

      describe('Text Formatter', function() {
        it('no chords', function() {
          var line = 'God above all the world in motion';
          expect(ChordPro.format(line, 'A', 'A', true)).toBe(line);
        });

        it('no lyrics', function() {
          var line = '[A] [F#m] [E] [D]';
          expect(ChordPro.format(line, 'A', 'A', true)).toBe('A F#m E D');
        });

        it('standard line', function() {
          var line = '[A]God [F#m]above all the [E]world in [D]motion';
          expect(ChordPro.format(line, 'A', 'A', true)).toBe(
            'A   F#m           E        D\n' +
            'God above all the world in motion'
          );
        });
      });

    });
  });
}());
