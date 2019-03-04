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

[Online Demo](http://panzi.github.io/embedplayer/)

Why?
----

So you have an unified interface for all of these players and you don't need to
load the player APIs from the respective services (which is basically XSS).

Example
-------

```html
<iframe src="https://player.vimeo.com/video/1084537?api=1" id="embed"
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

**Note:** For Twitch players you need to pass the origin of the current host as an
request parameter. E.g.:

```javascript
$('<iframe>').
  attrs({src: 'https://player.twitch.tv/?allowfullscreen&video=v92780016&origin=' +
    encodeURIComponent(location.origin)}).
  appendTo(document.body).
  embedplayer('play');
```

YouTube also has this
[origin parameter](https://developers.google.com/youtube/player_parameters#origin),
but it seems to be optional.

### Fullscreen Support

Embed player doesn't provide an API for toggling a video to fullscreen because player
APIs don't provide a method for that. You can use the HTML5 fullscreen API to implement
this feature yourself, though:

```HTML
<button onclick="$('#embed')[0].requestFullscreen();">Fullscreen</button>
```

**NOTE:** The players *do* provide their own fullscreen buttons. Just adding your own
will get you a situation where you can enter fullscreen twice and get situations that
are very confusing to users. If you don't set the `allowfullscreen` attribute on the
iframe some players will still render a grayed out non-functional fullscreen button,
which is still confusing. So maybe just let this be handeled by the players.

Bugs/TODO
---------

If the iframe is not loaded when the embed player is initialized any
initialization message sent to the iframe will be lost. As I see it, it's not
possible to determine if an iframe is already loaded cross browser (Firefox does
not implement `iframe.readyState`).

API Reference
-------------

**Functions**

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

**Properties**

* [volume](#volumecallback)
* [currenttime](#currenttimecallback)
* [duration](#durationcallback)
* [state](#state)
* [link](#link)

**Events**

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

Play the next video from the playlist. Currently only supported for YouTube playlists.

Example:

```javascript
$('#embed').embedplayer('next');
```

### prev()

Play the previous video from the playlist. Currently only supported for YouTube playlists.

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

* `init`
* `playing`
* `paused`
* `finished`
* `buffering`

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

### embeplayer:statechange

Event object properties:

* `state` [see above](#state) for possible values

### embeplayer:ready

Player is ready to receive commands.

### embeplayer:play

Started playing a media.

### embeplayer:pause

Paused playback.

### embeplayer:finish

End of medium is reached and playback stopped.

### embeplayer:buffering

Waiting for data to arrive. Not every backend supports this event.

### embeplayer:timeupdate

Current time changed. This can be used to display playback progress.

Event object properties:

* `currentTime` `Number` in seconds

### embeplayer:volumechange

The playback volume changed. This can be used to implement a volume widget.

Event object properties:

* `volume` `Number` between 0 and 1

### embeplayer:durationchange

This event is sent when the player loaded enough of the video to know it's
duration.

Event object properties:

* `duration` `Number` in seconds, for streams it might be `Infinity`

### embeplayer:error

Event object properties:

* `error` `String` possible values (might change, except for the first 4):
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
  * `aborted`
  * `network_error`
  * `decoding_error`
  * `src_not_supported`
* `message` `String` (optional)
* `title` `String` (optional)
* `statusCode` `String` (optional) is a HTTP status code associated with the error

**Note:** The Vimeo backend currently only supports `message` and `title` and
just uses the error code `error` for all kinds of errors. I need to find a list
of Vimeo error names to make an appropriate mapping.
