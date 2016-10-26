(function () {
  'use strict';

  angular
    .module('songs.services')
    .factory('ChordProService', ChordProService);

  ChordProService.$inject = ['ChordsService'];

  function ChordProService(ChordsService) {

    function formatRaw(template) {
      return format(template, null, null, true);
    }

    // Format a ChordPro template
    function format(template, defaultKey, requestedKey, raw) {
      if (!template) {
        return '';
      }
      var chordregex = /\[([^\]]*)\]/;
      var buffer = [];
      var chordParser = (defaultKey && requestedKey && defaultKey !== requestedKey) ?
        ChordsService.parser(defaultKey) : null;

      template.split('\n').forEach(function(line) {
        // Directives
        if (line.match(/^{.*}/)) {
          return buffer.push(wrap(line.replace(/[{}]/g, ''), 'directive', raw));
        }
        if (!line.match(chordregex)) {
          return buffer.push(wrap(line, 'lyrics', raw));
        }
        var chords = '';
        var lyrics = '';
        var chordlen = 0;
        var chordpad = 0;
        line.split(chordregex).forEach(function(phrase, pos, arr) {
          if ((pos % 2) === 0) {
            // Lyrics
            lyrics += phrase;
            chordpad = phrase.length - chordlen;
            if (chordpad < 0 || chordpad < 1 && chordlen > 0) {
              var nextLyrics = arr[pos + 2];
              var addDashes = !raw && nextLyrics && nextLyrics.match(/^[a-z]/);
              lyrics += padding(1 - chordpad, addDashes);
              chordpad = 1;
            }
          } else {
            // Chords
            var original = phrase.replace(/[[]]/, '');
            var chord = chordParser ? ChordsService.display(chordParser(original), requestedKey) : original;
            chords += padding(chordpad) + chord;
            chordlen = chord.length;
          }
        });
        // Send lines if nonempty
        if (chords) buffer.push(wrap(chords, 'chords', raw));
        if (lyrics.trim().length > 0) buffer.push(wrap(lyrics, 'lyrics', raw));
      });

      return buffer.join('\n');
    }

    function padding(length, withDashes) {
      if (!withDashes || length < 3) {
        // replacement for ' '.repeat(length)
        return Array(1 + length).join(' ');
      }
      var result = '';
      for (var i = 0; i < length; i++) {
        result += (withDashes && i % 2 === 1) ? '-' : ' ';
      }
      return result;
    }

    function wrap(text, cls, raw) {
      return raw ? text : '<span class="' + cls + '">' + text + '</span>';
    }

    // Parse text as a ChordPro template
    function parse(text) {
      if (!text) {
        return '';
      }
      var buffer = [];
      var skip = false;

      text.split('\n').forEach(function(line, index, arr) {
        if (skip) {
          skip = false;
          return;
        }
        switch (parseType(line)) {
          case 'directive':
            return buffer.push('{' + line.trim() + '}');
          case 'chords':
            var chords = parseChords(line);
            var chordLine = '';
            var nextLine = arr[index + 1];
            var lastChord = { chord: '', position: 0 };
            if (nextLine && nextLine.trim().length > 0 && parseType(nextLine) === 'lyrics') {
              // merge lines
              var lineLength = nextLine.length;
              var i = 0;
              chords.forEach(function(chord) {
                if (i < lineLength) {
                  while (i < chord.position) {
                    chordLine += i < lineLength ? nextLine[i] : ' ';
                    i++;
                  }
                } else {
                  chordLine += padding(chord.position - lastChord.position - lastChord.chord.length);
                }
                chordLine += '[' + chord.chord + ']';
                lastChord = chord;
              });
              if (i < lineLength) {
                chordLine += nextLine.substring(i);
              }
              skip = true;
            } else {
              // just push chords
              chords.forEach(function(chord) {
                chordLine += padding(chord.position - lastChord.position - lastChord.chord.length);
                chordLine += '[' + chord.chord + ']';
                lastChord = chord;
              });
            }
            return buffer.push(chordLine);
          case 'lyrics':
            return buffer.push(line);
          default:
            throw new Error('parse error on line: ' + line);
        }
      });

      return buffer.join('\n');
    }

    function parseType(line) {
      var directives = ['INTRO', 'VERSE', 'PRECHORUS', 'CHORUS', 'INSTRUMENTAL', 'BRIDGE', 'OUTRO', 'TAG'];
      var directiveRegex = new RegExp('^\\s*\\[?(' + directives.join('|') + ')');

      var chordRegex = /(?:\b|\()[A-G](?:##?|bb?)?[Ma-z]{0,3}[0-9]{0,2}(?:\/[A-G](?:##?|bb?)?)?\)?/;
      var chordsRegex = new RegExp('^\\s*(?:' + chordRegex.source + '\\s*)+$');

      if (line.match(directiveRegex) !== null) {
        return 'directive';
      } else if (line.match(chordsRegex)) {
        return 'chords';
      } else {
        return 'lyrics';
      }
    }

    // precondition: parseType(line) === 'chords'
    function parseChords(line) {
      var chordRegex = /(?:\b|\()[A-G](?:##?|bb?)?[Ma-z]{0,3}[0-9]{0,2}(?:\/[A-G](?:##?|bb?)?)?\)?/g;
      var result = [];
      var match = chordRegex.exec(line);
      if (match === null) {
        throw new Error('No chords found in line: ' + line);
      }
      while (match !== null) {
        result.push({
          chord: match[0],
          position: match.index
        });
        match = chordRegex.exec(line);
      }
      return result;
    }

    return {
      // public methods
      format: format,
      formatRaw: formatRaw,
      parse: parse,

      // visible for testing
      parseType: parseType,
      parseChords: parseChords
    };
  }
}());
