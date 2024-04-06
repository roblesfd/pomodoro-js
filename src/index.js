import "./main.css";
import completedSound from "./sounds/completed-sound.wav";
import workSound from "./sounds/work-sound.wav";

let pomContador = document.querySelector("#pomodoro-contador");
let pausePlayButton = document.querySelector("#pause-play-button");
let restartButton = document.querySelector("#restart-button");
let nextButton = document.querySelector("#next-button");
let newSessionButton = document.querySelector("#nueva-sesion-button");
let completedPomodoroIcons = document.querySelector("#completed-pomodoro");
let totalPomodorosText = document.querySelector("#total-pomodoro");
let numberInputAll = document.querySelectorAll(".input-number");
let tiempoEstudioInput = document.querySelector("#duration-estudio");
let tiempoDescansoInput = document.querySelector("#duration-descanso");
let totalEstudiadoElement = document.querySelector("#total-estudiado");

let minutosEstudio = 25;
let minutosDescanso = 5;
let sesion;
let pause = false;
let isRestartButtonClicked = false;
let isNextButtonClicked = false;
let isNewSessionButtonClicked = false;
let isPageCharged = true;
let isEstudio = true;
let soundEffect;
let totalTiempoEstudiado = 0;
let duracionEstudioActual = 0;

function temporizadorRegresivo(minutos) {
  let segundosTotales = minutos * 60;
  duracionEstudioActual = minutos;

  let temporizador = setInterval(() => {
    if (!pause) {
      const minutosRestantes = Math.floor(segundosTotales / 60);
      let segundosRestantes = segundosTotales % 60;

      let tiempoFormateado = formatTiempoRestante(
        minutosRestantes,
        segundosRestantes,
      );

      console.log(tiempoFormateado);

      if (
        segundosTotales === -1 ||
        isRestartButtonClicked ||
        isNextButtonClicked ||
        isNewSessionButtonClicked
      ) {
        if (
          isEstudio &&
          !isRestartButtonClicked &&
          !isNewSessionButtonClicked
        ) {
          totalTiempoEstudiado += duracionEstudioActual;
          duracionEstudioActual = minutosEstudio;
          storageSesionEstudio();
          displayPomodoroData();
        }

        if (!isRestartButtonClicked && !isNewSessionButtonClicked) {
          isEstudio = !isEstudio;
        }

        if (isNewSessionButtonClicked) {
          isNewSessionButtonClicked = false;
          minutos = minutosEstudio;
        } else {
          minutos = isEstudio ? minutosEstudio : minutosDescanso;
        }
        soundEffect = isEstudio ? workSound : completedSound;
        playSoundEffect(soundEffect);
        segundosTotales = minutos * 60;
        isRestartButtonClicked = false;
        isNextButtonClicked = false;
      } else {
        updatePomodoroLayout(tiempoFormateado);
        segundosTotales--;
      }
    }
  }, 1000);
}

function setSesionEstudio() {
  if (localStorage.getItem("sesion")) {
    sesion = JSON.parse(localStorage.getItem("sesion"));
    totalTiempoEstudiado = sesion["tiempoTotal"];
  } else {
    sesion = {
      id: generateRandomId(),
      noPomodoros: 0,
      tiempoTotal: 0,
    };
  }
}

function startSesionEstudio() {
  isNewSessionButtonClicked = true;
  sesion = {
    id: generateRandomId(),
    noPomodoros: 0,
    tiempoTotal: 0,
  };
  localStorage.clear();
  displayPomodoroData();
}

function storageSesionEstudio() {
  sesion["tiempoTotal"] = totalTiempoEstudiado;
  sesion["noPomodoros"]++;
  localStorage.setItem("sesion", JSON.stringify(sesion));
}

function generateRandomId() {
  let randomId = "";

  for (let i = 0; i < 6; i++) {
    // Generar un número aleatorio entre 0 y 1
    const random = Math.random();
    // Generar un carácter numérico si random es menor o igual a 0.5,
    // de lo contrario, generar una letra
    randomId +=
      random <= 0.5
        ? Math.floor(Math.random() * 10)
        : String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  }

  return randomId;
}

function formatTiempoRestante(mins, segs) {
  const minutosFormateados = mins < 10 ? "0" + mins : mins;
  const segundosFormateados = segs < 10 ? "0" + segs : segs;
  const tiempoFormateado = `${minutosFormateados}:${segundosFormateados}`;

  return tiempoFormateado;
}

function restartTime() {
  isRestartButtonClicked = true;
  pausePlayLayout();
}

function nextPomodoro() {
  isNextButtonClicked = true;
}

function pausePlayLayout() {
  if (isPageCharged) {
    isPageCharged = false;
    temporizadorRegresivo(minutosEstudio);
    pausePlayButton.firstElementChild.textContent = "pause";
  } else {
    pausePlayButton.classList.toggle("paused");
    pause = !pause;

    if (pausePlayButton.classList.contains("paused")) {
      pausePlayButton.firstElementChild.textContent = "play_arrow";
    } else {
      pausePlayButton.firstElementChild.textContent = "pause";
    }
  }
}

function updatePomodoroLayout(tiempo = "00:00") {
  pomContador.textContent = tiempo;
}

function displayPomodoroData() {
  totalPomodorosText.firstElementChild.textContent =
    "Total: " + sesion["noPomodoros"];
  let currentPomodoroNumber = sesion["noPomodoros"] % 4;
  let newIcon;
  let bgClass;
  completedPomodoroIcons.innerHTML = "";

  totalEstudiadoElement.textContent = "";
  totalEstudiadoElement.textContent = totalTiempoEstudiado;

  for (let i = 0; i < 4; i++) {
    bgClass = currentPomodoroNumber > 0 ? "bg-primary-950" : "bg-slate-300";
    currentPomodoroNumber--;
    newIcon = `<div class="w-3 h-3 rounded-full ${bgClass}"></div>`;
    completedPomodoroIcons.insertAdjacentHTML("beforeend", newIcon);
  }
}

function playSoundEffect(soundFilePath) {
  const audio = new Audio(soundFilePath);
  audio.play();
}

function formatInputNumber(e) {
  let value = e.target.value;

  value = value.replace(/\D/g, "");
  let min = e.target.id === "duration-estudio" ? 10 : 1;
  let max = e.target.id === "duration-estudio" ? 60 : 10;
  value = Math.min(Math.max(parseInt(value), min), max);

  e.target.value = value;
}

function updateMinutesValue(e) {
  e.target.value;

  if (e.target.id === "duration-estudio") {
    minutosEstudio = e.target.value;
  } else {
    minutosDescanso = e.target.value;
  }

  console.log("Minutos estudio: " + minutosEstudio);
  console.log("Minutos descanso: " + minutosDescanso);
}

document.addEventListener("DOMContentLoaded", function () {
  pausePlayButton.addEventListener("click", pausePlayLayout);
  restartButton.addEventListener("click", restartTime);
  nextButton.addEventListener("click", nextPomodoro);
  newSessionButton.addEventListener("click", startSesionEstudio);
  numberInputAll.forEach((input) =>
    input.addEventListener("input", (e) => {
      formatInputNumber(e);
      updateMinutesValue(e);
    }),
  );

  setSesionEstudio();
  displayPomodoroData();
});
