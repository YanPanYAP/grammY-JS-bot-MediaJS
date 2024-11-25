require('dotenv').config();
const schedule = require('node-schedule');
const { format, addDays, startOfWeek } = require('date-fns');
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard, InputFile } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const { emojiParser } = require("@grammyjs/emoji");

const bot = new Bot(process.env.BOT_TOKEN);
bot.use(hydrate());
bot.use(emojiParser());

//ID лидерров
const BOT_DEVELOPERS_ALL = [123456789, 123456789];
const BOT_EDITER_CLICKER = [123456789];
const BOT_EDITER_INFO = [123456789];
const BOT_EDITER_VIDEO = [];  
const BOT_EDITER_SOUND = [123456789];
const BOT_EDITER_SMM = [123456789];
const BOT_EDITER_BOROVLYANI = [123456789];

//массивы для хранения
let clearPosition = '-';
//видео
let directorPosition = Array(6).fill('-');
let camPearson = Array(6).fill('-');
let stabPearson = Array(6).fill('-');
//технического
let morningPositionClick = Array(6).fill('-');
let dayPositionClick = Array(6).fill('-');
let eveningPositionClick = Array(6).fill('-');
let tursdayPositionClick = Array(6).fill('-');
//звукового
let morningPositionSound = Array(6).fill('Илья');
let dayPositionSound = Array(6).fill('Илья');
let eveningPositionSound = Array(6).fill('Илья');
let tursdayPositionSound = Array(6).fill('Илья');
//smm
let dayPositionSmm = Array(3).fill('-');
let eveningPositionSmm = Array(3).fill('-');
//информационного
let videoPositionInfo = Array(3).fill('-');
let speakPositionInfo = Array(3).fill('-');
//боровлян
let borovlyaniPositions = Array(3).fill('Семен');

let dates = ['ЧТ', 'ВС', 'ЧТ', 'ВС', 'ЧТ', 'ВС'];
let usernames = Array(57).fill('');

const team = {
    sound: [
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: '-', last_name: '', username: '', id: '' }
    ],

    smm: [
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: '-', last_name: '', username: '', id: '' }
    ],

    info: [
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: '-', last_name: '', username: '', id: '' }
    ],

    clicker: [
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: '-', last_name: '', username: '', id: '' }
    ],
  
    video: [
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: '-', last_name: '', username: '', id: '' }
    ],

    borovlyani: [
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: 'Иван', last_name: 'Иванович', username: 't.me/ivan', id: 123456789 },
        { name: '-', last_name: '', username: '', id: '' }
    ]
};

let teamID = [];
function addUniqueID(id) {
    if (id && !teamID.includes(id)) {
        teamID.push(id);
    }
}
function populateTeamID() {
    Object.keys(team).forEach((teamKey) => {
        team[teamKey].forEach((member) => {
            addUniqueID(member.id);
        });
    });
}

bot.use(async (ctx, next) => {
    ctx.config = {
      botDevelopers: BOT_DEVELOPERS_ALL,
      botEditerClicker: BOT_EDITER_CLICKER,
      botEditerInfo: BOT_EDITER_INFO,
      botEditerVideo: BOT_EDITER_VIDEO,
      botEditerSound: BOT_EDITER_SOUND,
      botEditerSmm: BOT_EDITER_SMM,
      botEditerBorovlyani: BOT_EDITER_BOROVLYANI,
      isDeveloper: BOT_DEVELOPERS_ALL.includes(ctx.from?.id),
      isEditerClicker: BOT_EDITER_CLICKER.includes(ctx.from?.id),
      isEditerInfo: BOT_EDITER_INFO.includes(ctx.from?.id),
      isEditerVideo: BOT_EDITER_VIDEO.includes(ctx.from?.id),
      isEditerSound: BOT_EDITER_SOUND.includes(ctx.from?.id),
      isEditerSmm: BOT_EDITER_SMM.includes(ctx.from?.id),
      isEditerBorovlyani: BOT_EDITER_BOROVLYANI.includes(ctx.from?.id),
    };

    await next();
});

bot.api.setMyCommands([
    {
        command: 'start',
        description: 'Запустить бота'
    },
    {
        command: 'help',
        description: 'Получить инструкцию по настройке расписания'
    }
]);

