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

      describe('Chordsheet Formatter', function() {
        it('no chords', function() {
          var line = 'God above all the world in motion';
          expect(ChordPro.formatRaw(line)).toBe(line);
        });

        it('no lyrics', function() {
          var line = '[A] [F#m] [E] [D]';
          expect(ChordPro.formatRaw(line)).toBe('A F#m E D');
        });

        it('standard line', function() {
          var line = '[A]God [F#m]above all the [E]world in [D]motion';
          expect(ChordPro.formatRaw(line)).toBe(
            'A   F#m           E        D\n' +
            'God above all the world in motion'
          );
        });
      });

      describe('Parse Helpers', function() {
        it('parse directives type', function() {
          var expectedType = 'directive';
          expect(ChordPro.parseType('VERSE 2')).toBe(expectedType);
          expect(ChordPro.parseType('CHORUS B')).toBe(expectedType);
          expect(ChordPro.parseType('  BRIDGE X 4')).toBe(expectedType);
          expect(ChordPro.parseType('INTRO')).toBe(expectedType);
          expect(ChordPro.parseType('OUTRO')).toBe(expectedType);
          expect(ChordPro.parseType('INSTRUMENTAL')).toBe(expectedType);
          expect(ChordPro.parseType('[CHORUSx2]')).toBe(expectedType);
          expect(ChordPro.parseType('Chorus of one')).toBe('lyrics');
        });

        it('parse chords type', function() {
          var expectedType = 'chords';
          var notMatchedType = 'lyrics';
          expect(ChordPro.parseType('A')).toBe(expectedType);
          expect(ChordPro.parseType('(A)')).toBe(expectedType);
          expect(ChordPro.parseType('  C#m7  ')).toBe(expectedType);
          expect(ChordPro.parseType('  C#/G#  ')).toBe(expectedType);
          expect(ChordPro.parseType('  A13 Fsus Cdim7/Eb  C#m7/G#  ')).toBe(expectedType);
          expect(ChordPro.parseType('')).toBe(notMatchedType);
          expect(ChordPro.parseType('H')).toBe(notMatchedType);
          expect(ChordPro.parseType('A B CG D')).toBe(notMatchedType);
        });

        it('parse chords', function() {
          var chords = ChordPro.parseChords('  A13 Fsus Cdim7/Eb  C#m7/G#  ');
          expect(chords.length).toBe(4);
          expect(chords[0]).toEqual({ chord: 'A13', position: 2 });
          expect(chords[1]).toEqual({ chord: 'Fsus', position: 6 });
          expect(chords[2]).toEqual({ chord: 'Cdim7/Eb', position: 11 });
          expect(chords[3]).toEqual({ chord: 'C#m7/G#', position: 21 });
        });
      });

      describe('Chordsheet Parser', function() {
        it('parse directives and lyrics', function() {
          var song = ['BRIDGE X 6', 'The walls are falling down', '', 'CHORUS'].join('\n');
          var expected = ['{BRIDGE X 6}', 'The walls are falling down', '', '{CHORUS}'].join('\n');
          expect(ChordPro.parse(song)).toBe(expected);
        });

        it('parse chords only', function() {
          expect(ChordPro.parse('C    Am    Gsus    F')).toBe('[C]    [Am]    [Gsus]    [F]');
        });

        it('parse chords and lyrics', function() {
          var song = [
            '          C          G     D/F# Em',
            'Bless the Lord, O my soul, O my soul,'
          ].join('\n');
          var expected = 'Bless the [C]Lord, O my [G]soul, [D/F#]O my [Em]soul,';
          expect(ChordPro.parse(song)).toBe(expected);
        });

        it('parse longer chords than lyrics', function() {
          var song = [
            'C2            G              Dsus4 D  G     Gsus4    G',
            ' Ten thousand reasons for my heart to find.'
          ].join('\n');
          var expected = '[C2] Ten thousand [G]reasons for my [Dsus4]heart [D]to [G]find. [Gsus4]    [G]';
          expect(ChordPro.parse(song)).toBe(expected);
        });
      });

    });
  });
}());
