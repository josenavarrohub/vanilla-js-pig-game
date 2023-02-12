'use strict';

/* ================== Debugging ================== */
const debugApp = () => {
  console.clear();
  console.log('*******************');
  console.log(`👤 ${accounts.length} accounts 👤`);
  console.log('*******************');
  accounts.forEach(e => console.log(e));
};

/* ================== App Settings ================== */
const debugAppEnabled = true;
const autoLogout = 120 // Seconds

/* ================== Elements ================== */
const element = {
  module: {
    login: document.querySelector('.m-login'),
    dashboard: document.querySelector('.m-dashboard'),
  },
  login: {
    msg: document.querySelector('.m-login__msg'),
    username: document.querySelector('.m-login__username'),
    password: document.querySelector('.m-login__password'),
    send: document.querySelector('.m-login__send'),
  },
  welcome: document.querySelector('.c-navbar__welcome'),
  logout: document.querySelector('.c-navbar__logout'),
  movements: {
    timeout: document.querySelector('.c-movements__timeout'), 
    body: document.querySelector('.c-movements__body'),
  },
  summary: {
    balance: document.querySelector('.c-summary__balance'),
    deposits: document.querySelector('.c-summary__deposits'),
    withdrawals: document.querySelector('.c-summary__withdrawals'),
    interests: document.querySelector('.c-summary__interests'),
    interestRate: document.querySelector('.c-summary__interest-rate'),
  },
  transfers: {
    username: document.querySelector('.c-transfers__username'),
    amount: document.querySelector('.c-transfers__amount'),
    send: document.querySelector('.c-transfers__send'),
  },
  loan: {
    amount: document.querySelector('.c-loan__amount'),
    send: document.querySelector('.c-loan__send'),
  },
  delete: {
    username: document.querySelector('.c-delete__username'),
    password: document.querySelector('.c-delete__password'),
    send: document.querySelector('.c-delete__send'),
  },
};

/* ================== App logic ================== */

// Global variables
let account;
let timerInterval;

// Get and set data
const getAccount = (username, password) => accounts.find(e => e.username === username && e.password === +password);
const getDeposits = movements => movements.filter(e => e > 0).reduce((accu, e) => accu + e);
const getWithdrawals = movements => movements.filter(e => e < 0).reduce((accu, e) => accu + e);
const getInterests = account => getDeposits(account.movements) * account.interestRate;
const setBalance = account => account.balance = getDeposits(account.movements) + getWithdrawals(account.movements) - getInterests(account);

// Log in
const login = (username, password) => {
  account = getAccount(username, password);
  if (account) {
    element.login.msg.textContent = 'Please enter your credentials';
    element.login.username.value = element.login.password.value = '';
    element.login.password.blur();
    element.login.send.blur();
    element.module.login.classList.add('d-none');
    element.module.dashboard.classList.remove('d-none');
    displayWelcome(account);
    initAutoLogout();
    refreshDashboard(account)
  } else {
    element.login.msg.textContent = '🤚 Username or password incorrect!';
  }
};

// Log out
const logout = () => {
  account = null;
  clearInterval(timerInterval);
  element.module.login.classList.remove('d-none');
  element.module.dashboard.classList.add('d-none');
};

// Initiate automatic log out
const initAutoLogout = () => {
  let seconds = autoLogout;
  const updateTimer = () => {
    const ii = String(Math.trunc(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    element.movements.timeout.textContent = `${ii}:${ss}`;
    if (seconds === 0) {
      clearInterval(timerInterval);
      logout();
    }
    seconds--;
  };
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
};

// Display the welcome message
const displayWelcome = ({ fullName }) => element.welcome.textContent = fullName;

// Format amount
const formatAmount = (amount, locale, currency) => new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: currency,
}).format(amount);

// Format percentage
const formatPercentage = (value, locale) => new Intl.NumberFormat(locale, {
  style: 'percent'
}).format(value);

