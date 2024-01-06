const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array]

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]

        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');

    if (dimensions % 2 !== 0) {
        throw new Error("Размерность доски должна быть четным числом.");
    }

    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);

    // Очищаем текущую доску
    selectors.board.innerHTML = '';
    // Задаем стиль грида для доски
    selectors.board.style.gridTemplateColumns = `repeat(${dimensions}, auto)`;

    // Создаем и добавляем новые карточки
    items.forEach(item => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">${item}</div>
        `;
        selectors.board.appendChild(cardElement);
    });
};

const startGame = () => {
    clearInterval(state.loop); // Добавьте эту строку для убеждения, что предыдущий таймер очищен

    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerText = `Ходов: ${state.totalFlips}`;
        selectors.timer.innerText = `Время: ${state.totalTime} сек`;
    }, 1000);
}

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}

const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame()
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        setTimeout(() => {
            flipBackCards()
        }, 500)
    }
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    Вы выиграли!<br />
                    используя <span class="highlight">${state.totalFlips}</span> хода<br />
                    за <span class="highlight">${state.totalTime}</span> секунд
                </span>
            `

            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

generateGame()
attachEventListeners()
document.addEventListener('click', function(event) {
    if (event.target.id === 'restart') {
        resetGame();
    }
});

function resetGame() {
    clearInterval(state.loop); // Очистка интервала

    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;

    selectors.moves.innerText = `Ходов: ${state.totalFlips}`;
    selectors.timer.innerText = `Время: ${state.totalTime} сек`;
    selectors.start.classList.remove('disabled');
    selectors.boardContainer.classList.remove('flipped');

    selectors.board.innerHTML = ''; // Очистка доски перед генерацией новой

    generateGame(); // Генерация новой доски
}
