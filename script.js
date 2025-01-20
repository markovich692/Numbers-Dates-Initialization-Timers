'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //Creates an array of movements and dates objects

  const combinedMovementsDates = acc.movements.map(function (mov, i) {
    return {
      movement: mov,

      date: acc.movementsDates.at(i),
    };
  });

  // console.log(combinedMovementsDates);

  //Sort the combined Movements and Dates array
  if (sort) combinedMovementsDates.sort((a, b) => a.movement - b.movement);

  //Loops over each of the movements
  combinedMovementsDates.forEach(function (obj, i) {
    const { movement, date } = obj;

    const type = movement > 0 ? 'deposit' : 'withdrawal';

    //Loops over each of the movementsDate and stores it in the movementsDate variable
    const movementsDate = new Date(date);

    // console.log(movementsDate);

    const day = `${movementsDate.getDate()}`.padStart(2, '0');
    const month = `${movementsDate.getMonth() + 1}`.padStart(2, '0');
    const year = movementsDate.getFullYear();

    const fullDate = `${day}/${month}/${year}`;
    // console.log(fullDate);

    //HTML TEMPLATES

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>

    <div class="movements__date"> 
    ${fullDate}
    </div>
        <div class="movements__value">${movement.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // console.log(acc);

  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //Display current date and time
    const now = new Date();
    const curDay = `${now.getDate()}`.padStart(2, '0');
    const curMonth = `${now.getMonth() + 1}`.padStart(2, '0');
    const curYear = now.getFullYear();
    const curHours = `${now.getHours()}`.padStart(2, '0');
    const curMins = `${now.getMinutes()}`.padStart(2, '0');

    labelDate.textContent = `${curDay}/${curMonth}/${curYear}, ${curHours}:${curMins}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Adds dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  //Using the + operator to convert the input into a Number
  const amount = Math.floor(+inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    //Add dates
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(Number.isFinite(20));
// console.log(Number.isFinite('hello'));

// const randomInt = function (min, max) {
//   console.log(Math.random());

//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

// console.log(randomInt(8, 18));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) {
//       return (row.style.backgroundColor = 'orangered');
//     }
//   });
// });

// labelBalance.addEventListener('click', function () {
//   Array.from(document.querySelectorAll('.movements__row'), function (el, i) {
//     i % 2 === 0 ? (el.style.backgroundColor = 'orangered') : el;
//     i % 3 === 0 ? (el.style.backgroundColor = 'lightblue') : el;
//   });
// });

// console.log(parseFloat('2.5806px'));

// console.log((3.6).toFixed(0));

//MAX_SAFE_INTEGER
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);

// console.log(2000000000000n + ' were present at the wedding');

//Gets the date and time at the very moment
// const now = new Date();
// console.log(now);

//Parse the date from date string
// console.log(new Date('2015, December 24'));

//Creates an array of all the dates and times to the different movements on account1

// const dayNew = new Date();

// console.log(dayNew.getDay());

// console.dir(dayNew);

// console.log(Date.now());

// console.log(new Date(Date.now()));

// console.log(Date.now());

// console.log(account2.movementsDates);
// const ascendingMovsDate = account2.movementsDates.sort(
//   (a, b) => new Date(a) - new Date(b)
// );
// console.log(ascendingMovsDate);

const randomDate = new Date(2039, 9, 9, 8, 15);

// console.log(randomDate);
// console.log(typeof +randomDate);
// console.log(new Date(+randomDate));

const daysInBetween = (day1, day2) => (day2 - day1) / (24 * 60 * 60 * 1000);

const dayGap = daysInBetween(new Date(2026, 8, 9), new Date(2026, 8, 19));

console.log(dayGap + ' days');
