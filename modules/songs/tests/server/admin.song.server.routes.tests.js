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

  it('admins should be able to update a song that a different user created', function (done) {
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
    });
  });

  it('admins should be able to delete a song that a different user created', function (done) {
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

                  // Delete the existing song
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
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Song.remove().exec(done);
    });
  });
});
