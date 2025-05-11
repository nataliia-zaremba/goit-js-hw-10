// Імпортуємо бібліотеку flatpickr
import flatpickr from 'flatpickr';
// Додатковий імпорт стилів для flatpickr
import 'flatpickr/dist/flatpickr.min.css';

// Імпортуємо бібліотеку iziToast для повідомлень
import iziToast from 'izitoast';
// Додатковий імпорт стилів для iziToast
import 'izitoast/dist/css/iziToast.min.css';

// Оголошуємо змінні для взаємодії з DOM
const datetimePicker = document.getElementById('datetime-picker');
const startButton = document.querySelector('[data-start]');
const daysElement = document.querySelector('[data-days]');
const hoursElement = document.querySelector('[data-hours]');
const minutesElement = document.querySelector('[data-minutes]');
const secondsElement = document.querySelector('[data-seconds]');

// Початковий стан: кнопка старт неактивна
startButton.disabled = true;

let selectedDate = null;
let countdownInterval = null;

// Опції для flatpickr
const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    selectedDate = selectedDates[0];

    // Перевіряємо, чи вибрана дата в майбутньому
    if (selectedDate <= new Date()) {
      // Використовуємо iziToast замість window.alert
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topCenter',
      });

      startButton.disabled = true;
      return;
    }

    // Активуємо кнопку, якщо дата коректна
    startButton.disabled = false;
  },
};

// Ініціалізуємо flatpickr на елементі input
flatpickr(datetimePicker, options);

// Функція для додавання ведучих нулів
function addLeadingZero(value) {
  return value.toString().padStart(2, '0');
}

// Функція для конвертації мілісекунд у дні, години, хвилини, секунди
function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

// Функція оновлення інтерфейсу
function updateTimerUI({ days, hours, minutes, seconds }) {
  // Для днів ми не обмежуємо кількість цифр, оскільки їх може бути більше 2
  daysElement.textContent = addLeadingZero(days);
  hoursElement.textContent = addLeadingZero(hours);
  minutesElement.textContent = addLeadingZero(minutes);
  secondsElement.textContent = addLeadingZero(seconds);
}

// Функція для запуску таймера
function startCountdown() {
  // Якщо таймер вже запущено, виходимо з функції
  if (countdownInterval) return;

  // Деактивуємо кнопку старт та поле вибору дати
  startButton.disabled = true;
  datetimePicker.disabled = true;

  // Відображаємо повідомлення про початок зворотного відліку
  iziToast.success({
    title: 'Success',
    message: 'Countdown timer started!',
    position: 'topRight',
    timeout: 3000,
  });

  countdownInterval = setInterval(() => {
    const currentTime = new Date();
    const remainingTime = selectedDate - currentTime;

    // Перевіряємо, чи час не закінчився
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      updateTimerUI({ days: 0, hours: 0, minutes: 0, seconds: 0 });

      // Показуємо повідомлення про закінчення відліку
      iziToast.info({
        title: 'Countdown completed',
        message: 'The countdown timer has reached zero!',
        position: 'topCenter',
        timeout: 5000,
      });

      // Відновлюємо доступ до інпуту після закінчення відліку,
      // але кнопка залишається неактивною
      datetimePicker.disabled = false;
      return;
    }

    const time = convertMs(remainingTime);
    updateTimerUI(time);
  }, 1000);
}

// Додаємо обробник події для кнопки старт
startButton.addEventListener('click', startCountdown);
