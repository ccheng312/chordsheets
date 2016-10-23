'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Song = mongoose.model('Song'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  song;

/**
 * Song routes tests
 */
describe('Song Admin CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      roles: ['user', 'admin'],
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new song
    user.save(function () {
      song = {
        title: 'Song Title',
        defaultKey: 'A',
        content: 'Song Content'
      };

      done();
    });
  });

  it('should be able to save an song if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new song
        agent.post('/api/songs')
          .send(song)
          .expect(200)
          .end(function (songSaveErr, songSaveRes) {
            // Handle song save error
            if (songSaveErr) {
              return done(songSaveErr);
            }

            // Get a list of songs
            agent.get('/api/songs')
              .end(function (songsGetErr, songsGetRes) {
                // Handle song save error
                if (songsGetErr) {
                  return done(songsGetErr);
                }

                // Get songs list
                var songs = songsGetRes.body;

                // Set assertions
                (songs[0].user._id).should.equal(userId);
                (songs[0].title).should.match('Song Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an song if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new song
        agent.post('/api/songs')
          .send(song)
          .expect(200)
          .end(function (songSaveErr, songSaveRes) {
            // Handle song save error
            if (songSaveErr) {
              return done(songSaveErr);
            }

            // Update song title
            song.title = 'New Title';

            // Update an existing song
            agent.put('/api/songs/' + songSaveRes.body._id)
              .send(song)
              .expect(200)
              .end(function (songUpdateErr, songUpdateRes) {
                // Handle song update error
                if (songUpdateErr) {
                  return done(songUpdateErr);
                }

                // Set assertions
                (songUpdateRes.body._id).should.equal(songSaveRes.body._id);
                (songUpdateRes.body.title).should.match('New Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an song if no title is provided', function (done) {
    // Invalidate title field
    song.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new song
        agent.post('/api/songs')
          .send(song)
          .expect(422)
          .end(function (songSaveErr, songSaveRes) {
            // Set message assertion
            (songSaveRes.body.message).should.match('Title cannot be blank');

            // Handle song save error
            done(songSaveErr);
          });
      });
  });

  it('should be able to delete an song if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new song
        agent.post('/api/songs')
          .send(song)
          .expect(200)
          .end(function (songSaveErr, songSaveRes) {
            // Handle song save error
            if (songSaveErr) {
              return done(songSaveErr);
            }

            // Delete an existing song
            agent.delete('/api/songs/' + songSaveRes.body._id)
              .send(song)
              .expect(200)
              .end(function (songDeleteErr, songDeleteRes) {
                // Handle song error error
                if (songDeleteErr) {
                  return done(songDeleteErr);
                }

                // Set assertions
                (songDeleteRes.body._id).should.equal(songSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single song if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new song model instance
    song.user = user;
    var songObj = new Song(song);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new song
        agent.post('/api/songs')
          .send(song)
          .expect(200)
          .end(function (songSaveErr, songSaveRes) {
            // Handle song save error
            if (songSaveErr) {
              return done(songSaveErr);
            }

            // Get the song
            agent.get('/api/songs/' + songSaveRes.body._id)
              .expect(200)
              .end(function (songInfoErr, songInfoRes) {
                // Handle song error
                if (songInfoErr) {
                  return done(songInfoErr);
                }

                // Set assertions
                (songInfoRes.body._id).should.equal(songSaveRes.body._id);
                (songInfoRes.body.title).should.equal(song.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (songInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Song.remove().exec(done);
    });
  });
});
