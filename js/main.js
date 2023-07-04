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
    document.body.setAttribute('year', year);
    document.body.setAttribute('month', month);
    document.body.setAttribute('day', day);
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
    dayContainers = [];
    dayContainer.className = 'dayContainer';
    for (let i = 0; i < Math.ceil(days.length / 5); i++) {
        dayContainers[i] = document.createElement('div');
        dayContainers[i].className = 'dayContainers';
        dayContainer.appendChild(dayContainers[i]);
    }
    let i = 0;
    for (const dayNumber of days) {
        const day = document.createElement('div');
        day.className = 'day';
        day.innerHTML = dayNumber;
        day.addEventListener('click', () => {
            const now = document.querySelector('.now');
            getText(year, month, dayNumber);
            if (now) {
                now.classList.remove('now');
            }
            day.classList.add('now');
        });
        dayContainers[Math.floor(i++ / 5)].appendChild(day);
    }
    monthContainer.appendChild(dayContainer);
};

// 获取日期信息
const getDays = (month, monthContainer, year) => {
    get(`page/${year}/${month}/index.txt`, (days) => {
        days = deleteAll(days, '\r').split('\n');
        createDaysButton(days, monthContainer, month, year);
    });
};

// 创造月份按钮
const createMonthsButton = (months, monthsContainer, year) => {
    for (const monthNumber of months) {
        const monthContainer = document.createElement('div'),
        month = document.createElement('div');
        monthContainer.classList.add('monthContainer');
        monthContainer.classList.add('hide');
        monthContainer.addEventListener('click', (event) => {
            if (event.target == monthContainer || event.target == month) {
                if (monthContainer.classList.contains('hide')) {
                    monthContainer.classList.remove('hide');
                } else {
                    monthContainer.classList.add('hide');
                }
                const monthContainers = document.querySelectorAll('.monthContainer');
                for (const i of monthContainers) {
                    if (i != monthContainer && !i.classList.contains('hide')) {
                        i.classList.add('hide');
                    }
                }
                monthsContainer.scrollTop = monthContainer.offsetTop - monthContainers[0].offsetTop;
            }
        });
        month.className = 'month';
        month.innerHTML = monthNumber + '月';
        monthContainer.appendChild(month);
        monthsContainer.appendChild(monthContainer);
        getDays(monthNumber, monthContainer, year);
    }
};

// 获取月份信息
const getMonths = (year, monthsContainer) => {
    get(`page/${year}/index.txt`, (months) => {
        months = deleteAll(months, '\r').split('\n');
        createMonthsButton(months, monthsContainer, year);
    });
};

// 创造年份按钮
const createYearsButton = (years) => {
    for (const yearNumber of years) {
        const yearContainer = document.createElement('div'),
        year = document.createElement('div'),
        monthsContainer = document.createElement('div');
        yearContainer.classList.add('yearContainer');
        yearContainer.classList.add('hide');
        yearContainer.addEventListener('click', (event) => {
            if (event.target == yearContainer || event.target == year) {
                if (yearContainer.classList.contains('hide')) {
                    yearContainer.classList.remove('hide');
                } else {
                    yearContainer.classList.add('hide');
                }
            }
        });
        year.className = 'year';
        year.innerHTML = yearNumber + '年';
        yearContainer.appendChild(year);
        monthsContainer.className = 'monthsContainer';
        yearContainer.appendChild(monthsContainer);
        document.querySelector('aside').appendChild(yearContainer);
        getMonths(yearNumber, monthsContainer, year);
    }
};

// 获取年份信息
const getYears = () => {
    get('page/index.txt', (years) => {
        years = deleteAll(years, '\r').split('\n');
        createYearsButton(years);
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

// 下载日记
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

// 初始化函数
const init = () => {
    const home = document.querySelector('#home'),
    playBtn = document.querySelector('#musicControl').querySelector('.btn'),
    lyric = document.querySelector('#lyric'),
    date = document.querySelector('#date'),
    homeTitle = home.querySelector('div'),
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
    home.addEventListener('click', () => {
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
    });
    playBtn.addEventListener('click', () => {
        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }
    });
    lyric.addEventListener('click', (e) => {
        document.querySelector('#music').style.transform = 'translateY(0)';
        e.preventDefault();
    });
    btn[0].addEventListener('click', screenshot);
    if ('speechSynthesis' in window) {
        let voices,
        needVoices,
        played = false,
        lastText;
        const timer = setInterval(() => {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                for (const i of voices) {
                    if (i.lang == 'zh-CN' && i.name.includes('Xiaoyi')) {
                        needVoices = i;
                        break;
                    }
                }
                if (!needVoices) {
                    for (const i of voices) {
                        if (i.lang == 'zh-CN') {
                            needVoices = i;
                            break;
                        }
                    }
                }
                btn[1].addEventListener('click', () => {
                    let text = '';
                    const textElement = document.querySelector('main').querySelectorAll('.text'),
                    msg = new SpeechSynthesisUtterance();
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
                        played = true;
                        msg.text = text;
                        msg.lang = 'zh-CN';
                        msg.voice = needVoices;
                        window.speechSynthesis.speak(msg);
                        setPromptText('朗读已开始');
                    } else {
                        if (played) {
                            window.speechSynthesis.pause();
                            setPromptText('朗读已暂停');
                        } else {
                            window.speechSynthesis.resume();
                            setPromptText('朗读已恢复');
                        }
                        played = !played;
                    }
                    lastText = text;
                    msg.addEventListener('end', () => {
                        played = false;
                        lastText = null;
                        setPromptText('朗读已结束');
                    });
                });
                clearInterval(timer);
            }
        }, 1000);
    }
    btn[2].addEventListener('click', () => {
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
    });
    btn[3].addEventListener('click', download);
    document.querySelector('#music').querySelector('.return').addEventListener('click', () => {
        document.querySelector('#music').style.transform = 'translateY(-100%)';
    });
    window.addEventListener('DOMContentLoaded', () => {
        music.functions.stateChange.add((paused) => {
            if (paused) {
                playBtn.innerHTML = '&#xe602;';
            } else {
                playBtn.innerHTML = '&#xe603;';
            }
        });
        music.functions.lyricChange.add((lyricText) => {
            lyric.title = lyricText;
            lyric.innerHTML = lyricText;
        });
    });
    getYears();
};

init();