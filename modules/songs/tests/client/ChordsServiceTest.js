(function () {
  'use strict';

  describe('Chords Service Tests', function () {
    // Initialize global variables
    var $scope,
      chords;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ChordsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      chords = _ChordsService_;
    }));

    describe('Chord Parser Unit Tests:', function() {

      describe('Method Modulate', function() {
        it('modulate up', function() {
          expect(chords.modulate('C', '+')).toBe('C#');
          expect(chords.modulate('Bb', '+')).toBe('B');
        });

        it('modulate down', function() {
          expect(chords.modulate('A', '-')).toBe('Ab');
          expect(chords.modulate('C#', '-')).toBe('C');
        });
      });

      describe('Method GetNote', function() {
        it('get normal note', function() {
          expect(chords.getNote('1', 'A')).toBe('A');
        });

        it('get sharp note', function() {
          expect(chords.getNote('7+', 'Em')).toBe('D#');
        });

        it('get flat note', function() {
          expect(chords.getNote('2-', 'E')).toBe('F');
        });
      });

      describe('Method ParseNote', function() {
        it('parse normal note', function() {
          expect(chords.parseNote('A', 'A')).toBe('1');
        });

        it('parse sharp note', function() {
          expect(chords.parseNote('D#', 'Em')).toBe('7+');
        });

        it('parse flat note', function() {
          expect(chords.parseNote('F', 'E')).toBe('2-');
        });
      });

      describe('Method Parse', function() {
        it('parse chord with root', function() {
          var actual = chords.parse('C', 'G');
          var expected = { root: '4', modifier: '', bass: '' };
          expect(actual).toEqual(expected);
        });

        it('parse chord with modifier', function() {
          var actual = chords.parse('Am7', 'G');
          var expected = { root: '2', modifier: 'm7', bass: '' };
          expect(actual).toEqual(expected);
        });

        it('parse chord with bass', function() {
          var actual = chords.parse('B7/D#', 'Em');
          var expected = { root: '5', modifier: '7', bass: '7+' };
          expect(actual).toEqual(expected);
        });
      });

      describe('Method Display', function() {
        it('display chord with root', function() {
          expect(chords.display({ root: '4', modifier: '', bass: '' }, 'G')).toBe('C');
        });

        it('display chord with modifier', function() {
          expect(chords.display({ root: '2', modifier: 'm7', bass: '' }, 'G')).toBe('Am7');
        });

        it('display chord with bass', function() {
          expect(chords.display({ root: '5', modifier: '7', bass: '7+' }, 'Em')).toBe('B7/D#');
        });
      });

      describe('Functional Tests', function() {
        it('parse then display should be equal', function() {
          var parser = chords.parser('A');
          var displayer = chords.displayer('A');
          var chord = 'F#m7';
          expect(displayer(parser(chord))).toBe(chord);
        });

        it('display then parse should be equal', function() {
          var parser = chords.parser('A');
          var displayer = chords.displayer('A');
          var chord = { root: '5', modifier: '7', bass: '7' };
          expect(parser(displayer(chord))).toEqual(chord);
        });
      });

    });
  });
}());
