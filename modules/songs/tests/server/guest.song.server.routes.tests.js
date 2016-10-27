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
describe('Song Guest CRUD tests', function () {

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

  it('guests should not be able to create a song', function (done) {
    agent.post('/api/songs')
      .send(song)
      .expect(403)
      .end(function (songSaveErr, songSaveRes) {
        // Call the assertion callback
        done(songSaveErr);
      });
  });

  it('guests should be able to get a list of songs', function (done) {
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

  it('guests should be able to get a single song', function (done) {
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

  it('guests should get proper error for single song with an invalid Id', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/songs/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Song is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('guests should get proper error for single song which doesnt exist', function (done) {
    // This is a valid mongoose Id but a non-existent song
    request(app).get('/api/songs/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No song with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('guests should not be able to update a song', function (done) {
    // Set song user
    song.user = user;

    // Create new song model instance
    var songObj = new Song(song);

    // Save the song
    songObj.save(function () {
      // Try updating song
      song.title = 'New Title';
      request(app).put('/api/songs/' + songObj._id)
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

  it('guests should not be able to delete a song', function (done) {
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

  it('guests should be able to get a single song that has an orphaned user reference', function (done) {
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
      roles: ['user']
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
                // now signout with valid user
                agent.get('/api/auth/signout')
                  .expect(302)
                  .end(function (err, res) {
                    // Handle signout error
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

  it('guests should be able to get a single song and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
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

  afterEach(function (done) {
    User.remove().exec(function () {
      Song.remove().exec(done);
    });
  });
});
