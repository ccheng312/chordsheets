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
describe('Song CRUD tests', function () {

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
        content: 'Song Content'
      };

      done();
    });
  });

  it('should not be able to save an song if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/songs')
          .send(song)
          .expect(403)
          .end(function (songSaveErr, songSaveRes) {
            // Call the assertion callback
            done(songSaveErr);
          });

      });
  });

  it('should not be able to save an song if not logged in', function (done) {
    agent.post('/api/songs')
      .send(song)
      .expect(403)
      .end(function (songSaveErr, songSaveRes) {
        // Call the assertion callback
        done(songSaveErr);
      });
  });

  it('should not be able to update an song if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/songs')
          .send(song)
          .expect(403)
          .end(function (songSaveErr, songSaveRes) {
            // Call the assertion callback
            done(songSaveErr);
          });
      });
  });

  it('should be able to get a list of songs if not signed in', function (done) {
    // Create new song model instance
    var songObj = new Song(song);

    // Save the song
    songObj.save(function () {
      // Request songs
      request(app).get('/api/songs')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single song if not signed in', function (done) {
    // Create new song model instance
    var songObj = new Song(song);

    // Save the song
    songObj.save(function () {
      request(app).get('/api/songs/' + songObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', song.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single song with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/songs/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Song is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single song which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent song
    request(app).get('/api/songs/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No song with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an song if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/songs')
          .send(song)
          .expect(403)
          .end(function (songSaveErr, songSaveRes) {
            // Call the assertion callback
            done(songSaveErr);
          });
      });
  });

  it('should not be able to delete an song if not signed in', function (done) {
    // Set song user
    song.user = user;

    // Create new song model instance
    var songObj = new Song(song);

    // Save the song
    songObj.save(function () {
      // Try deleting song
      request(app).delete('/api/songs/' + songObj._id)
        .expect(403)
        .end(function (songDeleteErr, songDeleteRes) {
          // Set message assertion
          (songDeleteRes.body.message).should.match('User is not authorized');

          // Handle song error error
          done(songDeleteErr);
        });

    });
  });

  it('should be able to get a single song that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

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
              should.equal(songSaveRes.body.user._id, orphanId);

              // force the song to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
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
                        should.equal(songInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single song if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new song model instance
    var songObj = new Song(song);

    // Save the song
    songObj.save(function () {
      request(app).get('/api/songs/' + songObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', song.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single song, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
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
      roles: ['admin', 'user']
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

  afterEach(function (done) {
    User.remove().exec(function () {
      Song.remove().exec(done);
    });
  });
});
