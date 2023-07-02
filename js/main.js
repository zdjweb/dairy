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

// 移除字符串中对应的所有子字符串
const deleteAll = (str1, str2) => {
    while (str1.includes(str2)) {
        str1 = str1.replace(str2, '');
    }
    return str1;
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
            getText(year, month, dayNumber);
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

// 初始化函数
const init = () => {
    const home = document.querySelector('#home'),
    musicControl = document.querySelector('#musicControl'),
    btn = musicControl.querySelector('.btn'),
    lyric = document.querySelector('#lyric'),
    date = document.querySelector('#date'),
    homeTitle = home.querySelector('div'),
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
        const main = document.querySelector('main');
        date.innerHTML = title;
        document.querySelector('#length').innerHTML = '';
        while (document.querySelector('.text')) {
            main.removeChild(document.querySelector('.text'));
        }
    });
    btn.addEventListener('click', () => {
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
    document.querySelector('#music').querySelector('.return').addEventListener('click', () => {
        document.querySelector('#music').style.transform = 'translateY(-100%)';
    });
    window.addEventListener('DOMContentLoaded', () => {
        music.functions.stateChange.add((paused) => {
            if (paused) {
                btn.innerHTML = '&#xe602;';
            } else {
                btn.innerHTML = '&#xe603;';
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