(function ($, undefined) {
	"use strict";

	var event_map = {
		ready: null,
		play: 'play',
		pause: 'pause',
		finish: 'finish',
		buffering: null,
		timeupdate: 'playProgress',
		durationchange: 'loadProgress',
		volumechange: 'volumechange',
		error: 'error'
	};

	$.embedplayer.register({
		origin: ['https://player.vimeo.com', "http://player.vimeo.com"],
		matches: function () {
			return $.nodeName(this, "iframe") && /^https?:\/\/player\.vimeo\.com\/video\/\d+.*[\?&]api=1/i.test(this.src);
		},
		init: function (data, callback) {
			var match = /^https?:\/\/player\.vimeo\.com\/video\/(\d+)[^\?#]*(?:\?(.*))/i.exec(this.src);
			var video_id = match[1];
			var params = $.embedplayer.parseParams(match[2]);

			data.detail.duration = NaN;
			data.detail.currenttime = 0;
			data.detail.commands = [];
			data.detail.origin = $.embedplayer.origin(this.src);
			data.detail.video_id = video_id;
			data.detail.callbacks = {};

			send(this, data, "ping");

			callback(params.player_id);
		},
		play: function (data) {
			send(this, data, "play");
		},
		pause: function (data) {
			send(this, data, "pause");
		},
		stop: function (data) {
			send(this, data, "unload");
		},
		volume: function (data, callback) {
			if (data.detail.callbacks.getVolume) {
				data.detail.callbacks.getVolume.push(callback);
			}
			else {
				data.detail.callbacks.getVolume = [callback];
			}
			send(this, data, "getVolume");
		},
		duration: function (data, callback) {
			callback(data.detail.duration);
		},
		currenttime: function (data, callback) {
			callback(data.detail.currenttime);
		},
		setVolume: function (data, volume) {
			send(this, data, 'setVolume', volume);
		},
		seek: function (data, position) {
			send(this, data, 'seekTo', position);
		},
		listen: function (data, events) {
			var done = {};
			for (var i = 0; i < events.length; ++ i) {
				var event = event_map[events[i]];
				if (event && done[event] !== true) {
					done[event] = true;
					send(this, data, 'addEventListener', event);
				}
			}
		},
		link: function (data) {
			return 'https://vimeo.com/'+data.detail.video_id;
		},
		parseMessage: function (event) {
			var message = {
				data: JSON.parse(event.data)
			};
			if ('player_id' in message.data) {
				message.player_id = message.data.player_id;
			}
			return message;
		},
		processMessage: function (data, message, trigger) {
			if (message.data.event === "ready") {
				trigger("ready");
				// get the initial volume value
				send(this, data, "getVolume");
				var win = this.contentWindow;
				if (win && data.detail.commands) {
					for (var i = 0; i < data.detail.commands.length; ++ i) {
						win.postMessage(JSON.stringify(data.detail.commands[i]), data.detail.origin);
					}
					data.detail.commands = null;
				}
			}
			else if (message.data.event === "playProgress") {
				if ('seconds' in message.data.data) {
					var currenttime = message.data.data.seconds;
					if (currenttime !== data.detail.currenttime) {
						data.detail.currenttime = currenttime;
						trigger('timeupdate', {currentTime:currenttime});
					}
				}
			}
			else if (message.data.event === "timeupdate") {
				var currenttime = message.data.data.seconds;
				if (currenttime !== data.detail.currenttime) {
					data.detail.currenttime = currenttime;
					trigger('timeupdate', {currentTime:currenttime});
				}
			}
			else if (message.data.event === "loadProgress") {
				if ('duration' in message.data.data) {
					var duration = message.data.data.duration;
					if (duration !== data.detail.duration) {
						data.detail.duration = duration;
						trigger("durationchange", {duration:duration});
					}
				}
			}
			else if (message.data.event === "play") {
				trigger("play");
			}
			else if (message.data.event === "pause") {
				trigger("pause");
			}
			else if (message.data.event === "finish") {
				trigger("finish");
			}
			else if (message.data.event === "volumechange") {
				trigger("volumechange", {volume:message.data.data.volume});
			}
			else if (message.data.event === "error") {
				trigger("error", {
					error: 'error',
					message: message.data.data.message,
					title: message.data.data.name
				});
			}
			else if (message.data.method) {
				var callbacks = data.detail.callbacks[message.data.method];
				if (callbacks) {
					for (var i = 0; i < callbacks.length; ++ i) {
						callbacks[i].call(this, message.data.value);
					}
					data.detail.callbacks[message.data.method] = null;
				}
				if (message.data.method === "getVolume") {
					trigger("volumechange", {volume:message.data.value});
				}
			}
		}
	});

	function send (element, data, method, value) {
		var command = {
			method: method
		};

		if (arguments.length > 3) {
			command.value = value;
		}

		if (data.state === "init") {
			data.detail.commands.push(command);
		}
		else {
			var win = element.contentWindow;
			if (win) {
				win.postMessage(JSON.stringify(command), data.detail.origin);
			}
		}
	}
})(jQuery);
