const tg = window.Telegram.WebApp;
tg.expand();

const spinButton = document.getElementById("spin-btn");
const resultText = document.getElementById("result");

function getTodayKey() {
    const userId = tg.initDataUnsafe?.user?.id || "guest";
    const today = new Date().toISOString().split('T')[0];
    return `spin_${userId}_${today}`;
}

function hasSpunToday() {
    return localStorage.getItem(getTodayKey()) !== null;
}

function saveSpinToday() {
    localStorage.setItem(getTodayKey(), "true");
}

function spinRoulette() {
    if (hasSpunToday()) {
        resultText.innerText = "❌ Вы уже крутили рулетку сегодня!";
        return;
    }

    const prizes = [
        "🌟 NFT-звезда",
        "📦 Стикерпак",
        "🎨 Тема Telegram",
        "😢 Пусто",
        "🔁 Повторная попытка"
    ];

    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    resultText.innerText = `🎁 Ваш приз: ${prize}`;
    saveSpinToday();
}

// Привязка кнопки к функции
spinButton.addEventListener("click", spinRoulette);
