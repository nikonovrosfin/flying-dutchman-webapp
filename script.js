const tg = window.Telegram.WebApp;
tg.expand();

// 🎯 Настройки канваса и рулетки
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 140;

const prizes = [
    "🌟 NFT-звезда",
    "📦 Стикерпак",
    "🎨 Тема Telegram",
    "😢 Пусто",
    "🔁 Повторная попытка"
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

// Проверка можно ли крутить
function canSpin() {
    return !hasSpunToday() || hasCompletedTasks();
}

// 🔄 Анимация кручения рулетки
function spinRoulette() {
    const resultText = document.getElementById("result");
    if (spinning) return;

    if (!canSpin()) {
        resultText.innerText = "❌ Чтобы крутить рулетку повторно, выполните одно из заданий ниже!";
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

            // Если спин по заданию — сброс на завтра
            if (hasCompletedTasks()) {
                localStorage.removeItem(getTasksKey());
            }
        }
    }

    animate();
}

// 🎯 Обработчики заданий
document.getElementById("story-btn").addEventListener("click", () => {
    tg.openLink("https://t.me/YourBotUsername?start=story");
    saveTasksCompleted();
    document.getElementById("result").innerText = "✅ Задание выполнено — теперь вы можете крутить рулетку повторно!";
});

document.getElementById("subscribe-btn").addEventListener("click", () => {
    tg.openLink("https://t.me/YourChannelName");
    saveTasksCompleted();
    document.getElementById("result").innerText = "✅ Задание выполнено — теперь вы можете крутить рулетку повторно!";
});

document.getElementById("invite-btn").addEventListener("click", () => {
    navigator.clipboard.writeText("https://t.me/YourBotUsername?start=referral");
    alert("Ссылка для приглашения скопирована! Пригласите 3 друзей и нажмите кнопку снова.");
    saveTasksCompleted();
    document.getElementById("result").innerText = "✅ Задание выполнено — теперь вы можете крутить рулетку повторно!";
});

// 🟢 Кнопка запуска рулетки
document.getElementById("spin-btn").addEventListener("click", spinRoulette);

// 🧱 Инициализация
drawWheel();
