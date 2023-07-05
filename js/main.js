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
class DayContainer extends Btn {
    constructor(parent, hashDay, day, month, year) {
        
    }
}

// 月份按钮对象
class MonthContainer extends Btn {
    constructor(parent, hashMonth, month, year) {
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
        getDays(month, element, year);
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
        document.querySelector('aside').appendChild(element);
        getMonths(year, monthsContainer);
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

// get方法请求
const get = (path, callback, ...args) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (args.length) {
                callback(xhr.responseText, ...args);
            } else {
                callback(xhr.responseText);
            }
        }
    };
    xhr.send();
};

// 替换字符串中对应的所有子字符串
const replaceAll = (str1, str2, str3) => {
    while (str1.includes(str2)) {
        str1 = str1.replace(str2, str3);
    }
    return str1;
};

// 移除字符串中对应的所有子字符串
const deleteAll = (str1, str2) => {
    return replaceAll(str1, str2, '');
};

// 获取日记文本
const getText = (year, month, day) => {
    get(`page/${year}/${month}/${day}.txt`, (text) => {
        const main = document.querySelector('main');
        document.querySelector('#date').innerHTML = `${year}年${month}月${day}日`;
        text = deleteAll(text, '\r').split('\n');
        while (document.querySelector('.text')) {
            main.removeChild(document.querySelector('.text'));
        }
        let length = 0;
        for (const index in text) {
            const line = document.createElement('div');
            line.className = 'text';
            line.innerHTML = text[index];
            length += text[index].length;
            main.appendChild(line);
        }
        document.querySelector('#length').innerHTML = `共${length}字`;
    });
};

// 创造日期按钮
const createDaysButton = (days, monthContainer, month, year) => {
    const dayContainer = document.createElement('div'),
    dayContainers = [],
    hashYear = document.body.getAttribute('year'),
    hashMonth = document.body.getAttribute('month'),
    hashDay = document.body.getAttribute('day');
    dayContainer.className = 'dayContainer';
    for (let i = 0; i < Math.ceil(days.length / 5); i++) {
        dayContainers[i] = document.createElement('div');
        dayContainers[i].className = 'dayContainers';
        dayContainer.appendChild(dayContainers[i]);
    }
    let i = 0,
    needDayLine;
    monthContainer.appendChild(dayContainer);
    for (const dayNumber of days) {
        const day = document.createElement('div');
        day.className = 'day';
        day.innerHTML = dayNumber;
        day.addEventListener('click', () => {
            const now = document.querySelector('.now');
            location.hash = `${year}/${month}/${dayNumber}`;
            if (now) {
                now.classList.remove('now');
            }
            day.classList.add('now');
        });
        if (year == hashYear && month == hashMonth && dayNumber == hashDay) {
            day.classList.add('now');
            needDayLine = Math.floor(i / 5);
        }
        dayContainers[Math.floor(i++ / 5)].appendChild(day);
    }
    if (hashYear == year && hashMonth == month) {
        const monthContainers = monthContainer.parentElement;
        monthContainers.scrollTop = monthContainer.offsetTop - monthContainers.querySelector('.monthContainer').offsetTop;
        if (needDayLine) {
            dayContainer.scrollTop = dayContainers[needDayLine].offsetTop - dayContainers[0].offsetTop;;
        }
    }
    document.querySelector('aside').classList.remove('hide');
};

// 获取日期信息
const getDays = (month, monthContainer, year) => {
    get(`page/${year}/${month}/index.txt`, (days) => {
        days = deleteAll(days, '\r').split('\n');
        createDaysButton(days, monthContainer, month, year);
    });
};

// 获取月份信息
const getMonths = (year, monthsContainer) => {
    get(`page/${year}/index.txt`, (months) => {
        months = deleteAll(months, '\r').split('\n');
        // 获取需要的月份
        const hashMonth = document.body.getAttribute('month');
        // 创造月份按钮
        for (const month of months) {
            new MonthContainer(monthsContainer, hashMonth, month, year);
        }
    });
};

