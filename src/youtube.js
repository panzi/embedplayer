(function ($, undefined) {
	"use strict";

	$.embedplayer.register({
		origin: 'https://www.youtube.com',
		matches: function () {
			return $.nodeName(this,"iframe") && /^https?:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/[-_a-z0-9]+/i.test($.prop(this,"src"));
		},
		init: function (data) {
			var self = this;
			data.detail.duration = NaN;
			data.detail.currenttime = NaN;
			data.detail.volume = 1.0;
			data.detail.commands = [];
			data.detail.video_id = /^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([-_a-z0-9]+)/i.exec(this.src)[1];
			data.detail.timer = setInterval(function () {
				if (!$.contains(self.ownerDocument.body, self)) {
					clearInterval(data.detail.timer);
					data.detail.timer = null;
					return;
				}
				else if (self.contentWindow) {
					self.contentWindow.postMessage(JSON.stringify({event:'listening',id:data.player_id}),"https://www.youtube.com");
				}
			}, 500);
		},
		play: function (data) {
			send(this,data,"playVideo");
		},
		pause: function (data) {
			send(this,data,"pauseVideo");
		},
		stop: function (data) {
			send(this,data,"stopVideo");
		},
		volume: function (data) {
			return data.detail.volume;
		},
		setVolume: function (data,volume) {
			send(this,data,'setVolume',volume);
		},
		duration: function (data) {
			return data.detail.duration;
		},
		currenttime: function (data) {
			return data.detail.currenttime;
		},
		seek: function (data,position) {
			send(this,data,'seekTo',position);
		},
		link: function (data) {
			return 'https://www.youtube.com/watch?v='+data.detail.video_id;
		},
		parseMessage: function (event) {
			var message = {
				data: JSON.parse(event.data)
			};
			message.player_id = message.data.id;
			return message;
		},
		processMessage: function (data,message,trigger) {
			if (message.data.event === "initialDelivery") {
				if (data.detail.timer !== null) {
					clearInterval(data.detail.timer);
					data.detail.timer = null;
				}
			}
			else if (message.data.event === "onReady") {
				data.state = "ready";
				var win = this.contentWindow;
				if (win && data.detail.commands) {
					for (var i = 0; i < data.detail.commands.length; ++ i) {
						win.postMessage(JSON.stringify(data.detail.commands[i]),"https://www.youtube.com");
					}
					data.detail.commands = null;
				}
				trigger("ready");
			}
			else if (message.data.event === "infoDelivery") {
				// TODO: timeupdate, duration, volume etc.
				console.log(message.data);
				if (message.data.info) {
					if ('playerState' in message.data.info) {
						switch (message.data.info.playerState) {
						case -1: // unstarted
							break;

						case  0: // ended
							trigger("finish");
							break;

						case  1: // playing
							trigger("play");
							break;

						case  2: // paused
							trigger("pause");
							break;

						case  3: // buffering
							trigger("buffering");
							break;

						case  5: // cued
							trigger("pause");
							break;
						}
					}
				}
			}
		}
	});

	function send (element,data,func) {
		var command = {
			id: data.player_id,
			event: "command",
			func: func,
			args: Array.prototype.slice.call(arguments,3)
		};

		if (data.state === "init") {
			data.detail.commands.push(command);
		}
		else {
			var win = element.contentWindow;
			if (win) {
				win.postMessage(JSON.stringify(command),"https://www.youtube.com");
			}
		}
	}
})(jQuery);
