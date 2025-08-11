from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo
from aiogram.utils import executor

TOKEN = '8306284175:AAG7nFV7-8T4cAj4Kthw1WN7knMl504zqLc'
bot = Bot(token=TOKEN)
dp = Dispatcher(bot)

WEBAPP_URL = 'https://flying-dutchman-webapp.vercel.app'  # ссылка на твой WebApp

@dp.message_handler(commands=['start'])
async def start_handler(message: types.Message):
    keyboard = types.InlineKeyboardMarkup()
    webapp_btn = types.InlineKeyboardButton(text="🎲 Крутить рулетку", web_app=WebAppInfo(url=WEBAPP_URL))
    keyboard.add(webapp_btn)
    await message.answer("Добро пожаловать, капитан!", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp)
