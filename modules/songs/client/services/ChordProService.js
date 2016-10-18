(function () {
  'use strict';

  angular
    .module('songs.services')
    .factory('ChordProService', ChordProService);

  ChordProService.$inject = ['ChordsService'];

  function ChordProService(ChordsService) {

    // Format a ChordPro template
    function format(template, defaultKey, requestedKey, raw) {
      if (!template) {
        return;
      }
      var chordregex = /\[([^\]]*)\]/;
      var buffer = [];
      var chordParser = ChordsService.parser(defaultKey);

      template.split('\n').forEach(function(line, linenum) {
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
              var addDashes = nextLyrics && nextLyrics.match(/^[a-z]/);
              lyrics += padding(1 - chordpad, addDashes);
              chordpad = 1;
            }
          } else {
            // Chords
            var original = phrase.replace(/[[]]/, '');
            var chord = ChordsService.display(chordParser(original), requestedKey);
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

    return {
      format: format
    };
  }
}());