// 获取年份信息
const getYears = () => {
    get('page/index.txt', (years) => {
        years = deleteAll(years, '\r').split('\n');
        // 获取需要的年份
        const hashYear = document.body.getAttribute('year');
        // 创造年份按钮
        for (const year of years) {
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

// 朗读
const speech = (needVoice) => {
    let text = '',
    played = document.body.getAttribute('played') == 'true',
    lastText = document.body.getAttribute('lastText');
    const textElement = document.querySelector('main').querySelectorAll('.text'),
    msg = new SpeechSynthesisUtterance();
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
    for (const i of textElement) {
        if (text != '') {
            text += '\r\n';
        }
        text += i.innerHTML;
    }
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
const copy = () => {
    let text = '';
    const textElement = document.querySelector('main').querySelectorAll('.text');
    for (const i of textElement) {
        if (text != '') {
            text += '\r\n';
        }
        text += i.innerHTML;
    }
    navigator.clipboard.writeText(text);
    setPromptText('复制成功');
};

// 截图
const screenshot = () => {
    const year = document.body.getAttribute('year'),
    month = document.body.getAttribute('month'),
    day = document.body.getAttribute('day');
    if (year) {
        const svg = document.createElement('svg'),
        foreignObject = document.createElement('foreignObject'),
        bodyMain = document.querySelector('main'),
        info = document.querySelector('#info'),
        main = bodyMain.cloneNode(true),
        style = document.createElement('style'),
        xhr = new XMLHttpRequest(),
        img = document.createElement('img'),
        width = info.offsetWidth / 0.7,
        height = bodyMain.scrollHeight + width * 0.06;
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');
        svg.appendChild(foreignObject);
        main.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        foreignObject.appendChild(main);
        main.appendChild(style);
        xhr.open('GET', 'love.png');
        xhr.responseType = 'blob';
        xhr.addEventListener('load', () => {
            const reader = new FileReader();
            reader.readAsDataURL(xhr.response);
            reader.addEventListener('load', (e) => {
                style.innerHTML = `
                    @font-face {
                        font-family: btnFont;
                        src: url('font/btnFont.woff2');
                    }
                    
                    foreignObject {
                        background: hsl(335, 50%, 80%);
                        color: #EEEEEE;
                    }
            
                    main {
                        display: flex;
                        flex-direction: column;
                        margin: 3vw auto;
                        padding: 2vw;
                        width: 70%;
                        background: hsl(335, 80%, 35%);
                        border-radius: 1vw;
                        overflow: auto;
                    }
            
                    #info {
                        text-align: center;
                    }
                    
                    .love {
                        font-family: 'btnFont';
                        display: inline-block;
                        width: 2vw;
                        font-size: 2vw;
                        line-height: 2em;
                        background-image: url(${e.target.result});
                        background-position: center;
                        background-size: 2vw 2vw;
                        background-repeat: no-repeat;
                        color: rgba(0, 0, 0, 0);
                    }
            
                    #date {
                        display: inline-block;
                        font-size: 2vw;
                        line-height: 2em;
                    }
            
                    #length {
                        display: inline-block;
                        font-size: 1.25vw;
                        line-height: 4vw;
                    }
                    
                    .text {
                        font-size: 1.5vw;
                        line-height: 2em;
                        text-indent: 2em;
                    }
                `;
                const data = new Blob([replaceAll(svg.outerHTML, 'foreignobject', 'foreignObject')], {
                    type: 'image/svg+xml;charset=utf-8'
                }),
                reader = new FileReader();
                reader.readAsDataURL(data);
                reader.addEventListener('load', (e) => {
                    img.src = e.target.result;
                    img.addEventListener('load', () => {
                        const canvas = document.createElement('canvas'),
                        context = canvas.getContext('2d'),
                        clipCanvas = document.createElement('canvas'),
                        clipContext = clipCanvas.getContext('2d'),
                        a = document.createElement('a');
                        canvas.width = width;
                        canvas.height = height;
                        context.drawImage(img, 0, 0, width, height);
                        clipCanvas.width = width * 0.8;
                        clipCanvas.height = height;
                        clipContext.drawImage(canvas, width * 0.1, 0, width * 0.8, height, 0, 0, width * 0.8, height);
                        a.href = clipCanvas.toDataURL('image/png');
                        a.download = `${title}-${year}年${month}月${day}日.png`;
                        a.click();
                    });
                });
            });
        });
        xhr.send();
        setPromptText('正在截图');
    }
}

// 下载
const download = () => {
    const a = document.createElement('a'),
    year = document.body.getAttribute('year'),
    month = document.body.getAttribute('month'),
    day = document.body.getAttribute('day');
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
const pageChange = () => {
    const hash = location.hash.replace('#', ''),
    year = hash.split('/')[0],
    month = hash.split('/')[1],
    day = hash.split('/')[2];
    if (year) {
        document.body.setAttribute('year', year);
    }
    if (month) {
        document.body.setAttribute('month', month);
    }
    if (day) {
        document.body.setAttribute('day', day);
    }
    if (year && month && day) {
        getText(year, month, day);
    }
};

// 初始化函数
const init = () => {
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
        main = document.querySelector('main');
        if (now) {
            now.classList.remove('now');
        }
        date.innerHTML = title;
        document.querySelector('#length').innerHTML = '';
        while (document.querySelector('.text')) {
            main.removeChild(document.querySelector('.text'));
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
    pageChange();
    getYears();
};

init();