(function ($, undefined) {
	$.embedplayer.register({
		matches: function () {
			return $.nodeName(this, 'video') || $.nodeName(this, 'audio');
		},
		init: function (data, callback) {
			if (this.readyState === HTMLMediaElement.HAVE_METADATA) {
				var self = this;
				setTimeout(function () {
					$.embedplayer.trigger(self, data, 'ready');
				}, 0);
			}
			else {
				this.addEventListener('loadedmetadata', function (event) {
					$.embedplayer.trigger(this, data, 'ready');
				}, false);
			}

			// initialize volume
			$.embedplayer.trigger(this, data, 'volumechange', {volume:this.volume});

			this.addEventListener('play', function (event) {
				$.embedplayer.trigger(this, data, 'play');
			}, false);

			this.addEventListener('pause', function (event) {
				$.embedplayer.trigger(this, data, 'pause');
			}, false);

			this.addEventListener('ended', function (event) {
				$.embedplayer.trigger(this, data, 'finish');
			}, false);

			this.addEventListener('waiting', function (event) {
				$.embedplayer.trigger(this, data, 'buffering');
			}, false);

			this.addEventListener('timeupdate', function (event) {
				$.embedplayer.trigger(this, data, 'timeupdate', {currentTime:this.currentTime});
			}, false);

			this.addEventListener('volumechange', function (event) {
				$.embedplayer.trigger(this, data, 'volumechange', {volume:this.volume});
			}, false);

			this.addEventListener('durationchange', function (event) {
				$.embedplayer.trigger(this, data, 'durationchange', {duration:this.duration});
			}, false);

			callback();
		},
		play: function (data) {
			this.play();
		},
		pause: function (data) {
			this.pause();
		},
		stop: function (data) {
			this.pause();
			this.currentTime = 0;
		},
		volume: function (data, callback) {
			callback(this.volume);
		},
		duration: function (data, callback) {
			callback(this.duration);
		},
		currenttime: function (data, callback) {
			callback(this.currentTime);
		},
		setVolume: function (data, volume) {
			this.volume = Number(volume);
		},
		seek: function (data, position) {
			this.currentTime = Number(position);
		}
	});
})(jQuery);
