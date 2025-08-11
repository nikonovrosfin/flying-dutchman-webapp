const tg = window.Telegram.WebApp;
tg.expand();

// 🎯 Настройки канваса и рулетки
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 140;

const prizes = [
    "🌟 Звезда",
    "🌟 Звезда",
    "🎨 NFT",
    "😢 Пусто",
    "🔁 Повтор"
];

const colors = ["#00ffe0", "#00ccaa", "#009977", "#006644", "#003322"];
const segments = prizes.length;
const segmentAngle = (2 * Math.PI) / segments;

let rotation = 0;
let spinning = false;

// 🎨 Отрисовка рулетки
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < segments; i++) {
        const startAngle = i * segmentAngle + rotation;
        const endAngle = startAngle + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = "#00ffe0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "16px sans-serif";
        ctx.fillText(prizes[i], radius - 10, 10);
        ctx.restore();
    }

    // Стрелка
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 15, centerY - radius + 10);
    ctx.lineTo(centerX + 15, centerY - radius + 10);
    ctx.closePath();
    ctx.fillStyle = "#00ffe0";
    ctx.fill();
}

// 🔐 Ключи локального хранилища
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

// 🎯 Обработка ЗАДАНИЙ по отдельности
function getTaskKey(task) {
    const userId = tg.initDataUnsafe?.user?.id || "guest";
    const today = new Date().toISOString().split('T')[0];
    return `task_${task}_${userId}_${today}`;
}

function completeTask(task) {
    localStorage.setItem(getTaskKey(task), "true");
}

function hasCompletedAllTasks() {
    return (
        localStorage.getItem(getTaskKey("story")) === "true" &&
        localStorage.getItem(getTaskKey("subscribe")) === "true" &&
        localStorage.getItem(getTaskKey("invite")) === "true"
    );
}

function checkTasksProgress() {
    const resultText = document.getElementById("result");
    if (hasCompletedAllTasks()) {
        resultText.innerText = "✅ Все задания выполнены — теперь вы можете крутить рулетку повторно!";
    } else {
        resultText.innerText = "📌 Выполняйте все задания, чтобы получить вторую попытку!";
    }
}

// Проверка можно ли крутить
function canSpin() {
    return !hasSpunToday() || hasCompletedAllTasks();
}

// 🔄 Анимация кручения рулетки
function spinRoulette() {
    const resultText = document.getElementById("result");
    if (spinning) return;

    if (!canSpin()) {
        resultText.innerText = "❌ Чтобы крутить рулетку повторно, выполните все задания ниже!";
        return;
    }

    spinning = true;
    let spins = 0;
    const maxSpins = 30 + Math.floor(Math.random() * 30);

    function animate() {
        rotation += 0.3 + spins * 0.01;
        rotation %= 2 * Math.PI;
        drawWheel();

        spins++;
        if (spins < maxSpins) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;

            const prizeIndex = Math.floor((segments - (rotation / segmentAngle)) % segments);
            const index = prizeIndex < 0 ? prizeIndex + segments : prizeIndex;
            const prize = prizes[index];

            resultText.innerText = `🎁 Ваш приз: ${prize}`;

            // Сохраняем спин
            if (!hasSpunToday()) {
                saveSpinToday();
            }

            // Если это была вторая попытка — сбрасываем задания до завтра
            if (hasCompletedAllTasks()) {
                localStorage.removeItem(getTaskKey("story"));
                localStorage.removeItem(getTaskKey("subscribe"));
                localStorage.removeItem(getTaskKey("invite"));
            }

            // 🔔 [НА СЛЕДУЮЩЕМ ШАГЕ]: отправим приз в Telegram
        }
    }

    animate();
}

// 🎯 Обработчики заданий
document.getElementById("story-btn").addEventListener("click", () => {
    tg.openLink("https://t.me/YourBotUsername?start=story");
    completeTask("story");
    checkTasksProgress();
});

document.getElementById("subscribe-btn").addEventListener("click", () => {
    tg.openLink("https://t.me/YourChannelName");
    completeTask("subscribe");
    checkTasksProgress();
});

document.getElementById("invite-btn").addEventListener("click", () => {
    navigator.clipboard.writeText("https://t.me/YourBotUsername?start=referral");
    alert("Ссылка скопирована! Пригласите 3 друзей и нажмите кнопку снова.");
    completeTask("invite");
    checkTasksProgress();
});

// 🟢 Кнопка запуска рулетки
document.getElementById("spin-btn").addEventListener("click", spinRoulette);

// 🧱 Инициализация
drawWheel();