// Format date and time
const formatDate = (ISO8601, locale) => {
  const date = new Date(ISO8601);
  return new Intl.DateTimeFormat(locale).format(date);
};

// Display movements
const displayMovements = ({ movements, movementsDates, locale, currency }) => {
  element.movements.body.innerHTML = '';
  movements.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const badge = movement > 0 ? 'success' : 'danger';
    const tableRow = `
      <tr>
        <td><span class="badge bg-${badge}">${type}</span></td>
        <td class="movement">${formatAmount(movement, locale, currency)}</td>
        <td class="movement">${formatDate(movementsDates.at(i), locale)}</td>
      </tr>
    `;
    element.movements.body.insertAdjacentHTML('afterbegin', tableRow);
  });
  debugAppEnabled && debugApp();
};

// Display summary
const displaySummary = account => {
  element.summary.balance.classList.add(account.balance >= 0 ? 'bg-success' : 'bg-danger');
  element.summary.balance.textContent = formatAmount(account.balance, account.locale, account.currency);
  element.summary.deposits.textContent = formatAmount(getDeposits(account.movements), account.locale, account.currency);
  element.summary.withdrawals.textContent = formatAmount(getWithdrawals(account.movements), account.locale, account.currency);
  element.summary.interests.textContent = formatAmount(getInterests(account), account.locale, account.currency);
  element.summary.interestRate.textContent = formatPercentage(account.interestRate, account.locale);  
}

// Refresh dashboard
const refreshDashboard = account => {
  setBalance(account);
  displayMovements(account);
  displaySummary(account);
};

// Transfer money
const transferMoney = (account, recipient, amount) => {
  if (
    account.username !== recipient?.username &&
    recipient?.username &&
    account.balance >= amount &&
    amount > 0
  ) {
    new Audio('mp3/action.mp3').play();
    account.movements.push(-amount);
    recipient.movements.push(amount);
    const date = new Date().toISOString();
    account.movementsDates.push(date);
    recipient.movementsDates.push(date);
    refreshDashboard(account);
    element.transfers.username.value = element.transfers.amount.value = '';
    element.transfers.send.blur();
    debugAppEnabled && debugApp();
  }
};

// Request loan
const requestLoan = (account, amount) => {
  if (
    account.movements.some(e => e >= amount * 0.1) &&
    amount > 0
  ) {
    new Audio('mp3/action.mp3').play();
    account.movements.push(amount);
    account.movementsDates.push(new Date().toISOString());
    refreshDashboard(account);
    element.loan.amount.value = '';
    element.loan.amount.blur();
    element.loan.send.blur();
    debugAppEnabled && debugApp();
  }
};

// Delete account
const deleteAccount = (account, username, password) => {
  if (
    account.username === username &&
    account.password === +password
  ) {
    accounts.splice(
      accounts.findIndex(e => e.username === username),
      1,
    );
    element.delete.username.value = element.delete.password.value = '';
    element.delete.password.blur();
    element.delete.send.blur();
    logout();
  }
  debugAppEnabled && debugApp();
}

/* ================== Event listeners ================== */

// Log in
element.login.send.addEventListener('click', e => {
  e.preventDefault();
  login(
    element.login.username.value,
    element.login.password.value
  );
});

// Log out
element.logout.addEventListener('click', logout);

// User transfers money
element.transfers.send.addEventListener('click', e => {
  e.preventDefault();
  transferMoney(
    account,
    accounts.find(e => e.username === element.transfers.username.value),
    +element.transfers.amount.value
  );
});

// User requests a loan
element.loan.send.addEventListener('click', e => {
  e.preventDefault();
  requestLoan(
    account,
    +Math.floor(element.loan.amount.value)
  );
});

// User deletes account
element.delete.send.addEventListener('click', e => {
  e.preventDefault();
  deleteAccount(
    account,
    element.delete.username.value,
    element.delete.password.value,
  );
});

/* ================== UI tools ================== */
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
