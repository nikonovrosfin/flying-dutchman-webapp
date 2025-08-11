const tg = window.Telegram.WebApp;
tg.expand();

const spinButton = document.getElementById("spin-btn");
const resultText = document.getElementById("result");

// Ключ для хранения, крутили ли сегодня рулетку
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

// Ключ для хранения, выполнил ли задания
function getTasksKey() {
    const userId = tg.initDataUnsafe?.user?.id || "guest";
    const today = new Date().toISOString().split('T')[0];
    return `tasks_completed_${userId}_${today}`;
}

function hasCompletedTasks() {
    return localStorage.getItem(getTasksKey()) === "true";
}

function saveTasksCompleted() {
    localStorage.setItem(getTasksKey(), "true");
}

// Проверяем, можно ли крутить рулетку
function canSpin() {
    return !hasSpunToday() || hasCompletedTasks();
}

function spinRoulette() {
    if (!canSpin()) {
        resultText.innerText = "❌ Чтобы крутить рулетку повторно, выполните одно из заданий ниже!";
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

    // Если первый спин сегодня — сохраняем
    if (!hasSpunToday()) {
        saveSpinToday();
    }

    // Если рулетка крутится повторно после выполнения задания — сбросим статус задач, чтобы они можно было делать заново завтра
    if (hasCompletedTasks()) {
        localStorage.removeItem(getTasksKey());
    }
}

// Обработчики для кнопок заданий — добавь эти кнопки в index.html с id:
// "story-btn", "subscribe-btn", "invite-btn"

document.getElementById("story-btn").addEventListener("click", () => {
    tg.openLink("https://t.me/YourBotUsername?start=story");
    saveTasksCompleted();
    resultText.innerText = "✅ Задание выполнено — теперь вы можете крутить рулетку повторно!";
});

document.getElementById("subscribe-btn").addEventListener("click", () => {
    tg.openLink("https://t.me/YourChannelName");
    saveTasksCompleted();
    resultText.innerText = "✅ Задание выполнено — теперь вы можете крутить рулетку повторно!";
});

document.getElementById("invite-btn").addEventListener("click", () => {
    navigator.clipboard.writeText("https://t.me/YourBotUsername?start=referral");
    alert("Ссылка для приглашения скопирована! Пригласите 3 друзей и нажмите кнопку снова.");
    saveTasksCompleted();
    resultText.innerText = "✅ Задание выполнено — теперь вы можете крутить рулетку повторно!";
});

// Привязка кнопки к функции кручения рулетки
spinButton.addEventListener("click", spinRoulette);