//настройки дат
{
function getNextThursdaysAndSundays(startDate) {
    const foundDates = [];
    let current = startDate;

    while (foundDates.length < 6) {
        if (current.getDay() === 4 || current.getDay() === 0) {
            foundDates.push(format(current, 'dd.MM.yyyy'));
        }
        current = addDays(current, 1);
    }
    return foundDates;
}

function generateInitialDatesAndPositions() {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const initialDates = getNextThursdaysAndSundays(weekStart);
  
    dates = initialDates.map((date) => date);
}

bot.hears('Запустить даты', async (ctx) => {
    if (ctx.config.isDeveloper) {
        generateInitialDatesAndPositions();
        await ctx.reply('Даты загружены и готовы к настройке.', {
            reply_markup: settingsKeyboard2,
        });
    } else {
        await ctx.deleteMessage();
    }
});

function updateDatesAndPositions() {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const newDates = getNextThursdaysAndSundays(weekStart);
    dates = [...newDates];

    const shiftPositions = (positionsArray, shiftBy, clearValue) => {
        positionsArray.forEach((_, i) => {
            if (i < positionsArray.length - shiftBy) {
                positionsArray[i] = positionsArray[i + shiftBy];
            } else {
                positionsArray[i] = clearValue;
            }
        });
    };

    shiftPositions(directorPosition, 1, clearPosition);
    shiftPositions(camPearson, 1, clearPosition);
    shiftPositions(stabPearson, 1, clearPosition);
    shiftPositions(morningPositionClick, 2, clearPosition);
    shiftPositions(dayPositionClick, 2, clearPosition);
    shiftPositions(eveningPositionClick, 2, clearPosition);
    shiftPositions(tursdayPositionClick, 2, clearPosition);
    shiftPositions(morningPositionSound, 2, 'Иван');
    shiftPositions(dayPositionSound, 2, 'Иван');
    shiftPositions(eveningPositionSound, 2, 'Иван');
    shiftPositions(tursdayPositionSound, 2, 'Иван');
    shiftPositions(dayPositionSmm, 1, clearPosition);
    shiftPositions(eveningPositionSmm, 1, clearPosition);
    shiftPositions(videoPositionInfo, 1, clearPosition);
    shiftPositions(speakPositionInfo, 1, clearPosition);
    shiftPositions(borovlyaniPositions, 1, 'Иван');
}

schedule.scheduleJob('0 0 * * 1', function() {
    console.log('Running scheduled task to update dates and positions...');
    updateDatesAndPositions();
});

const messageTextTursday =  () => `<b>Расписание на четверг, ${dates[0]}</b>\n
Трансляция\n<blockquote>Режиссер: <a href="${usernames[0]}">${directorPosition[0]}</a>\nОператор: <a href="${usernames[1]}">${camPearson[0]}</a>\nСтаб: <a href="${usernames[2]}">${stabPearson[0]}</a></blockquote>
Кликер\n<blockquote><a href="${usernames[3]}">${tursdayPositionClick[0]}</a></blockquote>
Звук\n<blockquote><a href="${usernames[4]}">${tursdayPositionSound[0]}</a></blockquote>`;

const messageTextSunday = () => `<b>Расписание на воскресенье, ${dates[1]}</b>\n
Трансляция\n<blockquote>Режиссер: <a href="${usernames[5]}">${directorPosition[1]}</a>\nОператор: <a href="${usernames[6]}">${camPearson[1]}</a>\nСтаб: <a href="${usernames[7]}">${stabPearson[1]}</a></blockquote>
Кликеры\n<blockquote>10.00: <a href="${usernames[8]}">${morningPositionClick[1]}</a>\n12.30: <a href="${usernames[9]}">${dayPositionClick[1]}</a>\n19.00: <a href="${usernames[10]}">${eveningPositionClick[1]}</a></blockquote>
Истории\n<blockquote>12.30: <a href="${usernames[11]}">${dayPositionSmm[0]}</a>\n19.00: <a href="${usernames[12]}">${eveningPositionSmm[0]}</a></blockquote>
Звук\n<blockquote>10.00: <a href="${usernames[13]}">${morningPositionSound[1]}</a>\n12.30: <a href="${usernames[14]}">${dayPositionSound[1]}</a>\n19.00: <a href="${usernames[15]}">${eveningPositionSound[1]}</a></blockquote>
Объявления\n<blockquote>Ведущий: <a href="${usernames[16]}">${speakPositionInfo[0]}</a>\nОператор: <a href="${usernames[17]}">${videoPositionInfo[0]}</a></blockquote>
Боровляны\n<blockquote>10.00: <a href="${usernames[54]}">${borovlyaniPositions[0]}</a></blockquote>`;

schedule.scheduleJob('0 12 * * 6', function() {
    assignUsernames(); populateTeamID();
    const inlineKeyboard = new InlineKeyboard().text('Развернуть', 'timetable');
    for (const chatId of teamID) {
        bot.api.sendMessage(chatId, messageTextSunday(), {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
            disable_web_page_preview: true
        });
    }
});
schedule.scheduleJob('0 12 * * 3', function() {
    assignUsernames(); populateTeamID();
    const inlineKeyboard = new InlineKeyboard().text('Развернуть', 'timetable');
    for (const chatId of teamID) {
        bot.api.sendMessage(chatId, messageTextTursday(), {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
            disable_web_page_preview: true
        });
    }
});
}

//видео
{
function createVideoDateKeyboard() {
    return new InlineKeyboard()
        .text(dates[0], 'videodate1')
        .text(dates[1], 'videodate2').row()
        .text(dates[2], 'videodate3')
        .text(dates[3], 'videodate4').row()
        .text(dates[4], 'videodate5')
        .text(dates[5], 'videodate6');
}

const createVideoPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('Режиссер', `director${index}`)
        .text(directorPosition[index - 1], `director${index}`).row()
        .text('Камера 1', `cam${index}`)
        .text(camPearson[index - 1], `cam${index}`).row()
        .text('Стаб', `stab${index}`)
        .text(stabPearson[index - 1], `stab${index}`).row()
        .text('Назад', 'videoBack');
};

const createNameKeyboard = (index, type) => {
    const keyboard = new InlineKeyboard();

    team.video.forEach((person, idx) => {
        keyboard.text(person.name, `${type}Click${index}_${idx + 1}`).row();
    });

    return keyboard;
};

const handlePositionSelection = (ctx, index) => {
    return ctx.callbackQuery.message.editText('Выберите позицию:', {
        reply_markup: createVideoPositionsKeyboard(index),
    });
};

const handleNameSelection = (ctx, index, type, array) => {
    const nameIndex = parseInt(ctx.callbackQuery.data.split('_')[1]) - 1;
    array[index - 1] = team.video[nameIndex].name;
    return handlePositionSelection(ctx, index);
};

