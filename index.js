const { Telegraf } = require('telegraf');
const { Client } = require('@notionhq/client');

const bot = new Telegraf('Bot Id'); // Замените на Id Вашего бота 
const notion = new Client({ auth: 'Norton sekret key' }); //Замените на ваш ключ Norton
const databaseId = 'Id базы данных'; // Замените на ID вашей базы данных в Notion
const yourTelegramId = 'Id telegram'; // Замените на ваш Telegram ID. Если немного изменить код можно добавлять Id людей которые будут ставить задачи вам

bot.start((ctx) => {
  ctx.reply('Добро пожаловать! Вы можете добавлять задачи, отправив сообщение с вашей задачей.');
});

bot.on('text', async (ctx) => {
  const task = ctx.message.text;

  if (ctx.from.id.toString() !== yourTelegramId) {
    // Если Telegram ID отправителя не совпадает с вашим Telegram ID, отправляем сообщение об ошибке
    ctx.reply('Вы не имеете права добавлять задачи.');
    return;
  }

  try {
    // Отправляем задачу в базу данных Notion
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              type: 'text',
              text: {
                content: task,
              },
            },
          ],
        },
        Status: {
          type: 'select',
          select: {
            name: 'Backlog',
          },
        },
        Source: {
          type: 'select',
          select: {
            name: 'Telegram',
          },
        },
        TGAuthor: {
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: ctx.from.first_name, // Имя пользователя, добавившего задачу
              },
            },
          ],
        },
      },
    });
    
    // Извлекаем ID созданной задачи
    const taskId = response.id;

    // Создаем URL задачи на основе ID
    const taskURL = `https://www.notion.so/${databaseId}/${taskId.replace(/-/g, '')}`;

    // Отправляем подтверждение и ссылку в Telegram
    ctx.reply(`Задача успешно добавлена в Backlog в Notion!\nСсылка на задачу: ${taskURL}`);
  } catch (error) {
    console.error('Ошибка при добавлении задачи в Notion:', error);
    ctx.reply('Произошла ошибка при добавлении задачи. Попробуйте позже.');
  }
});
// Закрываем блок обработки команды 'text'

bot.launch();
