(function ($, undefined) {
	"use strict";

	function asyncCall (self, data, method, callback) {
		if (method in data.detail.callbacks) {
			data.detail.callbacks[method].push(callback);
		}
		else {
			data.detail.callbacks[method] = [callback];
		}
		send(self, data, method);
	}

	var event_map = {
		ready: 'ready',
		play: 'play',
		pause: 'pause',
		finish: 'finish',
		buffering: null,
		timeupdate: 'playProgress',
		durationchange: 'loadProgress',
		volumechange: null,
		error: 'error'
	};

	$.embedplayer.register({
		origin: ['https://w.soundcloud.com', 'http://w.soundcloud.com'],
		matches: function () {
			return $.nodeName(this, "iframe") && /^https?:\/\/w\.soundcloud\.com\/player\/\?/i.test(this.src);
		},
		init: function (data, callback) {
			var match = /^https?:\/\/w\.soundcloud\.com\/player\/\?([^#]*)/i.exec(this.src);
			var params = $.embedplayer.parseParams(match[1]);

			if (params.url && (match = /^https?:\/\/api\.soundcloud\.com\/([a-z]+)\/(\d+)/i.exec(params.url))) {
				data.detail.item_type = match[1];
				data.detail.item_id = match[2];
			}

			data.detail.duration = NaN;
			data.detail.currenttime = 0;
			data.detail.commands = [];
			data.detail.origin = $.embedplayer.origin(this.src);
			data.detail.callbacks = {};

			var self = this;

			window.addEventListener('message', onmessage, false);
			function onmessage (event) {
				if (self.contentWindow && event.origin === data.detail.origin && self.contentWindow === event.source) {
					var message = data.module.parseMessage(event);
					if (message.data.method === "ready") {
						window.removeEventListener('message', onmessage, false);
						data.detail.widget_id = message.data.widgetId;
						callback("soundcloud_"+message.data.widgetId);
						$.embedplayer.trigger(self, data, "ready");
						// initialize some data
						send(self, data, 'getDuration');
						send(self, data, 'getVolume');
						for (var i = 0; i < data.detail.commands.length; ++ i) {
							self.contentWindow.postMessage(JSON.stringify(data.detail.commands[i]), data.detail.origin);
						}
						data.detail.commands = null;
					}
				}
				else if (!$.contains(self.ownerDocument.body, self)) {
					window.removeEventListener('message', onmessage, false);
				}
			}
		},
		play: function (data) {
			send(this, data, "play");
		},
		pause: function (data) {
			send(this, data, "pause");
		},
		stop: function (data) {
			send(this, data, "pause");
		},
		next: function (data) {
			send(this, data, "next");
		},
		prev: function (data) {
			send(this, data, "prev");
		},
		volume: function (data, callback) {
			asyncCall(this, data, "getVolume", function (volume) {
				callback(volume/100);
			});
		},
		duration: function (data, callback) {
			asyncCall(this, data, "getDuration", function (duration) {
				callback(duration/1000);
			});
		},
		currenttime: function (data, callback) {
			asyncCall(this, data, "getPosition", function (position) {
				callback(position/1000);
			});
		},
		setVolume: function (data, volume) {
			send(this, data, 'setVolume', volume*100);
		},
		seek: function (data, position) {
			send(this, data, 'seekTo', position*1000);
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
			return null; // TODO
		},
		parseMessage: function (event) {
			var message = {
				data: JSON.parse(event.data)
			};
			message.player_id = "soundcloud_"+message.data.widgetId;
			return message;
		},
		processMessage: function (data, message, trigger) {
			if (message.data.method === "playProgress") {
				var currenttime = message.data.value.currentPosition/1000;
				if (currenttime !== data.detail.currenttime) {
					data.detail.currenttime = currenttime;
					trigger('timeupdate', {currentTime:currenttime});
				}
			}
			else if (message.data.method === "play") {
				trigger("play");
			}
			else if (message.data.method === "pause") {
				trigger("pause");
			}
			else if (message.data.method === "finish") {
				trigger("finish");
			}
			else if (message.data.method === "error") {
				trigger("error", {error:"error"});
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
					var volume = message.data.value/100;
					if (data.detail.volume !== volume) {
						data.detail.volume = volume;
						trigger("volumechange", {volume:volume});
					}
				}
				else if (message.data.method === "getDuration") {
					var duration = message.data.value/1000;
					if (data.detail.duration !== duration) {
						data.detail.duration = duration;
						trigger("durationchange", {duration:duration});
					}
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
