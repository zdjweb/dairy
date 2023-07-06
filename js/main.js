(() => {
    // 文章容器
    const article = document.querySelector('article'),
    // 文章日期信息容器
    date = article.querySelector('#date'),
    // 文章字数信息容器
    length = article.querySelector('#length'),
    // 加载状态
    state = {},
    // 文章列表
    list = [];

    // 二维码
    let qrcode;
    
    // 按钮对象
    class Btn {
        constructor(element, fun) {
            this.element = element;
            this.fun = fun;
            this.bind();
        }

        bind() {
            this.element.addEventListener('click', this.fun);
        }

        unbind() {
            this.element.removeEventListener('click', this.fun);
        }
    }

    // 日期按钮对象
    class Day extends Btn {
        constructor(parent, hashDay, hashMonth, hashYear, day, month, year) {
            const element = document.createElement('div');
            element.classList.add('day');
            if (hashYear == year && hashMonth == month && hashDay == day) {
                let needLine = 0;
                for (const i of parent.parentElement.children) {
                    if (i == parent) {
                        document.body.setAttribute('needLine', needLine);
                    }
                    needLine++;
                }
                element.classList.add('now');
            }
            element.innerHTML = day;
            parent.appendChild(element);
            super(element, () => {
                const now = document.querySelector('.now');
                location.hash = `${year}/${month}/${day}`;
                if (now) {
                    now.classList.remove('now');
                }
                this.element.classList.add('now');
            });
            list.push(`${year}/${month}/${day}`);
            state[year][month].now++;
            if (state[year][month].now == state[year][month].need) {
                state[year].now++;
                if (state[year].now == state[year].need) {
                    state.now++;
                    if (state.now == state.need) {
                        pageInit();
                    }
                }
            }
        }
    }

    // 日期容器对象
    class DayContainer {
        constructor(days, parent, hashDay, hashMonth, hashYear, month, year) {
            const element = document.createElement('div'),
            children = [];
            element.className = 'dayContainer';
            for (let i = 0; i < Math.ceil(days.length / 5); i++) {
                children[i] = document.createElement('div');
                children[i].className = 'dayContainers';
                element.appendChild(children[i]);
            }
            let i = 0;
            for (const day of days) {
                new Day(children[Math.floor(i++ / 5)], hashDay, hashMonth, hashYear, day, month, year);
            }
            parent.appendChild(element);
            this.element = element;
            this.children = children;
        }
    }

    // 月份按钮对象
    class MonthContainer extends Btn {
        constructor(parent, hashMonth, hashYear, month, year) {
            const element = document.createElement('div'),
            children = document.createElement('div');
            element.classList.add('monthContainer');
            if (hashMonth != month) {
                element.classList.add('hide');
            }
            children.className = 'month';
            children.innerHTML = `${month}月`;
            element.appendChild(children);
            parent.appendChild(element);
            getDays(element, hashMonth, hashYear, month, year);
            super(element, (event) => {
                const parent = this.parent,
                element = this.element,
                children = this.children;
                if (event.target == element || event.target == children) {
                    if (element.classList.contains('hide')) {
                        element.classList.remove('hide');
                    } else {
                        element.classList.add('hide');
                    }
                    const monthContainers = document.querySelectorAll('.monthContainer');
                    for (const i of monthContainers) {
                        if (i != element && !i.classList.contains('hide')) {
                            i.classList.add('hide');
                        }
                    }
                    parent.scrollTop = element.offsetTop - monthContainers[0].offsetTop;
                }
            });
            this.parent = parent;
            this.children = children;
        }
    }

    // 年份按钮对象
    class YearContainer extends Btn {
        constructor(hashYear, year) {
            const element = document.createElement('div'),
            children = document.createElement('div'),
            monthsContainer = document.createElement('div');
            element.classList.add('yearContainer');
            if (hashYear != year) {
                element.classList.add('hide');
            }
            children.className = 'year';
            children.innerHTML = `${year}年`;
            element.appendChild(children);
            monthsContainer.className = 'monthsContainer';
            element.appendChild(monthsContainer);
            document.querySelector('nav').appendChild(element);
            getMonths(monthsContainer, hashYear, year);
            super(element, (event) => {
                const element = this.element,
                children = this.children;
                if (event.target == element || event.target == children) {
                    if (element.classList.contains('hide')) {
                        element.classList.remove('hide');
                    } else {
                        element.classList.add('hide');
                    }
                }
            });
            this.children = children;
        }
    }
    
    // 替换字符串中对应的所有子字符串
    function replaceAll(str1, str2, str3) {
        while (str1.includes(str2)) {
            str1 = str1.replace(str2, str3);
        }
        return str1;
    };

    // 移除字符串中对应的所有子字符串
    function deleteAll(str1, str2) {
        return replaceAll(str1, str2, '');
    };

    // 获取当前所需日记信息
    function getInfo() {
        const hash = location.hash.replace('#', '').split('/'),
        year = hash.length == 3 ? hash[0] : null,
        month = hash.length == 3 ? hash[1] : null,
        day = hash.length == 3 ? hash[2] : null;
        return {
            year,
            month,
            day
        }
    }

    // 发起请求
    function get(path) {
        return fetch(path)
        .then(response => response.text());
    }

    // 获取日记文本
    function getText(path) {
        const {year, month, day} = getInfo();
        get(path ? path : `page/${year}/${month}/${day}.txt`)
        .then(text => {
            if (path) {
                date.innerHTML = path.replace('.txt', '');
            } else {
                date.innerHTML = `${year}年${month}月${day}日`;
            }
            text = deleteAll(text, '\r').split('\n');
            while (article.querySelector('.text')) {
                article.removeChild(article.querySelector('.text'));
            }
            let number = 0;
            for (const i in text) {
                const line = document.createElement('div');
                line.className = 'text';
                number += (line.innerHTML = text[i]).length;
                article.appendChild(line);
            }
            length.innerHTML = `共${number}字`;
        });
    }

    // 获取日期信息
    function getDays(monthContainer, hashMonth, hashYear, month, year) {
        get(`page/${year}/${month}/index.txt`)
        .then((days) => {
            days = deleteAll(days, '\r').split('\n');
            state[year][month].need = days.length;
            // 获取需要的日期
            const hashDay = getInfo().day,
            {element, children} = new DayContainer(days, monthContainer, hashDay, hashMonth, hashYear, month, year),
            needLine = document.body.getAttribute('needLine');
            if (hashYear == year && hashMonth == month) {
                const monthContainers = monthContainer.parentElement;
                monthContainers.scrollTop = monthContainer.offsetTop - monthContainers.querySelector('.monthContainer').offsetTop;
                if (needLine) {
                    element.scrollTop = children[needLine].offsetTop - children[0].offsetTop;
                }
            }
            document.querySelector('nav').classList.remove('hide');
        });
    }

    // 获取月份信息
    function getMonths(monthsContainer, hashYear, year) {
        get(`page/${year}/index.txt`)
        .then((months) => {
            // 获取需要的月份
            const hashMonth = getInfo().month;
            months = deleteAll(months, '\r').split('\n');
            state[year].need = months.length;
            // 创造月份按钮
            for (const month of months) {
                state[year][month] = {
                    need: 0,
                    now: 0
                };
                new MonthContainer(monthsContainer, hashMonth, hashYear, month, year);
            }
        });
    };

    // 获取年份信息
    function getYears() {
        get('page/index.txt')
        .then((years) => {
            // 获取需要的年份
            const hashYear = getInfo().year;
            years = deleteAll(years, '\r').split('\n');
            state.need = years.length;
            state.now = 0;
            // 创造年份按钮
            for (const year of years) {
                state[year] = {
                    need: 0,
                    now: 0
                };
                new YearContainer(hashYear, year);
            }
        });
    };

    // 设置提示信息
    const setPromptText = (text) => {
        const promptElement = document.querySelector('#prompt');
        promptElement.innerHTML = text;
        promptElement.style.setProperty('--length', text.length);
        if (promptElement.getAttribute('timer')) {
            clearTimeout(promptElement.getAttribute('timer'));
        }
        if (!promptElement.classList.contains('show')) {
            promptElement.classList.add('show');
        }
        promptElement.setAttribute('timer', setTimeout(() => {
            promptElement.classList.remove('show');
            promptElement.removeAttribute('timer');
        }, 2000));
    };

    // 获取文章正文
    const getArticleText = () => {
        let text = '';
        const textElement = document.querySelector('article').querySelectorAll('.text');
        for (const i of textElement) {
            if (text != '') {
                text += '\r\n';
            }
            text += i.innerHTML;
        }
        return text;
    };

    // 朗读
    function speech(needVoice) {
        let text = getArticleText(),
        played = document.body.getAttribute('played') == 'true',
        lastText = document.body.getAttribute('lastText');
        const msg = new SpeechSynthesisUtterance();
        msg.addEventListener('start', () => {
            document.body.setAttribute('played', true);
            document.body.setAttribute('lastText', text);
            setPromptText('朗读已开始');
        });
        msg.addEventListener('end', () => {
            document.body.setAttribute('played', false);
            document.body.removeAttribute('lastText');
            setPromptText('朗读已结束');
        });
        if (text == '') {
            text = `最爱${boyOrGirlFriend}啦~`;
        }
        if (lastText != text) {
            window.speechSynthesis.cancel();
            msg.text = text;
            msg.lang = 'zh-CN';
            if (needVoice) {
                msg.voice = needVoice;
            }
            window.speechSynthesis.speak(msg);
        } else {
            if (played) {
                window.speechSynthesis.pause();
                setPromptText('朗读已暂停');
            } else {
                window.speechSynthesis.resume();
                setPromptText('朗读已恢复');
            }
            document.body.setAttribute('played', !played);
        }
    }

    // 复制
    function copy() {
        navigator.clipboard.writeText(getArticleText())
        .then(() => setPromptText('复制成功'), () => setPromptText('复制失败'));
    };

    // 截图
    async function screenshot() {
        const {year, month, day} = getInfo(),
        article = document.querySelector('article');
        if (year) {
            await get('picture.svg')
            .then(async (text) => {
                text = text.replace('${article}', article.innerHTML);
                await get('css/picture.css')
                .then(style => {
                    text = text.replace('${style}', style);
                });
                return text;
            })
            .then(async (text) => {
                await fetch('love.png')
                .then((response) => response.blob())
                .then(async (blob) => {
                    let reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.addEventListener('load', (e) => {
                        text = text.replace('${love}', e.target.result);
                        const data = new Blob([text], {
                            type: 'image/svg+xml;charset=utf-8'
                        });
                        reader = new FileReader();
                        reader.readAsDataURL(data);
                        reader.addEventListener('load', (e) => {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.addEventListener('load', () => {
                                const canvas = document.createElement('canvas'),
                                context = canvas.getContext('2d'),
                                clipCanvas = document.createElement('canvas'),
                                clipContext = clipCanvas.getContext('2d'),
                                info = document.querySelector('#info'),
                                width = info.offsetWidth / 0.7,
                                height = article.scrollHeight + width * 0.06;
                                canvas.width = width;
                                canvas.height = height;
                                context.drawImage(img, 0, 0, width, height);
                                clipCanvas.width = width * 0.8;
                                clipCanvas.height = height;
                                clipContext.drawImage(canvas, width * 0.1, 0, width * 0.8, height, 0, 0, width * 0.8, height);
                                clipCanvas.toBlob((blob) => {
                                    if (window.ClipboardItem) {
                                        const data = [new ClipboardItem({
                                            [blob.type]: blob
                                        })];
                                        navigator.clipboard.write(data)
                                        .then(() => setPromptText('截图成功'), () => setPromptText('截图失败'));
                                    } else {
                                        const a = document.createElement('a');
                                        a.href = clipCanvas.toDataURL('image/png');
                                        a.download = `笨蛋日记-${year}年${month}月${day}日`;
                                        a.click();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        }
    }

    // 下载
    const download = () => {
        const a = document.createElement('a'),
        {year, month, day} = getInfo();
        if (year) {
            a.href = `page/${year}/${month}/${day}.txt`;
            a.download = `${title}-${year}年${month}月${day}日.txt`;
            a.click();
            setPromptText('正在下载');
        }
    };

    // 分享
    const share = () => {
        const year = document.body.getAttribute('year'),
        month = document.body.getAttribute('month'),
        day = document.body.getAttribute('day');
        if (year) {
            navigator.clipboard.writeText(`${location.origin}/#${year}/${month}/${day}`);
        } else {
            navigator.clipboard.writeText(location.origin);
        }
        setPromptText('分享链接已复制');
    };

    // hash值改变时改变页面
    function pageChange() {
        qrcode.makeCode(location.href);
        if (location.hash != '') {
            const {year, month, day} = getInfo();
            if (list.indexOf(`${year}/${month}/${day}`) > 0 || location.hash == '#') {
                getText();
            } else {
                getText('404 Not Found.txt');
            }
        }
    };

    // 页面初始化
    function pageInit() {
        pageChange();
    }

    // 初始化函数
    function init() {
        const home = document.querySelector('#home'),
        playBtn = document.querySelector('#musicControl').querySelector('.btn'),
        lyric = document.querySelector('#lyric'),
        date = document.querySelector('#date'),
        homeTitle = home.querySelector('.title'),
        btn = document.querySelector('#btnBox').querySelectorAll('.btn'),
        // 初始化LMusic
        music = new LMusic({
            container: '#music',
            src: 'LMusic',
            music: [{
                src: `/music/${musicName}.ogg`,
                cover: `/cover/${musicName}.jpg`,
                lyric: `/lyric/${musicName}.lmlrc`
            }],
            autoPlay: true
        });
        document.title = title;
        date.innerHTML = title;
        homeTitle.innerHTML = `&nbsp;${title}`;
        new Btn(home, () => {
            const now = document.querySelector('.now'),
            article = document.querySelector('article');
            if (now) {
                now.classList.remove('now');
            }
            date.innerHTML = title;
            document.querySelector('#length').innerHTML = '';
            while (document.querySelector('.text')) {
                article.removeChild(document.querySelector('.text'));
            }
            document.body.removeAttribute('year');
            document.body.removeAttribute('month');
            document.body.removeAttribute('day');
            location.hash = '';
        });
        new Btn(playBtn, () => {
            if (music.paused) {
                music.play();
            } else {
                music.pause();
            }
        });
        new Btn(lyric, (e) => {
            document.querySelector('#music').style.transform = 'translateY(0)';
            e.preventDefault();
        });
        // 判断浏览器是否支持朗读 不支持则隐藏按钮
        if ('speechSynthesis' in window) {
            let needVoice;
            document.body.setAttribute('played', false);
            new Btn(btn[0], () => {
                speech(needVoice);
            });
            const timer = setInterval(() => {
                const voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    for (const i of voices) {
                        if (i.lang == 'zh-CN' && i.name.includes('Xiaoyi')) {
                            needVoice = i;
                            break;
                        }
                    }
                    if (!needVoice) {
                        for (const i of voices) {
                            if (i.lang == 'zh-CN') {
                                needVoice = i;
                                break;
                            }
                        }
                    }
                    clearInterval(timer);
                }
            }, 1000);
        } else {
            btn[0].classList.add('hide');
        }
        new Btn(btn[1], copy);
        new Btn(btn[2], screenshot);
        new Btn(btn[3], download);
        new Btn(btn[4], share);
        new Btn(document.querySelector('#music').querySelector('.btn'), () => {
            document.querySelector('#music').style.transform = 'translateY(-100%)';
        });
        qrcode = new QRCode(document.querySelector("#qrcode"), {
            text: location.href,
            width: 128,
            height: 128,
            colorDark : "hsl(335, 80%, 35%)",
            colorLight : 'rgba(255, 255, 255, 0)',
            correctLevel : QRCode.CorrectLevel.M
        });
        window.addEventListener('DOMContentLoaded', () => {
            music.functions.stateChange.add((paused) => {
                if (paused) {
                    playBtn.innerHTML = '&#xe007;';
                } else {
                    playBtn.innerHTML = '&#xe008;';
                }
            });
            music.functions.lyricChange.add((lyricText) => {
                lyric.title = lyricText;
                lyric.innerHTML = lyricText;
            });
        });
        window.addEventListener('hashchange', pageChange);
        getYears();
    };

    init();
})();
