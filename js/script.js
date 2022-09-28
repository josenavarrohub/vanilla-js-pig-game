'use strict';

// State
const state = {
    activePlayer: undefined,
    score: Array(2),
    turnTotal: Array(2),
};

// Elements
const element = {
    score: [
        document.querySelector('#score0'),
        document.querySelector('#score1'),
    ],
    turnTotal: [
        document.querySelector('#turnTotal0'),
        document.querySelector('#turnTotal1'),
    ],
    dice: document.querySelector('.dice'),
    btnNew: document.querySelector('.btn--new'),
    btnRoll: document.querySelector('.btn--roll'),
    btnHold: document.querySelector('.btn--hold'),
    player: [
        document.querySelector('.player--0'),
        document.querySelector('.player--1'),
    ],
}

// Function: Initialization
const init = () => {
    // State
    state.activePlayer = 0;
    state.score[0] = 0;
    state.score[1] = 0;
    state.turnTotal[0] = 0;
    state.turnTotal[1] = 0;

    // Elements
    element.score[0].textContent = state.score[0];
    element.score[1].textContent = state.score[1];
    element.turnTotal[0].textContent = state.turnTotal[0];
    element.turnTotal[1].textContent = state.turnTotal[1];
    element.dice.classList.add('hidden');
};
init();

// Function: Reset turn total
const resetTurnTotal = () => {
    state.turnTotal[state.activePlayer] = 0;
    element.turnTotal[state.activePlayer].textContent = 0;
};

// Function: Switch player
const switchPlayer = () => {
    state.activePlayer = state.activePlayer === 0 ? 1 : 0;
    element.player[0].classList.toggle('player--active');
    element.player[1].classList.toggle('player--active');
};

// Function: Debug state
const debugState = () => {
    console.clear();
    console.log("=========================");
    console.log('   📢Current state 📢   ');
    console.log("=========================");
    console.table(state);
};

// Event listener: User rolls dice
element.btnRoll.addEventListener('click', () => {
    // Play sound
    const audio = new Audio('mp3/roll-dice.mp3');
    audio.play();

    // Generate random dice roll
    const dice = Math.floor(Math.random() * 6) + 1;
    
    // Display dice roll
    element.dice.src = `img/dice/${dice}.svg`;
    element.dice.classList.remove('hidden');

    // If dice is different than 1
    if (dice !== 1) {
        // Add dice roll to turn total
        state.turnTotal[state.activePlayer] += dice;

        // Display new turn total
        element.turnTotal[state.activePlayer].textContent = state.turnTotal[state.activePlayer];
    } else {
        // Reset turn total
        resetTurnTotal();

        // Switch player
        switchPlayer();
    }

    // Debug
    debugState();
});

// Event listener: User holds score
element.btnHold.addEventListener('click', () => {
    // Add turn total to score
    state.score[state.activePlayer] += state.turnTotal[state.activePlayer];
    element.score[state.activePlayer].textContent = state.score[state.activePlayer];

    // Reset turn total
    resetTurnTotal();

    // If score >= 100
    if (state.score[state.activePlayer] >= 100) {
        // Play sound
        const audio = new Audio('mp3/winner.mp3');
        audio.play();

        // Player wins
        element.player[state.activePlayer].classList.add('player--winner');

        // Disable buttons
        element.btnRoll.disabled = true;
        element.btnHold.disabled = true;

        // Hide dice
        element.dice.classList.add('hidden');
    } else {
        // Switch player
        switchPlayer();
    }    

    // Debug
    debugState();
});

// Event: User starts a new game
element.btnNew.addEventListener('click', () => {
    // Clean player
    element.player[state.activePlayer].classList.remove('player--active');
    element.player[state.activePlayer].classList.remove('player--winner');
    element.player[0].classList.add('player--active');

    // Disable buttons
    element.btnRoll.disabled = false;
    element.btnHold.disabled = false;

    // Initialization
    init();
});
