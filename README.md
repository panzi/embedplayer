Embed Player
============

Unified jQuery interface to various audio/video players without dependency on
their official JavaScript libraries. Currently supported players:

 * YouTube
 * Vimeo
 * Twitch
 * SoundCloud
 * Dailymotion
 * HMTL 5 audio/video

Internet Explorer <=8 is not supported.

Why?
----

So you have a unified interface for all of these players and you don't need to
load the player APIs from the respective services (which is basically XSS).

Example
-------

```html
<iframe src="http://player.vimeo.com/video/1084537?api=1" id="embed"
	width="640" height="360" frameborder="0" allowfullscreen></iframe>
```

```javascript
$('#embed').on('embedplayer:statechange', function (event) {
	console.log('state:', event.state);
}).on('embedplayer:error', function (event) {
	console.error('error:', event.error);
}).on('embedplayer:durationchange', function (event) {
	console.log('duration:', event.duration);
}).on('embedplayer:volumechange', function (event) {
	console.log('volume:', event.volume);
}).on('embedplayer:timeupdate', function (event) {
	console.log('currentTime:', event.currentTime);
}).on('embedplayer:ready', function (event) {
	console.log('link:', $(this).embedplayer('link'));
}).embedplayer('listen'); // enable all events

$('#embed').embedplayer('play');
$('#embed').embedplayer('seek',30);
$('#embed').embedplayer('volume',0.5);
$('#embed').embedplayer('pause');
$('#embed').embedplayer('stop');
```

API Reference
-------------

### Functions

 * [init](#init)
 * [listen](#listenevents)
 * [play](#play)
 * [pause](#pause)
 * [stop](#stop)
 * [seek](#seektime)
 * [next](#next)
 * [prev](#prev)
 * [supported](#supported)
 * [volume](#volumevalue)

### Properties

 * [volume](#volumecallback)
 * [currenttime](#currenttimecallback)
 * [duration](#durationcallback)
 * [state](#state)
 * [link](#link)

### Events

 * [statechange](#embeplayerstatechange)
 * [ready](#embeplayerready)
 * [play](#embeplayerplay)
 * [pause](#embeplayerpause)
 * [finish](#embeplayerfinish)
 * [buffering](#embeplayerbuffering)
 * [timeupdate](#embeplayertimeupdate)
 * [volumechange](#embeplayervolumechange)
 * [durationchange](#embeplayerdurationchange)
 * [error](#embeplayererror)

Functions
---------

### init()

Initializes the embed. All other functions do this implicitely as well.

Examples:

```javascript
$('#embed').embedplayer('init');
```

or

```javascript
$('#embed').embedplayer();
```

### listen([events])

Enable certain events.

Examples:

```javascript
$('#embed').embedplayer('listen', 'timeupdate error');
```

or:

```javascript
$('#embed').embedplayer('listen', ['timeupdate', 'error']);
```

or to enable all events:

```javascript
$('#embed').embedplayer('listen');
```

### play()

Example:

```javascript
$('#embed').embedplayer('play');
```

### pause()

Example:

```javascript
$('#embed').embedplayer('pause');
```

### stop()

Not all players support this. If it is not supported it is the same as [pause()](#pause).

Example:

```javascript
$('#embed').embedplayer('stop');
```

### seek(time)

`time` is given in seconds.

Example:

```javascript
$('#embed').embedplayer('seek', time);
```

### next()

Play the next video in playlist. Currently only supported for YouTube playlists.

Example:

```javascript
$('#embed').embedplayer('next');
```

### prev()

Play the previous video in playlist. Currently only supported for YouTube playlists.

Example:

```javascript
$('#embed').embedplayer('prev');
```

### supported()

Example:

```javascript
if (!$('#embed').embedplayer('supported')) {
	alert('Cannot control this embed!');
}
```

### volume(value)

`value` is in the range of 0 to 1.

Example:

```javascript
$('#embed').embedplayer('volume', value);
```

Properties
----------

### volume(callback)

`callback` is a function that takes the volume value as paramert. The volume
is in the range of 0 to 1. The value might be NaN if the player is not yet
initialized or for some players if it hasn't started playing.

Example:

```javascript
$('#embed').embedplayer('volume', function (value) { console.log(value); });
```

### currenttime(callback)

`callback` is a function that takes the current time value as paramert. The
time is given in seconds. The value might be NaN if the player is not yet
initialized or for some players if it hasn't started playing.

Example:

```javascript
$('#embed').embedplayer('currenttime', function (value) { console.log(value); });
```

### duration(callback)

`callback` is a function that takes the duration value as paramert. The
duration is given in seconds. The value might be NaN if the player is not yet
initialized or for some players if it hasn't started playing.

Example:

```javascript
$('#embed').embedplayer('duration', function (value) { console.log(value); });
```

### state

Possible states:

 * init
 * playing
 * paused
 * finished
 * buffering

Not all states are supported by all players.

Example:

```javascript
console.log($('#embed').embedplayer('state'));
```

### link

Link to a web page representing the video. Might be `null` if it can't be determined.

Example:

```javascript
console.log($('#embed').embedplayer('link'));
```

Events
------

TODO

### embeplayer:statechange

Event object properties:

 * `state` [see above](#state) for possible values

### embeplayer:ready
### embeplayer:play
### embeplayer:pause
### embeplayer:finish
### embeplayer:buffering
### embeplayer:timeupdate

Event object properties:

 * `currentTime` in seconds

### embeplayer:volumechange

Event object properties:

 * `volume` between 0 and 1

### embeplayer:durationchange

Event object properties:

 * `duration` in seconds, for streams it might be `Infinity`

### embeplayer:error

Event object properties:

 * `error` possible values (might change, except for the first 4):
  * `error`
  * `not_found`
  * `forbidden`
  * `illegal_parameter`
  * `informational`
  * `success`
  * `redirection`
  * `found`
  * `not_modified`
  * `client_error`
  * `internal_server_error`
  * `server_error`
 * `message` (optional)
 * `title` (optional)
 * `statusCode` (optional) is a HTTP status code associated with the error

**Note:** The Vimeo backend currently only supports `message` and `title` and
just uses the error code `error` for all kinds of errors. I need to find a list
of Vimeo error names to make an appropriate mapping.
