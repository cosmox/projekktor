/*
 * this file is part of:
 * projekktor zwei
 * http://www.projekktor.com
 *
 * Copyright 2010, Sascha Kluger, Spinning Airwhale Media, http://www.spinningairwhale.com
 * under GNU General Public License
 * http://www.filenew.org/projekktor/license/
 */
jQuery(function ($) {
    $p.newModel({

        modelId: 'VIDEO',
        androidVersion: 2,
        iosVersion: 3,
        nativeVersion: 0,
        iLove: [
    {
            ext: 'mp4',
            type: 'video/mp4',
            platform: ['ios', 'android', 'native'],
            streamType: ['http', 'pseudo', 'httpVideo'],
            fixed: 'maybe'
        },
        {
            ext: 'ogv',
            type: 'video/ogg',
            platform: 'native',
            streamType: ['http', 'httpVideo']
        },
    {
            ext: 'webm',
            type: 'video/webm',
            platform: 'native',
            streamType: ['http', 'httpVideo']
        },
    {
            ext: 'ogg',
            type: 'video/ogg',
            platform: 'native',
            streamType: ['http', 'httpVideo']
        },
    {
            ext: 'anx',
            type: 'video/ogg',
            platform: 'native',
            streamType: ['http', 'httpVideo']
        }
    ],

        _eventMap: {
            pause: "pauseListener",
            play: "playingListener",
            volumechange: "volumeListener",
            progress: "progressListener",
            timeupdate: "timeListener",
            ended: "_ended",
            waiting: "waitingListener",
            canplaythrough: "canplayListener",
            canplay: "canplayListener",
            error: "errorListener",
            suspend: "suspendListener",
            seeked: "seekedListener",
            loadedmetadata: "metaDataListener",
            loadstart: null
        },

        allowRandomSeek: false,
        videoWidth: 0,
        videoHeight: 0,
        wasPersistent: true,
        isPseudoStream: false,

        applyMedia: function (destContainer) {

            if ($('#' + this.pp.getMediaId() + "_html").length == 0) {
                this.wasPersistent = false;
                destContainer.html('').append(
                $('<video/>')
                    .attr({
                    "id": this.pp.getMediaId() + "_html",
                    "poster": (this.pp.getIsMobileClient('ANDROID')) ? this.getPoster() : $p.utils.imageDummy(),
                    "loop": false,
                    "autoplay": false,
                    "x-webkit-airplay": "allow"
                }).prop({
                    controls: false,
                    volume: this.getVolume()
                }).css({
                    'width': '100%',
                    'height': '100%',
                    'position': 'absolute',
                    'top': 0,
                    'left': 0
                }));
            }

            this.mediaElement = $('#' + this.pp.getMediaId() + "_html");
            this.applySrc();
        },

        applySrc: function () {
            var ref = this,
                wasPlaying = ref.getState('PLAYING'),
                wasAwakening = ref.getState('AWAKENING');

            this.removeListener('error');
            this.removeListener('play');
            this.removeListener('loadstart');
            this.removeListener('canplay');

            this.mediaElement.find('source').remove();

            $.each(this.getSource(), function () {
                $('<source/>').appendTo(ref.mediaElement).attr({
                    src: this.src,
                    type: this.type
                })

            })

            var func = function () {

                ref.mediaElement.unbind('loadstart.projekktorqs' + ref.pp.getId());
                ref.mediaElement.unbind('loadeddata.projekktorqs' + ref.pp.getId());
                ref.mediaElement.unbind('canplay.projekktorqs' + ref.pp.getId());

                ref.addListeners('error');
                ref.addListeners('play');
                ref.addListeners('loadstart');
                ref.addListeners('canplay');

                ref.mediaElement = $('#' + ref.pp.getMediaId() + "_html");

                if (wasAwakening) {
                    ref.displayReady();
                    return;
                }

                if (ref.getState('SEEKING')) {
                    if (ref._isPlaying) ref.setPlay();

                    ref.seekedListener();
                    return;
                }

                if (!ref.isPseudoStream) ref.setSeek(ref.media.position || 0);

                if (ref._isPlaying) ref.setPlay();

            };

            this.mediaElement.bind('loadstart.projekktorqs' + this.pp.getId(), func);
            this.mediaElement.bind('loadeddata.projekktorqs' + this.pp.getId(), func);
            this.mediaElement.bind('canplay.projekktorqs' + this.pp.getId(), func);

            this.mediaElement.get(0).load();

            func();

            // F*CK!!!!
            var ua = navigator.userAgent;
            if (ua.indexOf("Android") >= 0) {
                if (parseFloat(ua.slice(ua.indexOf("Android") + 8)) < 3) {
                    func();
                }
            }

        },

        detachMedia: function () {
            try {
                this.mediaElement[0].pause();
                this.mediaElement.find('source').remove();
                this.mediaElement.load();
            } catch (e) {}
        },

        /*****************************************
         * Handle Events
         ****************************************/
        addListeners: function (evtId, subId) {

            if (this.mediaElement == null) return;

            var id = (subId != null) ? '.projekktor' + subId + this.pp.getId() : '.projekktor' + this.pp.getId(),
                ref = this,
                evt = (evtId == null) ? '*' : evtId;

            $.each(this._eventMap, function (key, value) {
                if ((key == evt || evt == '*') && value != null) {
                    ref.mediaElement.bind(key + id, function (evt) {
                        ref[value](this, evt)
                    });
                }
            });
        },

        removeListener: function (evt, subId) {
            if (this.mediaElement == null) return;

            var id = (subId != null) ? '.projekktor' + subId + this.pp.getId() : '.projekktor' + this.pp.getId(),
                ref = this;

            $.each(this._eventMap, function (key, value) {
                if (key == evt) {
                    ref.mediaElement.unbind(key + id);
                }
            });
        },

        _ended: function () {

            var dur = this.mediaElement[0].duration, // strange android behavior workaround
                complete = (Math.round(this.media.position) === Math.round(dur)),
                fixedEnd = ((dur - this.media.maxpos) < 2) && (this.media.position === 0) || false;
            if (complete || fixedEnd || this.isPseudoStream) {
                this.endedListener(this);
            } else {
                this.pauseListener(this);
            }
        },

        playingListener: function (obj) {
            var ref = this;

            (function () {
                try {

                    if (ref.mediaElement[0].currentSrc != '' && ref.mediaElement[0].networkState == ref.mediaElement[0].NETWORK_NO_SOURCE && ref.getDuration() == 0) {
                        ref.setTestcard(80);
                        return;
                    }

                    if (ref.getDuration() == 0) {
                        setTimeout(arguments.callee, 500);
                        return;
                    }

                } catch (e) {}
            })();

            this._setState('playing');
        },

        errorListener: function (obj, evt) {
            try {
                switch (event.target.error.code) {
                    case event.target.error.MEDIA_ERR_ABORTED:
                        this.setTestcard(1);
                        break;
                    case event.target.error.MEDIA_ERR_NETWORK:
                        this.setTestcard(2);
                        break;
                    case event.target.error.MEDIA_ERR_DECODE:
                        this.setTestcard(3);
                        break;
                    case event.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        this.setTestcard(4);
                        break;
                    default:
                        this.setTestcard(5);
                        break;
                }
            } catch (e) {}
        },

        canplayListener: function (obj) {
            var ref = this;
            // pseudo streaming
            if (this.pp.getConfig('streamType') == 'pseudo') {
                $.each(this.media.file, function () {
                    if (this.src.indexOf(ref.mediaElement[0].currentSrc) > -1) {
                        if (this.type == 'video/mp4') {
                            ref.isPseudoStream = true;
                            ref.allowRandomSeek = true;
                            ref.media.loadProgress = 100;
                            return false;
                        }
                    }
                })
            }

            this._setBufferState('full');
        },

        /*****************************************
         * Setters
         ****************************************/
        setPlay: function () {
            try {
                this.mediaElement[0].play();
            } catch (e) {}
        },

        setPause: function () {
            try {
                this.mediaElement[0].pause();
            } catch (e) {}
        },

        setVolume: function (volume) {
            this._volume = volume;
            try {
                this.mediaElement.prop('volume', volume);
            } catch (e) {
                return false;
            }
            return volume;
        },

        setSeek: function (newpos) {

            if (this.isPseudoStream) {
                this.media.position = 0;
                this.media.offset = newpos;
                this.timeListener();
                this.applySrc();
                return;
            }
            var ref = this;

            // IE9 somtimes raises INDEX_SIZE_ERR
            (function () {
                try {
                    ref.mediaElement[0].currentTime = newpos;
                    ref.timeListener({
                        position: newpos
                    });
                } catch (e) {
                    if (ref.mediaElement != null) setTimeout(arguments.callee, 100);
                }

            })();

        },

        setFullscreen: function (inFullscreen) {
            if (this.element == 'audio') return;
            this._scaleVideo();
        },

        setResize: function () {
            if (this.element == 'audio') return;
            this._scaleVideo(false);
        }

    });

    $p.newModel({

        modelId: 'AUDIO',

        iLove: [
    {
            ext: 'ogg',
            type: 'audio/ogg',
            platform: 'native',
            streamType: ['http', 'httpAudio']
        },
    {
            ext: 'oga',
            type: 'audio/ogg',
            platform: 'native',
            streamType: ['http', 'httpAudio']
        },
    {
            ext: 'mp3',
            type: 'audio/mp3',
            platform: ['ios', 'android', 'native'],
            streamType: ['http', 'httpAudio']
        },
        {
            ext: 'mp3',
            type: 'audio/mpeg',
            platform: ['ios', 'android', 'native'],
            streamType: ['http', 'httpAudio']
        }
    ],

        imageElement: {},

        applyMedia: function (destContainer) {

            var ref = this;

            $p.utils.blockSelection(destContainer)

            // create cover image
            this.imageElement = this.applyImage(this.pp.getConfig('cover') || this.pp.getConfig('poster'), destContainer);
            this.imageElement.css({
                border: '0px'
            })

            var mediaContainer = $('#' + this.pp.getMediaId() + '_audio_container')
            if (mediaContainer.length == 0) {
                mediaContainer = $('<div/>')
                    .css({
                    width: '1px',
                    height: '1px',
                    marginBottom: '-1px'
                })
                    .attr('id', this.pp.getMediaId() + "_audio_container")
                    .prependTo(this.pp.getDC());
            }

            mediaContainer.html('').append(
            $('<audio/>')
                .attr({
                "id": this.pp.getMediaId() + "_html",
                "poster": $p.utils.imageDummy(),
                "loop": false,
                "autoplay": false,
                "x-webkit-airplay": "allow"
            }).prop({
                controls: false,
                volume: this.getVolume()
            }).css({
                width: '1px',
                height: '1px',
                position: 'absolute',
                top: 0,
                left: 0
            }));

            this.mediaElement = $('#' + this.pp.getMediaId() + "_html");

            this.applySrc();

        },

        setPosterLive: function () {
            if (this.imageElement.parent) {
                var dest = this.imageElement.parent(),
                    ref = this;

                if (this.imageElement.attr('src') == ref.pp.getConfig('poster')) return;

                this.imageElement.fadeOut('fast', function () {
                    $(this).remove();
                    ref.imageElement = ref.applyImage(ref.pp.getConfig('poster'), dest);
                })
            }
        }

    }, 'VIDEO');

    $p.newModel({

        modelId: 'VIDEOHLS',

        androidVersion: 3,
        iosVersion: 4,

        iLove: [
    {
            ext: 'm3u8',
            type: 'application/mpegURL',
            platform: ['ios', 'android'],
            streamType: ['http', 'httpVideo', 'httpVideoLive']
        },
        {
            ext: 'm3u',
            type: 'application/mpegURL',
            platform: ['ios', 'android'],
            streamType: ['http', 'httpVideo', 'httpVideoLive']
        }, // {ext:'m3u8', type:'vnd.apple.mpegURL', platform:'ios'},
        // {ext:'m3u', type:'vnd.apple.mpegURL', platform:'ios'},
        {
            ext: 'ts',
            type: 'video/MP2T',
            platforms: ['ios', 'android'],
            streamType: ['http', 'httpVideo', 'httpVideoLive']
        }
    ]

    }, 'VIDEO');

});