const registerCallbackHandlers = (index) => {
    bot.callbackQuery(`videodate${index}`, async (ctx) => {
        await handlePositionSelection(ctx, index);
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`director${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createNameKeyboard(index, 'director'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`cam${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createNameKeyboard(index, 'cam'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`stab${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createNameKeyboard(index, 'stab'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    ['director', 'cam', 'stab'].forEach(type => {
        for (let i = 1; i <= team.video.length; i++) {
            bot.callbackQuery(`${type}Click${index}_${i}`, async (ctx) => {
                await handleNameSelection(ctx, index, type, type === 'director' ? directorPosition : type === 'cam' ? camPearson : stabPearson);
                await ctx.answerCallbackQuery('Media JC');
            });
        }
    });
};

for (let i = 1; i <= 6; i++) {
    registerCallbackHandlers(i);
}

bot.callbackQuery('videoBack', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберете дату:', {
        reply_markup: createVideoDateKeyboard(),
    });
    await ctx.answerCallbackQuery('Media JC');
});
}

//информационного
{
function createInfoDateKeyboard() {
    return new InlineKeyboard()
        .text(dates[1], 'infoDate1').row()
        .text(dates[3], 'infoDate2').row()
        .text(dates[5], 'infoDate3');
}

const createInfoPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('Ведущий', `speakPositionInfo${index}`)
        .text(speakPositionInfo[index - 1], `speakPositionInfo${index}`).row()
        .text('Оператор', `videoPositionInfo${index}`)
        .text(videoPositionInfo[index - 1], `videoPositionInfo${index}`).row()
        .text('Назад', 'infoBack');
};

const createInfoNameKeyboard = (index, type) => {
    const keyboard = new InlineKeyboard();

    team.info.forEach((person, idx) => {
        keyboard.text(person.name, `${type}InfoClick${index}_${idx + 1}`).row();
    });

    return keyboard;
};

const handleInfoPositionSelection = (ctx, index) => {
    return ctx.callbackQuery.message.editText('Выберите позицию:', {
        reply_markup: createInfoPositionsKeyboard(index),
    });
};

const handleInfoNameSelection = (ctx, index, type, array) => {
    const nameIndex = parseInt(ctx.callbackQuery.data.split('_')[1]) - 1;
    array[index - 1] = team.info[nameIndex].name;
    return handleInfoPositionSelection(ctx, index);
};

const registerInfoCallbackHandlers = (index) => {
    bot.callbackQuery(`infoDate${index}`, async (ctx) => {
        await handleInfoPositionSelection(ctx, index);
        await ctx.answerCallbackQuery('Info JC');
    });

    bot.callbackQuery(`speakPositionInfo${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createInfoNameKeyboard(index, 'speak'),
        });
        await ctx.answerCallbackQuery('Info JC');
    });

    bot.callbackQuery(`videoPositionInfo${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createInfoNameKeyboard(index, 'video'),
        });
        await ctx.answerCallbackQuery('Info JC');
    });

    ['speak', 'video'].forEach(type => {
        for (let i = 1; i <= team.info.length; i++) {
            bot.callbackQuery(`${type}InfoClick${index}_${i}`, async (ctx) => {
                await handleInfoNameSelection(ctx, index, type, type === 'speak' ? speakPositionInfo : videoPositionInfo);  // Выбираем имя и возвращаемся к позиции
                await ctx.answerCallbackQuery('Info JC');
            });
        }
    });
};

[1, 2, 3].forEach((index) => {
    registerInfoCallbackHandlers(index);
});

bot.callbackQuery('infoBack', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберите дату:', {
        reply_markup: createInfoDateKeyboard(),
    });
    await ctx.answerCallbackQuery('Info JC');
});
}

//технического
{
function createClickerDateKeyboard() {
    return new InlineKeyboard()
        .text(dates[0], 'clickerDate1')
        .text(dates[1], 'clickerDate2').row()
        .text(dates[2], 'clickerDate3')
        .text(dates[3], 'clickerDate4').row()
        .text(dates[4], 'clickerDate5')
        .text(dates[5], 'clickerDate6');
}

const createClickerPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('10:00', `morningPositionClick${index}`)
        .text(morningPositionClick[index - 1], `morningPositionClick${index}`).row()
        .text('12:30', `dayPositionClick${index}`)
        .text(dayPositionClick[index - 1], `dayPositionClick${index}`).row()
        .text('19:00', `eveningPositionClick${index}`)
        .text(eveningPositionClick[index - 1], `eveningPositionClick${index}`).row()
        .text('Назад', 'clickerBack');
};

const createTursdayPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('19:00', `tursdayPositionClick${index}`)
        .text(tursdayPositionClick[index - 1], `tursdayPositionClick${index}`).row()
        .text('Назад', 'clickerBack');
};

const createClickerNameKeyboard = (index, type) => {
    const keyboard = new InlineKeyboard();

    team.clicker.forEach((person, idx) => {
        keyboard.text(person.name, `${type}ClickerClick${index}_${idx + 1}`).row();
    });

    return keyboard;
};

const handleClickerPositionSelection = (ctx, index) => {
    if (index % 2) {
        return ctx.callbackQuery.message.editText('Выберите позицию:', {
            reply_markup: createTursdayPositionsKeyboard(index),
        });
    } else {
        return ctx.callbackQuery.message.editText('Выберите позицию:', {
            reply_markup: createClickerPositionsKeyboard(index),
        });
    }
};

const handleClickerNameSelection = (ctx, index, type, array) => {
    const nameIndex = parseInt(ctx.callbackQuery.data.split('_')[1]) - 1;
    array[index - 1] = team.clicker[nameIndex].name;
    return handleClickerPositionSelection(ctx, index);
};

const registerClickerCallbackHandlers = (index) => {
    bot.callbackQuery(`clickerDate${index}`, async (ctx) => {
        await handleClickerPositionSelection(ctx, index);
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`morningPositionClick${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createClickerNameKeyboard(index, 'morning'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`dayPositionClick${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createClickerNameKeyboard(index, 'day'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`eveningPositionClick${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createClickerNameKeyboard(index, 'evening'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`tursdayPositionClick${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createClickerNameKeyboard(index, 'tursday'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    ['morning', 'day', 'evening', 'tursday'].forEach(type => {
        for (let i = 1; i <= team.clicker.length; i++) {
            bot.callbackQuery(`${type}ClickerClick${index}_${i}`, async (ctx) => {
                await handleClickerNameSelection(ctx, index, type, type === 'morning' ? morningPositionClick : type === 'day' ? dayPositionClick : type === 'evening' ? eveningPositionClick : tursdayPositionClick);
                await ctx.answerCallbackQuery('Media JC');
            });
        }
    });
};

for (let i = 1; i <= 6; i++) {
    registerClickerCallbackHandlers(i);
}

bot.callbackQuery('clickerBack', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберите дату:', {
        reply_markup: createClickerDateKeyboard(),
    });
    await ctx.answerCallbackQuery('Media JC');
});
}

//звукового
{
function createSoundDateKeyboard() {
    return new InlineKeyboard()
        .text(dates[0], 'soundDate1')
        .text(dates[1], 'soundDate2').row()
        .text(dates[2], 'soundDate3')
        .text(dates[3], 'soundDate4').row()
        .text(dates[4], 'soundDate5')
        .text(dates[5], 'soundDate6');
}

const createSoundPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('10:00', `morningPositionSound${index}`)
        .text(morningPositionSound[index - 1], `morningPositionSound${index}`).row()
        .text('12:30', `dayPositionSound${index}`)
        .text(dayPositionSound[index - 1], `dayPositionSound${index}`).row()
        .text('19:00', `eveningPositionSound${index}`)
        .text(eveningPositionSound[index - 1], `eveningPositionSound${index}`).row()
        .text('Назад', 'soundBack');
};

const createTursdayPositionsSoundKeyboard = (index) => {
    return new InlineKeyboard()
        .text('19:00', `tursdayPositionSound${index}`)
        .text(tursdayPositionSound[index - 1], `tursdayPositionSound${index}`).row()
        .text('Назад', 'soundBack');
};

const createSoundNameKeyboard = (index, type) => {
    const keyboard = new InlineKeyboard();

    team.sound.forEach((person, idx) => {
        keyboard.text(person.name, `${type}SoundClick${index}_${idx + 1}`).row();
    });

    return keyboard;
};

const handleSoundPositionSelection = (ctx, index) => {
    if (index % 2) {
        return ctx.callbackQuery.message.editText('Выберите позицию:', {
            reply_markup: createTursdayPositionsSoundKeyboard(index),
        });
    } else {
        return ctx.callbackQuery.message.editText('Выберите позицию:', {
            reply_markup: createSoundPositionsKeyboard(index),
        });
    }
};

const handleSoundNameSelection = (ctx, index, type, array) => {
    const nameIndex = parseInt(ctx.callbackQuery.data.split('_')[1]) - 1;
    array[index - 1] = team.sound[nameIndex].name;
    return handleSoundPositionSelection(ctx, index);
};

const registerSoundCallbackHandlers = (index) => {
    bot.callbackQuery(`soundDate${index}`, async (ctx) => {
        await handleSoundPositionSelection(ctx, index);
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`morningPositionSound${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createSoundNameKeyboard(index, 'morning'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`dayPositionSound${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createSoundNameKeyboard(index, 'day'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`eveningPositionSound${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createSoundNameKeyboard(index, 'evening'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`tursdayPositionSound${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createSoundNameKeyboard(index, 'tursday'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    ['morning', 'day', 'evening', 'tursday'].forEach(type => {
        for (let i = 1; i <= team.sound.length; i++) {
            bot.callbackQuery(`${type}SoundClick${index}_${i}`, async (ctx) => {
                await handleSoundNameSelection(ctx, index, type, type === 'morning' ? morningPositionSound : type === 'day' ? dayPositionSound : type === 'evening' ? eveningPositionSound : tursdayPositionSound);
                await ctx.answerCallbackQuery('Media JC');
            });
        }
    });
};

for (let i = 1; i <= 6; i++) {
    registerSoundCallbackHandlers(i);
}

bot.callbackQuery('soundBack', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберите дату:', {
        reply_markup: createSoundDateKeyboard(),
    });
    await ctx.answerCallbackQuery('Media JC');
});
}

//смм
{
function createSmmDateKeyboard() {
    return new InlineKeyboard()
        .text(dates[1], 'smmDate1').row()
        .text(dates[3], 'smmDate2').row()
        .text(dates[5], 'smmDate3');
}

const createSmmPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('12:30', `dayPositionSmm${index}`)
        .text(dayPositionSmm[index - 1], `dayPositionSmm${index}`).row()
        .text('19:00', `eveningPositionSmm${index}`)
        .text(eveningPositionSmm[index - 1], `eveningPositionSmm${index}`).row()
        .text('Назад', 'smmBack');
};

const createSmmNameKeyboard = (index, type) => {
    const keyboard = new InlineKeyboard();

    team.smm.forEach((person, idx) => {
        keyboard.text(person.name, `${type}SmmClick${index}_${idx + 1}`).row();
    });

    return keyboard;
};

const handleSmmPositionSelection = (ctx, index) => {
    return ctx.callbackQuery.message.editText('Выберите позицию:', {
        reply_markup: createSmmPositionsKeyboard(index),
    });
};

const handleSmmNameSelection = (ctx, index, type, array) => {
    const nameIndex = parseInt(ctx.callbackQuery.data.split('_')[1]) - 1;
    array[index - 1] = team.smm[nameIndex].name;
    return handleSmmPositionSelection(ctx, index);
};

const registerSmmCallbackHandlers = (index) => {
    bot.callbackQuery(`smmDate${index}`, async (ctx) => {
        await handleSmmPositionSelection(ctx, index);
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`dayPositionSmm${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createSmmNameKeyboard(index, 'day'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`eveningPositionSmm${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createSmmNameKeyboard(index, 'evening'),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    ['day', 'evening'].forEach(type => {
        for (let i = 1; i <= team.smm.length; i++) {
            bot.callbackQuery(`${type}SmmClick${index}_${i}`, async (ctx) => {
                await handleSmmNameSelection(ctx, index, type, type === 'day' ? dayPositionSmm : eveningPositionSmm);
                await ctx.answerCallbackQuery('Media JC');
            });
        }
    });
};

for (let i = 1; i <= 3; i += 1) {
    registerSmmCallbackHandlers(i);
}

bot.callbackQuery('smmBack', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберите дату:', {
        reply_markup: createSmmDateKeyboard(),
    });
    await ctx.answerCallbackQuery('Media JC');
});
}

//боровлян
{
function createBorovlyaniDateKeyboard() {
    return new InlineKeyboard()
        .text(dates[1], 'borovlyaniDate1').row()
        .text(dates[3], 'borovlyaniDate2').row()
        .text(dates[5], 'borovlyaniDate3');
}

const createBorovlyaniPositionsKeyboard = (index) => {
    return new InlineKeyboard()
        .text('10:00', `borovlyaniPositions${index}`)
        .text(borovlyaniPositions[index - 1], `borovlyaniPositions${index}`).row()
        .text('Назад', 'borovlyaniBack');
};

const createBorovlyaniNameKeyboard = (index) => {
    const keyboard = new InlineKeyboard();

    team.borovlyani.forEach((person, idx) => {
        keyboard.text(person.name, `borovlyaniClick${index}_${idx + 1}`).row();
    });

    return keyboard;
};

const handleBorovlyaniPositionSelection = (ctx, index) => {
    return ctx.callbackQuery.message.editText('Выберите позицию:', {
        reply_markup: createBorovlyaniPositionsKeyboard(index),
    });
};

const handleBorovlyaniNameSelection = (ctx, index) => {
    const nameIndex = parseInt(ctx.callbackQuery.data.split('_')[1]) - 1;
    borovlyaniPositions[index - 1] = team.borovlyani[nameIndex].name;
    return handleBorovlyaniPositionSelection(ctx, index);
};

const registerBorovlyaniCallbackHandlers = (index) => {
    bot.callbackQuery(`borovlyaniDate${index}`, async (ctx) => {
        await handleBorovlyaniPositionSelection(ctx, index);
        await ctx.answerCallbackQuery('Media JC');
    });

    bot.callbackQuery(`borovlyaniPositions${index}`, async (ctx) => {
        await ctx.callbackQuery.message.editText('Выберите имя:', {
            reply_markup: createBorovlyaniNameKeyboard(index),
        });
        await ctx.answerCallbackQuery('Media JC');
    });

    team.borovlyani.forEach((person, idx) => {
        bot.callbackQuery(`borovlyaniClick${index}_${idx + 1}`, async (ctx) => {
            await handleBorovlyaniNameSelection(ctx, index);
            await ctx.answerCallbackQuery(`Media JC`);
        });
    });
};

for (let i = 1; i <= 3; i += 1) {
    registerBorovlyaniCallbackHandlers(i);
}

bot.callbackQuery('borovlyaniBack', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберите дату:', {
        reply_markup: createBorovlyaniDateKeyboard(),
    });
    await ctx.answerCallbackQuery('Media JC');
});
}

{
bot.command('start', async (ctx) => {
    populateTeamID();
    if (teamID.includes(ctx.chat.id)) {
        ctx.react("🥰");
        await ctx.api.sendPhoto(
            ctx.chat.id,
            new InputFile("./mainImage.png"),
            {
                caption: `Привет! Это информационный бот Media JC в котором можно смотреть наше расписание.\n\nСнизу вы найдете кнопки, по которым можно получить всю необходимую информацю.\n\nСпасибо, что служите вместе с нами 🧡`,
                reply_markup: settingsKeyboard2
            }
        );

        if (ctx.config.isDeveloper || ctx.config.isEditerVideo || ctx.config.isEditerInfo || ctx.config.isEditerClicker || ctx.config.isEditerSound || ctx.config.isEditerSmm || ctx.config.isEditerBorovlyani) {
            await ctx.reply(
`Вы - лидер, поэтому вам разрешено редактировать расписание. Чтобы его изменить:
<blockquote expandable>1. Отправьте в бот любое из слов:\nНастройки, настройки, settings, Settings
2. Выберете ваш отдел из предложенного списка.
3. Выберете дату.
4. Выберете позицию.
5. Выберете имя.
6. Повторяйте пункты 4 и 5, чтобы заполнить всее позиции, а затем нажмите кнопку "Назад".
7. Повторите пункты 3-6 для заполнения всего расписания.
8. Нажмите "Выход".</blockquote>`, {
                parse_mode: 'HTML'
            });
        };
    } else {
        await ctx.deleteMessage();
    };
});

bot.command('help', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerVideo || ctx.config.isEditerInfo || ctx.config.isEditerClicker || ctx.config.isEditerSound || ctx.config.isEditerSmm || ctx.config.isEditerBorovlyani) {
        await ctx.reply(
`Вы - лидер, поэтому вам разрешено редактировать расписание. Чтобы его изменить:
<blockquote expandable>1. Отправьте в бот любое из слов:\nНастройки, настройки, settings, Settings
2. Выберете ваш отдел из предложенного списка.
3. Выберете дату.
4. Выберете позицию.
5. Выберете имя.
6. Повторяйте пункты 4 и 5, чтобы заполнить всее позиции, а затем нажмите кнопку "Назад".
7. Повторите пункты 3-6 для заполнения всего расписания.
8. Нажмите "Выход".</blockquote>`, {
            parse_mode: 'HTML'
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('Правила команды', async (ctx) => {
    await ctx.reply('Текст', {
        parse_mode: 'HTML'
    });
});

bot.hears('Посвящение', async (ctx) => {
    await ctx.reply('Текст', {
        parse_mode: 'HTML'
    });
});
}

{
bot.hears('Расписание', async (ctx) => {
    assignUsernames();
    await ctx.reply(
`<b>Расписание на неделю</b>\n\n<b>    Четверг, ${dates[0]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[0]}">${directorPosition[0]}</a>\nОператор: <a href="${usernames[1]}">${camPearson[0]}</a>\nСтаб: <a href="${usernames[2]}">${stabPearson[0]}</a></blockquote>
Кликер\n<blockquote><a href="${usernames[3]}">${tursdayPositionClick[0]}</a></blockquote>
Звук\n<blockquote><a href="${usernames[4]}">${tursdayPositionSound[0]}</a></blockquote>
\n<b>    Воскресенье, ${dates[1]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[5]}">${directorPosition[1]}</a>\nОператор: <a href="${usernames[6]}">${camPearson[1]}</a>\nСтаб: <a href="${usernames[7]}">${stabPearson[1]}</a></blockquote>
Кликеры\n<blockquote>10.00: <a href="${usernames[8]}">${morningPositionClick[1]}</a>\n12.30: <a href="${usernames[9]}">${dayPositionClick[1]}</a>\n19.00: <a href="${usernames[10]}">${eveningPositionClick[1]}</a></blockquote>
Истории\n<blockquote>12.30: <a href="${usernames[11]}">${dayPositionSmm[0]}</a>\n19.00: <a href="${usernames[12]}">${eveningPositionSmm[0]}</a></blockquote>
Звук\n<blockquote>10.00: <a href="${usernames[13]}">${morningPositionSound[1]}</a>\n12.30: <a href="${usernames[14]}">${dayPositionSound[1]}</a>\n19.00: <a href="${usernames[15]}">${eveningPositionSound[1]}</a></blockquote>
Объявления\n<blockquote>Ведущий: <a href="${usernames[16]}">${speakPositionInfo[0]}</a>\nОператор: <a href="${usernames[17]}">${videoPositionInfo[0]}</a></blockquote>
Боровляны\n<blockquote>10.00: <a href="${usernames[54]}">${borovlyaniPositions[0]}</a></blockquote>`, {
        reply_markup: nextWeekTimetable,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    });
});

const timetable = new InlineKeyboard().text('Далее', 'timetable')
bot.callbackQuery('timetable', async (ctx) => {
    await ctx.callbackQuery.message.editText(
`<b>Расписание на неделю</b>\n\n<b>    Четверг, ${dates[0]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[0]}">${directorPosition[0]}</a>\nОператор: <a href="${usernames[1]}">${camPearson[0]}</a>\nСтаб: <a href="${usernames[2]}">${stabPearson[0]}</a></blockquote>
Кликер\n<blockquote><a href="${usernames[3]}">${tursdayPositionClick[0]}</a></blockquote>
Звук\n<blockquote><a href="${usernames[4]}">${tursdayPositionSound[0]}</a></blockquote>
\n<b>    Воскресенье, ${dates[1]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[5]}">${directorPosition[1]}</a>\nОператор: <a href="${usernames[6]}">${camPearson[1]}</a>\nСтаб: <a href="${usernames[7]}">${stabPearson[1]}</a></blockquote>
Кликеры\n<blockquote>10.00: <a href="${usernames[8]}">${morningPositionClick[1]}</a>\n12.30: <a href="${usernames[9]}">${dayPositionClick[1]}</a>\n19.00: <a href="${usernames[10]}">${eveningPositionClick[1]}</a></blockquote>
Истории\n<blockquote>12.30: <a href="${usernames[11]}">${dayPositionSmm[0]}</a>\n19.00: <a href="${usernames[12]}">${eveningPositionSmm[0]}</a></blockquote>
Звук\n<blockquote>10.00: <a href="${usernames[13]}">${morningPositionSound[1]}</a>\n12.30: <a href="${usernames[14]}">${dayPositionSound[1]}</a>\n19.00: <a href="${usernames[15]}">${eveningPositionSound[1]}</a></blockquote>
Объявления\n<blockquote>Ведущий: <a href="${usernames[16]}">${speakPositionInfo[0]}</a>\nОператор: <a href="${usernames[17]}">${videoPositionInfo[0]}</a></blockquote>
Боровляны\n<blockquote>10.00: <a href="${usernames[54]}">${borovlyaniPositions[0]}</a></blockquote>`, {
        parse_mode: 'HTML',
        reply_markup: nextWeekTimetable,
        disable_web_page_preview: true
    });
});

const nextWeekTimetable = new InlineKeyboard().text('Далее', 'nextWeekTimetable')
bot.callbackQuery('nextWeekTimetable', async (ctx) => {
    await ctx.callbackQuery.message.editText(
`<b>Расписание на неделю</b>\n\n<b>    Четверг, ${dates[2]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[18]}">${directorPosition[2]}</a>\nОператор: <a href="${usernames[19]}">${camPearson[2]}</a>\nСтаб: <a href="${usernames[20]}">${stabPearson[2]}</a></blockquote>
Кликер\n<blockquote><a href="${usernames[21]}">${tursdayPositionClick[2]}</a></blockquote>
Звук\n<blockquote><a href="${usernames[22]}">${tursdayPositionSound[2]}</a></blockquote>
\n<b>    Воскресенье, ${dates[3]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[23]}">${directorPosition[3]}</a>\nОператор: <a href="${usernames[24]}">${camPearson[3]}</a>\nСтаб: <a href="${usernames[25]}">${stabPearson[3]}</a></blockquote>
Кликеры\n<blockquote>10.00: <a href="${usernames[26]}">${morningPositionClick[3]}</a>\n12.30: <a href="${usernames[27]}">${dayPositionClick[3]}</a>\n19.00: <a href="${usernames[28]}">${eveningPositionClick[3]}</a></blockquote>
Истории\n<blockquote>12.30: <a href="${usernames[29]}">${dayPositionSmm[1]}</a>\n19.00: <a href="${usernames[30]}">${eveningPositionSmm[1]}</a></blockquote>
Звук\n<blockquote>10.00: <a href="${usernames[31]}">${morningPositionSound[3]}</a>\n12.30: <a href="${usernames[32]}">${dayPositionSound[3]}</a>\n19.00: <a href="${usernames[33]}">${eveningPositionSound[3]}</a></blockquote>
Объявления\n<blockquote>Ведущий: <a href="${usernames[34]}">${speakPositionInfo[1]}</a>\nОператор: <a href="${usernames[35]}">${videoPositionInfo[1]}</a></blockquote>
Боровляны\n<blockquote>10.00: <a href="${usernames[55]}">${borovlyaniPositions[1]}</a></blockquote>`, {
        parse_mode: 'HTML',
        reply_markup: afterNextWeekTimetable,
        disable_web_page_preview: true
    });
});

const afterNextWeekTimetable = new InlineKeyboard().text('Далее', 'afterNextWeekTimetable')
bot.callbackQuery('afterNextWeekTimetable', async (ctx) => {
    await ctx.callbackQuery.message.editText(
`<b>Расписание на неделю</b>\n\n<b>    Четверг, ${dates[4]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[36]}">${directorPosition[4]}</a>\nОператор: <a href="${usernames[37]}">${camPearson[4]}</a>\nСтаб: <a href="${usernames[38]}">${stabPearson[4]}</a></blockquote>
Кликер\n<blockquote><a href="${usernames[39]}">${tursdayPositionClick[4]}</a></blockquote>
Звук\n<blockquote><a href="${usernames[40]}">${tursdayPositionSound[4]}</a></blockquote>
\n<b>    Воскресенье, ${dates[5]}</b>
Трансляция\n<blockquote>Режиссер: <a href="${usernames[41]}">${directorPosition[5]}</a>\nОператор: <a href="${usernames[42]}">${camPearson[5]}</a>\nСтаб: <a href="${usernames[43]}">${stabPearson[5]}</a></blockquote>
Кликеры\n<blockquote>10.00: <a href="${usernames[44]}">${morningPositionClick[5]}</a>\n12.30: <a href="${usernames[45]}">${dayPositionClick[5]}</a>\n19.00: <a href="${usernames[46]}">${eveningPositionClick[5]}</a></blockquote>
Истории\n<blockquote>12.30: <a href="${usernames[47]}">${dayPositionSmm[2]}</a>\n19.00: <a href="${usernames[48]}">${eveningPositionSmm[2]}</a></blockquote>
Звук\n<blockquote>10.00: <a href="${usernames[49]}">${morningPositionSound[5]}</a>\n12.30: <a href="${usernames[50]}">${dayPositionSound[5]}</a>\n19.00: <a href="${usernames[51]}">${eveningPositionSound[5]}</a></blockquote>
Объявления\n<blockquote>Ведущий: <a href="${usernames[52]}">${speakPositionInfo[2]}</a>\nОператор: <a href="${usernames[53]}">${videoPositionInfo[2]}</a></blockquote>
Боровляны\n<blockquote>10.00: <a href="${usernames[56]}">${borovlyaniPositions[2]}</a></blockquote>`, {
        parse_mode: 'HTML',
        reply_markup: timetable,
        disable_web_page_preview: true
    });
});
}

const assignUsernames = () => {
    const allTeamMembers = [
        ...team.clicker,
        ...team.video,
        ...team.info,
        ...team.smm,
        ...team.sound
    ];

    const findUserByName = (name) => {
        const person = allTeamMembers.find(member => member.name === name);
        return person ? person.username : '';
    };

    usernames[0] = findUserByName(directorPosition[0]) || '';  // Режиссер
    usernames[1] = findUserByName(camPearson[0]) || '';        // Оператор
    usernames[2] = findUserByName(stabPearson[0]) || '';       // Стаб
    usernames[3] = findUserByName(tursdayPositionClick[0]) || '';  // Кликер
    usernames[4] = findUserByName(tursdayPositionSound[0]) || '';  // Звук
    usernames[5] = findUserByName(directorPosition[1]) || '';  // Режиссер
    usernames[6] = findUserByName(camPearson[1]) || '';        // Оператор
    usernames[7] = findUserByName(stabPearson[1]) || '';       // Стаб
    usernames[8] = findUserByName(morningPositionClick[1]) || '';  // Кликер 10:00
    usernames[9] = findUserByName(dayPositionClick[1]) || '';      // Кликер 12:30
    usernames[10] = findUserByName(eveningPositionClick[1]) || ''; // Кликер 19:00
    usernames[11] = findUserByName(dayPositionSmm[0]) || '';       // SMM 12:30
    usernames[12] = findUserByName(eveningPositionSmm[0]) || '';   // SMM 19:00
    usernames[13] = findUserByName(morningPositionSound[1]) || ''; // Звук 10:00
    usernames[14] = findUserByName(dayPositionSound[1]) || '';     // Звук 12:30
    usernames[15] = findUserByName(eveningPositionSound[1]) || ''; // Звук 19:00
    usernames[16] = findUserByName(speakPositionInfo[0]) || '';    // Ведущий
    usernames[17] = findUserByName(videoPositionInfo[0]) || '';    // Оператор
    usernames[54] = findUserByName(borovlyaniPositions[0]) || '';  // Боровляны

    // Расписание на вторую неделю
    usernames[18] = findUserByName(directorPosition[2]) || '';  // Режиссер
    usernames[19] = findUserByName(camPearson[2]) || '';        // Оператор
    usernames[20] = findUserByName(stabPearson[2]) || '';       // Стаб
    usernames[21] = findUserByName(tursdayPositionClick[2]) || '';  // Кликер
    usernames[22] = findUserByName(tursdayPositionSound[2]) || '';  // Звук
    usernames[23] = findUserByName(directorPosition[3]) || '';  // Режиссер
    usernames[24] = findUserByName(camPearson[3]) || '';        // Оператор
    usernames[25] = findUserByName(stabPearson[3]) || '';       // Стаб
    usernames[26] = findUserByName(morningPositionClick[3]) || '';  // Кликер 10:00
    usernames[27] = findUserByName(dayPositionClick[3]) || '';      // Кликер 12:30
    usernames[28] = findUserByName(eveningPositionClick[3]) || ''; // Кликер 19:00
    usernames[29] = findUserByName(dayPositionSmm[1]) || '';       // SMM 12:30
    usernames[30] = findUserByName(eveningPositionSmm[1]) || '';   // SMM 19:00
    usernames[31] = findUserByName(morningPositionSound[3]) || ''; // Звук 10:00
    usernames[32] = findUserByName(dayPositionSound[3]) || '';     // Звук 12:30
    usernames[33] = findUserByName(eveningPositionSound[3]) || ''; // Звук 19:00
    usernames[34] = findUserByName(speakPositionInfo[1]) || '';    // Ведущий
    usernames[35] = findUserByName(videoPositionInfo[1]) || '';    // Оператор
    usernames[55] = findUserByName(borovlyaniPositions[1]) || '';  // Боровляны

    // Расписание на третью неделю
    usernames[36] = findUserByName(directorPosition[4]) || '';  // Режиссер
    usernames[37] = findUserByName(camPearson[4]) || '';        // Оператор
    usernames[38] = findUserByName(stabPearson[4]) || '';       // Стаб
    usernames[39] = findUserByName(tursdayPositionClick[4]) || '';  // Кликер
    usernames[40] = findUserByName(tursdayPositionSound[4]) || '';  // Звук
    usernames[41] = findUserByName(directorPosition[5]) || '';  // Режиссер
    usernames[42] = findUserByName(camPearson[5]) || '';        // Оператор
    usernames[43] = findUserByName(stabPearson[5]) || '';       // Стаб
    usernames[44] = findUserByName(morningPositionClick[5]) || '';  // Кликер 10:00
    usernames[45] = findUserByName(dayPositionClick[5]) || '';      // Кликер 12:30
    usernames[46] = findUserByName(eveningPositionClick[5]) || ''; // Кликер 19:00
    usernames[47] = findUserByName(dayPositionSmm[2]) || '';       // SMM 12:30
    usernames[48] = findUserByName(eveningPositionSmm[2]) || '';   // SMM 19:00
    usernames[49] = findUserByName(morningPositionSound[5]) || ''; // Звук 10:00
    usernames[50] = findUserByName(dayPositionSound[5]) || '';     // Звук 12:30
    usernames[51] = findUserByName(eveningPositionSound[5]) || ''; // Звук 19:00
    usernames[52] = findUserByName(speakPositionInfo[2]) || '';    // Ведущий
    usernames[53] = findUserByName(videoPositionInfo[2]) || '';    // Оператор
    usernames[56] = findUserByName(borovlyaniPositions[2]) || '';  // Боровляны
};

const settingsLables2 = ['Расписание', 'Правила команды', 'Посвящение']
const rows = settingsLables2.map((label) => {
    return [
        Keyboard.text(label)
    ]
});
const settingsKeyboard2 = Keyboard.from(rows).resized();

{
bot.hears(['Настройки', 'настройки', 'settings', 'Settings'], async (ctx)=> {
    if (ctx.config.isDeveloper) {

        const settingsLables = ['Видео', 'Технический', 'Информационный', 'SMM', 'Звук', 'Боровляны', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerVideo) {
        const settingsLables = ['Видео', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerInfo) {
        const settingsLables = ['Информационный', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerClicker) {
        const settingsLables = ['Технический', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerSound) {
        const settingsLables = ['Звук', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerSMM) {
        const settingsLables = ['SMM', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerSMM) {
        const settingsLables = ['SMM', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else if (ctx.config.isEditerBorovlyani) {
        const settingsLables = ['Боровляны', 'Выход']
        const rows = settingsLables.map((label) => {
            return [
                Keyboard.text(label)
            ]
        })
        const settingsKeyboard = Keyboard.from(rows).resized()
        await ctx.reply('Вы вошли в режим редактирования!', {
            reply_markup: settingsKeyboard
        });
    } else {
        await ctx.deleteMessage();
    };
});

bot.hears('Видео', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerVideo) {
        const keyboardVideo = createVideoDateKeyboard();
        await ctx.reply('Настройка расписания видео отдела.', {
            reply_markup: keyboardVideo,
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('Технический', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerClicker) {
        const keyboardClicker = createClickerDateKeyboard();
        await ctx.reply('Настройка расписания технического отдела.', {
            reply_markup: keyboardClicker,
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('Информационный', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerInfo) {
        const keyboardInfo = createInfoDateKeyboard();
        await ctx.reply('Настройка расписания информационного отдела.', {
            reply_markup: keyboardInfo,
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('Звук', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerSound) {
        const keyboardClicker = createSoundDateKeyboard();
        await ctx.reply('Настройка расписания звукового отдела.', {
            reply_markup: keyboardClicker,
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('SMM', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerSmm) {
        const keyboardClicker = createSmmDateKeyboard();
        await ctx.reply('Настройка расписания smm отдела.', {
            reply_markup: keyboardClicker,
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('Боровляны', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerBorovlyani) {
        const keyboardBorovlyani = createBorovlyaniDateKeyboard();
        await ctx.reply('Настройка расписания Боровлян.', {
            reply_markup: keyboardBorovlyani,
        });
    } else {
        await ctx.deleteMessage();
    }
});

bot.hears('Выход', async (ctx) => {
    if (ctx.config.isDeveloper || ctx.config.isEditerVideo || ctx.config.isEditerInfo || ctx.config.isEditerClicker || ctx.config.isEditerSound || ctx.config.isEditerSmm) {
        await ctx.reply('Спасибо за ваше служение 🧡', {
            reply_markup: settingsKeyboard2,
        });
    } else {
        await ctx.deleteMessage();
    }
});
}

bot.on('message', async (ctx) => {
    await ctx.deleteMessage();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error whhile handing update ${ctx.update.update_id}:`);
    const e = err.error;

    if (e instanceof GrammyError) {
        console.log("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
})

bot.start();