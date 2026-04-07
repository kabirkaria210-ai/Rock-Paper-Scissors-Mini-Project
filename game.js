
const weaponBtns = document.querySelectorAll('.weapon-btn');
const playerEmoji = document.getElementById('playerEmoji');
const cpuEmoji = document.getElementById('cpuEmoji');
const playerChoice = document.getElementById('playerChoice');
const cpuChoice = document.getElementById('cpuChoice');
const resultBox = document.getElementById('resultBox');
const resultMessage = document.getElementById('resultMessage');
const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');
const tiesEl = document.getElementById('ties');
const resetBtn = document.getElementById('resetBtn');

let isPlaying = false;


async function playRound(choice) {
    if (isPlaying) return;
    isPlaying = true;

    weaponBtns.forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-choice="${choice}"]`).classList.add('selected');

    playerEmoji.textContent = '⏳';
    cpuEmoji.textContent = '🤔';
    playerChoice.textContent = '—';
    cpuChoice.textContent = '—';
    resultBox.className = 'result-box';
    resultMessage.textContent = 'Thinking...';

    try {
        const response = await fetch('/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choice })
        });

        const data = await response.json();

        if (!response.ok) {
            resultMessage.textContent = 'Something went wrong. Try again!';
            isPlaying = false;
            return;
        }

        await delay(300);

        animateEmoji(playerEmoji, data.user_emoji);
        await delay(150);
        animateEmoji(cpuEmoji, data.computer_emoji);

        playerChoice.textContent = data.user_label;
        cpuChoice.textContent = data.computer_label;

        await delay(200);
        resultBox.className = `result-box ${data.result}`;
        resultMessage.textContent = data.message;

        updateScore(winsEl, data.score.wins);
        updateScore(lossesEl, data.score.losses);
        updateScore(tiesEl, data.score.ties);

        if (data.result === 'loss') {
            setTimeout(() => cpuEmoji.classList.add('shake'), 100);
            setTimeout(() => cpuEmoji.classList.remove('shake'), 600);
        }

    } catch (err) {
        resultMessage.textContent = 'Network error. Is Flask running?';
        console.error(err);
    }

    isPlaying = false;
}

function animateEmoji(el, newEmoji) {
    el.classList.remove('pop');
    void el.offsetWidth; // force reflow
    el.textContent = newEmoji;
    el.classList.add('pop');
}

function updateScore(el, value) {
    if (el.textContent !== String(value)) {
        el.textContent = value;
        el.classList.remove('score-bump');
        void el.offsetWidth;
        el.classList.add('score-bump');
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function resetScore() {
    try {
        await fetch('/reset', { method: 'POST' });
        winsEl.textContent = '0';
        lossesEl.textContent = '0';
        tiesEl.textContent = '0';
        playerEmoji.textContent = '❓';
        cpuEmoji.textContent = '🤖';
        playerChoice.textContent = '—';
        cpuChoice.textContent = '—';
        resultBox.className = 'result-box';
        resultMessage.textContent = 'Choose your weapon to begin!';
        weaponBtns.forEach(btn => btn.classList.remove('selected'));
    } catch (err) {
        console.error('Reset failed:', err);
    }
}
weaponBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playRound(btn.dataset.choice);
    });
});

resetBtn.addEventListener('click', resetScore);

document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (['R', 'P', 'S'].includes(key) && !isPlaying) {
        playRound(key);
    }
});
