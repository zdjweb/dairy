const LMusic = (() => {
    const LMusic = {
        // src设置
        srcSet(src) {
            const thisLMusic = LMusic[this];
            thisLMusic.src = src;
            if (thisLMusic.page) {
                thisLMusic.page.src = src;
            }
        },
        // 页面初始化
        pageInit(that, container) {
            const thisLMusic = this[that];
            let page = thisLMusic.page;
            if (!page) {
                page = thisLMusic.page = document.createElement('iframe');
                Object.assign(page.style, {
                    width: '100%',
                    height: '100%',
                    border: 'none'
                });
                that.srcSet(thisLMusic.src);
            }
            container.appendChild(page);
            thisLMusic.window = page.contentWindow;
        },
        // 容器设置
        containerSet(container) {
            const thisLMusic = LMusic[this],
            lastContainer = thisLMusic.container,
            containerElement = document.querySelector(container);
            if (lastContainer) {
                lastContainer.removeChild(thisLMusic.page);
            }
            if (!containerElement) {
                throw 'MScrollbar:The container is undefined.';
            }
            thisLMusic.container = containerElement;
            LMusic.pageInit(this, containerElement);
        },
        // 音乐设置
        musicSet(newMusic, index) {
            const thisLMusic = LMusic[this],
            number = thisLMusic.number,
            music = thisLMusic.music;
            if (index < 0 || index == null || index > number) {
                index = number;
            }
            music[index] = newMusic;
            LMusic.sendMessage(this, {
                type: 'music',
                data: {
                    index,
                    music: newMusic
                }
            });
            if (index == number) {
                thisLMusic.number++;
            }
        },
        // 封面设置
        coverSet(newCover, index) {
            const thisLMusic = LMusic[this],
            number = thisLMusic.number,
            cover = thisLMusic.cover;
            if (index < 0 || index == null || index >= number) {
                index = number - 1;
            }
            cover[index] = newCover;
            LMusic.sendMessage(this, {
                type: 'cover',
                data: {
                    index,
                    cover: newCover
                }
            });
        },
        // 歌词设置
        lyricSet(newLyric, index) {
            const thisLMusic = LMusic[this],
            number = thisLMusic.number,
            lyric = thisLMusic.lyric;
            if (index < 0 || index == null || index >= number) {
                index = number - 1;
            }
            lyric[index] = newLyric;
            LMusic.sendMessage(this, {
                type: 'lyric',
                data: {
                    index,
                    lyric: newLyric
                }
            });
        },
        // 时间设置
        timeSet(newTime, index) {
            const thisLMusic = LMusic[this],
            number = thisLMusic.number,
            time = thisLMusic.time;
            if (index < 0 || index == null || index >= number) {
                index = number - 1;
            }
            let thisTime = time[index] = null;
            if (newTime) {
                thisTime = time[index] = {};
                if (typeof newTime == 'object') {
                    thisTime.start = newTime.start;
                    thisTime.end = newTime.end;
                } else {
                    thisTime.start = newTime;
                }
            }
            LMusic.sendMessage(this, {
                type: 'time',
                data: {
                    index,
                    time: thisTime
                }
            });
        },
        // 发送信息
        sendMessage(that, data) {
            const message = {
                from: 'LMusic'
            };
            if (typeof data == 'object') {
                Object.assign(message, data);
            } else {
                Object.assign(message, {
                    type: 'audioState',
                    data
                });
            }
            this[that].window.postMessage(message);
        },
        // 播放
        play() {
            LMusic.sendMessage(this, 'play');
        },
        // 暂停
        pause() {
            LMusic.sendMessage(this, 'pause');
        },
        // 切换到上一首
        last() {
            LMusic.sendMessage(this, 'last');
        },
        // 切换到下一首
        next() {
            LMusic.sendMessage(this, 'next');
        }
    };
    return class {
        static get author() {
            return '2002-2003';
        }
        static get version() {
            return '2.0.1';
        }
        constructor({container, src, music, autoPlay}) {
            const init = () => {
                const that = LMusic[this] = {};
                that.functions = {
                    stateChange: {
                        functions: [],
                        add(newFunction) {
                            this.functions.push(newFunction);
                        }
                    },
                    lyricChange: {
                        functions: [],
                        add(newFunction) {
                            this.functions.push(newFunction);
                        }
                    }
                };
                this.srcSet(src);
                this.containerSet(container);
            };
            window.addEventListener('message', (message) => {
                message = message.data;
                const type = message.type,
                data = message.data;
                if (type == 'init') {
                    const eMusic = music,
                    thisLMusic = LMusic[this];
                    Object.assign(thisLMusic, {
                        number: 0,
                        music: {},
                        cover: {},
                        lyric: {},
                        time: {}
                    });
                    if (eMusic) {
                        for (const i in eMusic) {
                            const music = eMusic[i];
                            this.musicSet(music.src);
                            this.coverSet(music.cover);
                            this.lyricSet(music.lyric);
                            this.timeSet(music.time);
                        }
                    }
                    // 初始化
                    LMusic.sendMessage(LMusic, 'init');
                    // 自动播放
                    if (autoPlay) {
                        this.play();
                    }
                } else if (type == 'paused') {
                    LMusic[this].paused = data;
                    for (const i of LMusic[this].functions.stateChange.functions) {
                        i(data);
                    }
                } else if (type == 'lyric') {
                    for (const i of LMusic[this].functions.lyricChange.functions) {
                        i(data);
                    }
                }
            });
            if (document.readyState == 'loading') {
                window.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        }
        get number() {
            return LMusic[this].number;
        }
        get music() {
            return {...LMusic[this].music};
        }
        get cover() {
            return {...LMusic[this].cover};
        }
        get lyric() {
            return {...LMusic[this].lyric};
        }
        get time() {
            return {...LMusic[this].time};
        }
        get color() {
            return '暂无';
        }
        get paused() {
            return LMusic[this].paused;
        }
        get currentTime() {
            const audio = LMusic[this].audio;
            if (audio) {
                return audio.currentTime;
            }
            return 0;
        }
        set currentTime(time) {
            const audio = LMusic[this].audio;
            if (audio) {
                audio.currentTime = time;
            }
        }
        get duration() {
            const audio = LMusic[this].audio;
            if (audio) {
                return audio.duration;
            }
            return 0;
        }
        get functions() {
            return LMusic[this].functions;
        }
        get containerSet() {
            return LMusic.containerSet;
        }
        get srcSet() {
            return LMusic.srcSet;
        }
        get musicSet() {
            return LMusic.musicSet;
        }
        get coverSet() {
            return LMusic.coverSet;
        }
        get lyricSet() {
            return LMusic.lyricSet;
        }
        get timeSet() {
            return LMusic.timeSet;
        }
        get colorSet() {
            return () => '暂无';
        }
        get play() {
            return LMusic.play;
        }
        get pause() {
            return LMusic.pause;
        }
        get last() {
            return LMusic.last;
        }
        get next() {
            return LMusic.next;
        }
    }
})();