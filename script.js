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
    '2025-01-11T17:01:17.194Z',
    '2025-01-18T23:36:17.929Z',
    '2025-01-19T10:51:36.790Z',
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
    '2025-01-15T18:49:59.371Z',
    '2025-01-19T12:01:20.894Z',
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

//Format Dates function
const formatMovementDate = function (date, locale) {
  //Calculate the days between current dates and past dates transactions
  const calcDaysPassed = (date1, date2) =>
    Math.abs((date2 - date1) / (24 * 60 * 60 * 1000));

  // console.log(new Date(Date.now()));

  const daysPassed = calcDaysPassed(new Date(Date.now()), new Date(date));

  const roundedDaysPassed = Math.round(daysPassed);

  if (roundedDaysPassed === 0) return 'Today';
  if (roundedDaysPassed === 1) return 'Yesterday';
  if (roundedDaysPassed <= 7) return `${roundedDaysPassed} days ago`;

  const fullDate = new Intl.DateTimeFormat(locale).format(new Date(date));

  return fullDate;
};

//Format Number function
const formatNumber = function (number, currency, locale) {
  const options = {
    style: 'currency',

    currency: currency,
  };
  const numberFormatted = new Intl.NumberFormat(locale, options).format(number);

  return numberFormatted;
};

// console.log(formatNumber(160000, 'en-US'));

// Functions

const displayMovements = function (acc, sort = false) {
  //Set innerHTML to an empty string
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

  //Loops over each of the movements objects
  combinedMovementsDates.forEach(function (obj, i) {
    //Deconstructs the dates and movements objects
    const { movement, date } = obj;

    //Uses the function formatMovementDate to pass in the date and formats it
    const fullFormattedDate = formatMovementDate(date, acc.locale);

    //Uses the function formatNumber to pass in the movements number and formats it
    const fullFormattedNumber = formatNumber(
      movement,
      acc.currency,
      acc.locale
    );

    // console.log(Number(fullFormattedNumber).toFixed(2));

    // console.log(+fullFormattedNumber.toFixed(3));

    const type = movement > 0 ? 'deposit' : 'withdrawal';

    //HTML TEMPLATES
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>

    <div class="movements__date"> 
    ${fullFormattedDate}
    </div>
        <div class="movements__value">${fullFormattedNumber}</div> 
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  const fullyFormattedBalance = formatNumber(
    acc.balance,
    acc.currency,
    acc.locale
  );

  labelBalance.textContent = `${fullyFormattedBalance}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const fullyFormattedIncome = formatNumber(incomes, acc.currency, acc.locale);

  labelSumIn.textContent = `${fullyFormattedIncome}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const fullyFormattedOut = formatNumber(
    Math.abs(out),
    acc.currency,
    acc.locale
  );

  // labelSumOut.textContent = `${Math.abs(out.toFixed(2))}`;

  labelSumOut.textContent = `${fullyFormattedOut}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);

  const fullyFormattedInterest = formatNumber(
    interest,
    acc.currency,
    acc.locale
  );

  labelSumInterest.textContent = `${fullyFormattedInterest}`;
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

//////////////////////////////
//LOGOUT TIMER function
// labelTimer.textContent = `10:00`;
const startLogoutTimer = function () {
  //defines the tic function
  const tic = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    time--;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
  };

  //Set time to 5 minutes
  let time = 600;

  //Calls the tic function so to display the timer immediately
  tic();

  //Call the timer every second
  const timer = setInterval(tic, 1000);
};

// Event handlers

let currentAccount;

//FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// const rightNow = new Date();
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long',
//   year: 'numeric',
//   weekday: 'short',
// };
// labelDate.textContent = new Intl.DateTimeFormat('en-US', options).format(
//   rightNow
// );

//BUTTON LOGIN
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

    // const curDay = `${now.getDate()}`.padStart(2, '0');
    // const curMonth = `${now.getMonth() + 1}`.padStart(2, '0');
    // const curYear = now.getFullYear();
    // const curHours = `${now.getHours()}`.padStart(2, '0');
    // const curMins = `${now.getMinutes()}`.padStart(2, '0');

    // labelDate.textContent = `${curDay}/${curMonth}/${curYear}, ${curHours}:${curMins}`;

    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // const locale = navigator.language;

    //Gets the locale from the current account
    const locale = currentAccount.locale;

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //////////////////////////////////////////////////////
    //TIME OUT
    startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }

  console.log(currentAccount);
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

//REQUEST A LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  //Using the + operator to convert the input into a Number
  const amount = Math.floor(+inputLoanAmount.value);

  setTimeout(function () {
    if (
      amount > 0 &&
      currentAccount.movements.some(mov => mov >= amount * 0.1)
    ) {
      // Add movement
      currentAccount.movements.push(amount);

      //Add dates
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }
  }, 3000);

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

// const randomDate = new Date(2039, 9, 9, 8, 15);

// console.log(randomDate);
// console.log(+randomDate);
// console.log(new Date(+randomDate));

////////

//Calculate the number of days that elapsed after the transaction

// const daysInBetween = (day1, day2) =>
//   Math.abs((day2 - day1) / (24 * 60 * 60 * 1000));

// const curDay = Date.now();
// const randomDate = new Date(2025, 1, 13);
// console.log(new Date(curDay));
// console.log(randomDate);

// console.log(daysInBetween(curDay, randomDate));

// const daysInBetweenMod = daysInBetween.bind(null, new Date(Date.now()));

// const num = 90.98;
// console.log(typeof num);
// console.log(num.toFixed(4));

// Formatting a date based on locale and different options
// const date = new Date();
// const locale = 'en-AU';
// const options = {
//   weekday: 'long', // weekday written in full
//   year: 'numeric',
//   month: 'long', //month written in full
//   day: 'numeric',
// };
// const formattedDate = new Intl.DateTimeFormat(locale, options).format(date);
// console.log(formattedDate); //output:

// const amount = 1696044.67;
// const locale = 'en-US';
// const options = {
//   style: 'currency',
//   currency: 'EUR',
// };
// const formattedCurrency = new Intl.NumberFormat(locale, options).format(amount);
// console.log(formattedCurrency);

//the setTimeout() function
// const ingredients = ['spinach', 'olives'];

// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`This is a pizza with ${ing1} and ${ing2}.`),
//   5000,
//   ...ingredients
// );

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// console.log('...waiting');

// setInterval(function () {
//   const now = new Date();

//   const curTime = new Intl.DateTimeFormat(navigator.language, {
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//   }).format(now);

//   console.log(curTime);
// }, 1000);

// Example with setTimeout

// const arrTest = Array.from({ length: 1 }, (cur, i) => 'world');

// console.log(arrTest);

// const testTimeout = setTimeout(
//   name => {
//     console.log(`Hello, ${name}!`);
//   },
//   3000,
//   ...arrTest
// ); // The time is in milliseconds so 3000 ms = 2s

// // if (arrTest.includes('world')) clearTimeout(testTimeout);

// console.log('In progress');

// const dayDiff = function (day1, day2) {
//   const timeStamp = Math.abs(new Date(day1) - new Date(day2));

//   console.log(timeStamp);

// console.log((timeStamp / 24) * 60 * 60 * 1000);

//   return (timeStamp / 24) * 60 * 60 * 1000;
// };

// dayDiff((2023, 10, 10), (2023, 10, 19));

// console.log(new Date(2017, 9, 7));
