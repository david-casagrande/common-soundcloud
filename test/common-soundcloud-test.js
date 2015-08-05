/**
 * Module dependencies
 */

var assert = require('assert');
var sinon = require('sinon');
var proxyquire = require('proxyquireify')(require);

var apiStub = require('./helpers/widget-api-stub');
var widgetStub = apiStub.widgetStub;

window.SC = apiStub.SC;

var soundcloudEmbed;
var loadAPIStub;
var SoundCloud;

describe('common-soundcloud', function() {
  beforeEach(function() {

    /**
     * Add a fake embedded video to control
     */

    soundcloudEmbed = document.createElement('iframe');
    soundcloudEmbed.src = '#';
    soundcloudEmbed.id = 'soundcloud-embed';
    document.body.appendChild(soundcloudEmbed);

    /**
     * Mock out load-api, return our api stub
     */

    loadAPIStub = sinon.stub().returns(function(cb) {
      cb(null, window.SC);
    });

    /**
     * Magic happens
     */

    SoundCloud = proxyquire('../', {
      './lib/load-api': loadAPIStub
    });
  });

  afterEach(function() {
    document.body.removeChild(soundcloudEmbed);
  });

  describe('initialization', function() {
    it('should load the SoundCloud iframe API', function() {
      var player = new SoundCloud('soundcloud-embed');
      assert.ok(loadAPIStub.called);
    });

    it('should create a new instance of `SC.Widget`', function() {
      var player = new SoundCloud('soundcloud-embed');
      assert.ok(SC.Widget.calledWith('soundcloud-embed'));
    });
  });

  describe('functionality', function() {
    it('can play a track', function() {
      var player = new SoundCloud('soundcloud-embed');
      player.play();

      assert.ok(widgetStub.play.called);
    });

    it('can pause a track', function() {
      var player = new SoundCloud('soundcloud-embed');
      player.pause();

      assert.ok(widgetStub.pause.called);
    });

    it('can skip a track', function() {
      var player = new SoundCloud('soundcloud-embed');

      player.skip(2);
      assert.ok(widgetStub.skip.calledWith(2));

      player.skip();
      assert.ok(widgetStub.skip.calledWith(0));
    });
  });

  describe('events', function() {
    it('should emit `ready` when loaded', function(done) {
      var player = new SoundCloud('soundcloud-embed');
      player.on('ready', done);

      widgetStub.emit(SC.Widget.Events.READY);
    });

    it('should emit `play` when playing', function(done) {
      var player = new SoundCloud('soundcloud-embed');

      player.on('play', done);

      widgetStub.emit(SC.Widget.Events.PLAY);
    });

    it('should emit `pause` when paused', function(done) {
      var player = new SoundCloud('soundcloud-embed');

      player.on('pause', done);
      widgetStub.emit(SC.Widget.Events.PAUSE);
    });

    it('should emit `end` when finished', function(done) {
      var player = new SoundCloud('soundcloud-embed');

      player.on('end', done);
      widgetStub.emit(SC.Widget.Events.FINISH);
    });

    it('should emit `playProgress` when playing, and pass returned audio object', function(done) {
      var player = new SoundCloud('soundcloud-embed');
      var expectedHash = { currentTime: 10 };

      player.on('playProgress', function(e) {
        assert.equal(e, expectedHash);
        done();
      });
      widgetStub.emit(SC.Widget.Events.PLAY_PROGRESS, expectedHash);
    });

    it('should emit `loadProgress` when loading, and pass returned audio object', function(done) {
      var player = new SoundCloud('soundcloud-embed');
      var expectedHash = { currentTime: 10 };

      player.on('loadProgress', function(e) {
        assert.equal(e, expectedHash);
        done();
      });
      widgetStub.emit(SC.Widget.Events.LOAD_PROGRESS, expectedHash);
    });
  });

  describe('destruction', function() {
    it('should remove player event listeners', function() {
      var player = new SoundCloud('soundcloud-embed');
      player.destroy();

      assert.equal(widgetStub.unbind.callCount, 6);
    });

    it('should delete its internal player', function() {
      var player = new SoundCloud('soundcloud-embed');
      player.destroy();

      assert.equal(player.player, undefined);
    });
  });
});
