(function () {
  'use strict';

  angular
    .module('songs.services')
    .factory('ChordsService', ChordsService);

  function ChordsService() {
    var _keys = {
      'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'Am': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],

      'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
      'Bbm': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'],

      'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
      'Bm': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],

      'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
      'Cm': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],

      'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
      'C#m': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],

      'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
      'Dm': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],

      'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
      'D#m': ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'],
      'Gb': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
      'Ebm': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'],

      'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      'Em': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],

      'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
      'Fm': ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],

      'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
      'F#m': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],

      'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
      'Gm': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],

      'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
      'G#m': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#']
    };

    function modulate(note, plusOrMinus) {
      if (plusOrMinus === '+') {
        if (note[1] === 'b') {
          return note[0];
        } else {
          return note + '#';
        }
      } else if (plusOrMinus === '-') {
        if (note[1] === '#') {
          return note[0];
        } else {
          return note + 'b';
        }
      }
    }

    function getNote(root, key) {
      var note = _keys[key][parseInt(root[0], 10) - 1];
      if (root.length > 1) {
        note = modulate(note, root[1]);
      }
      return note;
    }

    function parseNote(note, key) {
      var notes = _keys[key];
      var root = notes.indexOf(note);
      if (root > -1) {
        return (root + 1).toString();
      }
      root = notes.indexOf(modulate(note, '-'));
      if (root > -1) {
        return (root + 1).toString() + '+';
      }
      root = notes.indexOf(modulate(note, '+'));
      if (root > -1) {
        return (root + 1).toString() + '-';
      }
      throw new Error('Could not parse ' + note);
    }

    function parse(str, key) {
      var re = /^([A-G][#b]?)([\w]*)(\/[A-G][#b]?)?$/;
      var matches = str.match(re);
      return {
        root: parseNote(matches[1], key),
        modifier: matches[2],
        bass: (matches[3] && parseNote(matches[3].slice(1), key)) || ''
      };
    }

    function display(chord, key) {
      var note = getNote(chord.root, key);
      var modifier = chord.modifier || '';
      var bass = '';
      if (chord.bass) {
        bass = '/' + getNote(chord.bass, key);
      }
      return note + modifier + bass;
    }

    function keys() {
      return ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
              'Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'];
    }

    function mode(key) {
      return key.indexOf('m') > -1 ? 'Minor' : 'Major';
    }

    return {
      displayer: function(key) {
        return function(chord) {
          return display(chord, key);
        };
      },
      parser: function(key) {
        return function(chord) {
          return parse(chord, key);
        };
      },
      display: display,
      parse: parse,

      // For populating key select elements
      keys: keys,
      mode: mode,

      // helper methods, exposed for testing
      getNote: getNote,
      parseNote: parseNote,
      modulate: modulate
    };
  }

}());
