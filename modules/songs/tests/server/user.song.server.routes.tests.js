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
describe('Song User CRUD tests', function () {

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

  it('users should be able to create a song', function (done) {
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

  it('should not be able to save a song if no title is provided', function (done) {
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

  it('users should be able to get a single song and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
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

  it('users should be able to update a song they created', function (done) {
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

  it('users should be able to delete a song they created', function (done) {
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

  it('users should be able to get single song, that a different user created, & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'songowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Song
    var _songOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['user']
    });

    _songOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Song
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new song
          agent.post('/api/songs')
            .send(song)
            .expect(200)
            .end(function (songSaveErr, songSaveRes) {
              // Handle song save error
              if (songSaveErr) {
                return done(songSaveErr);
              }

              // Set assertions on new song
              (songSaveRes.body.title).should.equal(song.title);
              should.exist(songSaveRes.body.user);
              should.equal(songSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (songInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  it('users should not be able to update a song that a different user created', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'songowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Song
    var _songOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['user']
    });

    _songOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Song
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new song
          agent.post('/api/songs')
            .send(song)
            .expect(200)
            .end(function (songSaveErr, songSaveRes) {
              // Handle song save error
              if (songSaveErr) {
                return done(songSaveErr);
              }

              // Set assertions on new song
              (songSaveRes.body.title).should.equal(song.title);
              should.exist(songSaveRes.body.user);
              should.equal(songSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Try updating song
                  song.title = 'New Title';
                  request(app).put('/api/songs/' + songSaveRes.body._id)
                    .send(song)
                    .expect(403)
                    .end(function (songUpdateErr, songUpdateRes) {
                      // Set message assertion
                      (songUpdateRes.body.message).should.match('User is not authorized');

                      // Handle song error error
                      done(songUpdateErr);
                    });
                });
            });
        });
    });
  });

  it('users should not be able to delete a song that a different user created', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'songowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Song
    var _songOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['user']
    });

    _songOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Song
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new song
          agent.post('/api/songs')
            .send(song)
            .expect(200)
            .end(function (songSaveErr, songSaveRes) {
              // Handle song save error
              if (songSaveErr) {
                return done(songSaveErr);
              }

              // Set assertions on new song
              (songSaveRes.body.title).should.equal(song.title);
              should.exist(songSaveRes.body.user);
              should.equal(songSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Try deleting song
                  request(app).delete('/api/songs/' + songSaveRes.body._id)
                    .expect(403)
                    .end(function (songDeleteErr, songDeleteRes) {
                      // Set message assertion
                      (songDeleteRes.body.message).should.match('User is not authorized');

                      // Handle song error error
                      done(songDeleteErr);
                    });
                });
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
