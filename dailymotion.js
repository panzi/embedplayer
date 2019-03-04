(function ($, undefined) {
	"use strict";

	$.embedplayer.register({
		origin: ['https://www.dailymotion.com', "http://www.dailymotion.com"],
		matches: function () {
			return $.nodeName(this, "iframe") && /^https?:\/\/(?:www\.)?dailymotion\.com\/embed\/video\/[-_a-z0-9]+[\?&]api=postMessage/i.test(this.src);
		},
		init: function (data, callback) {
			var match = /^https?:\/\/(?:www\.)?dailymotion\.com\/embed\/video\/([-_a-z0-9]+)\?([^#]*)/i.exec(this.src);
			var video_id = match[1];
			var params = $.embedplayer.parseParams(match[2]);

			callback(params.id);
			data.detail.volume = 1;
			data.detail.currenttime = 0;
			data.detail.duration = NaN;
			data.detail.commands = [];
			data.detail.origin = $.embedplayer.origin(this.src);
			data.detail.video_id = video_id;
			data.detail.callbacks = {};
		},
		play: function (data) {
			send(this, data, 'play');
		},
		pause: function (data) {
			send(this, data, 'pause');
		},
		stop: function (data) {
			send(this, data, 'seek', 0);
			send(this, data, 'pause');
		},
		volume: function (data, callback) {
			callback(data.detail.volume);
		},
		duration: function (data, callback) {
			callback(data.detail.duration);
		},
		currenttime: function (data, callback) {
			callback(data.detail.currenttime);
		},
		setVolume: function (data, volume) {
			send(this, data, 'volume', volume);
		},
		seek: function (data, position) {
			send(this, data, 'seek', position);
		},
		link: function (data) {
			return 'https://www.dailymotion.com/video/'+data.detail.video_id;
		},
		parseMessage: function (event) {
			var message = {
				data: $.embedplayer.parseParams(event.data.replace(/\+/g, ' '))
			};
			if ('id' in message.data) {
				message.player_id = message.data.id;
			}
			return message;
		},
		processMessage: function (data, message, trigger) {
			switch (message.data.event) {
			case "timeupdate":
				var currenttime = parseFloat(message.data.time);
				if (currenttime !== data.detail.currenttime) {
					data.detail.currenttime = currenttime;
					trigger('timeupdate', {currentTime:currenttime});
				}
				break;

			case "volumechange":
				var volume;
				if (message.data.muted === "true") {
					volume = 0;
				}
				else {
					volume = parseFloat(message.data.volume);
					// workaround for buggy API
					if (volume > 1) {
						volume /= 100;
					}
				}
				if (volume !== data.detail.volume) {
					data.detail.volume = volume;
					trigger("volumechange", {volume:volume});
				}
				break;

			case "durationchange":
				var duration = parseFloat(message.data.duration);
				if (duration !== data.detail.duration) {
					data.detail.duration = duration;
					trigger("durationchange", {duration:duration});
				}
				break;

			case "play":
				trigger("play");
				break;

			case "pause":
				trigger("pause");
				break;

			case "ended":
				trigger("finish");
				break;

			case "error":
				var statusCode = parseInt(message.data.statusCode, 10);
				var error = "error";

				if (statusCode >= 100 && statusCode < 200) {
					error = "informational";
				}
				else if (statusCode >= 200 && statusCode < 300) {
					error = "successful";
				}
				else if (statusCode >= 300 && statusCode < 400) {
					if (statusCode === 302) {
						error = "found";
					}
					else if (statusCode === 304) {
						error = "not_modified";
					}
					else {
						error = "redirection";
					}
				}
				else if (statusCode >= 400 && statusCode < 500) {
					if (statusCode === 403) {
						error = "forbidden";
					}
					else if (statusCode === 404) {
						error = "not_found";
					}
					else {
						error = "client_error";
					}
				}
				else if (statusCode >= 500 && statusCode < 600) {
					if (statusCode === 500) {
						error = "internal_server_error";
					}
					else if (statusCode === 501) {
						error = "not_implemented";
					}
					else {
						error = "server_error";
					}
				}

				trigger("error", {
					error:      error,
					statusCode: message.data.statusCode,
					title:      message.data.title,
					message:    message.data.message
				});
				break;

			case "apiready":
				trigger("ready");
				var win = this.contentWindow;
				if (win && data.detail.commands) {
					for (var i = 0; i < data.detail.commands.length; ++ i) {
						win.postMessage(data.detail.commands[i], data.detail.origin);
					}
					data.detail.commands = null;
				}
				break;

			default:
				break;
			}
		}
	});

	function send (element, data, method, value) {
		var command = method;

		if (arguments.length > 3) {
			command += '=' + value;
		}

		if (data.state === "init") {
			data.detail.commands.push(command);
		}
		else {
			var win = element.contentWindow;
			if (win) {
				win.postMessage(command, data.detail.origin);
			}
		}
	}
})(jQuery);
