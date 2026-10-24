
const lyrics = [
  { text: "Ako ako ang bagyoooo", time: 0 },
  { text: "Kulimlim ng langit", time: 4 },
  { text: "Sa inyong dalawa", time: 7 },
  { text: "Bulong ko sa hangin", time: 10 },
  { text: "Sana 'di kayo masaya", time: 12 },
  { text: "Sa tibay ng bahay", time: 15 },
  { text: "Na titirhan ninyo", time: 17 },
  { text: "Tatangayin ko bawat yero", time: 21 }
];

const boxWidth = 260;
const boxHeight = 180;
const centerGap = 35;

const travelDuration = 10000;
const typingSpeed = 140;
const flashSpeed = 250;

let lyricIndex = 0;
let side = "left";
let flashWhite = true;
let animationFrame = null;

const song = document.getElementById("song");

// Flash existing boxes in opposite colors.
setInterval(() => {
  flashWhite = !flashWhite;

  document.querySelectorAll(".lyrics-window").forEach(box => {
    const isLeft = box.dataset.side === "left";
    const white = isLeft ? flashWhite : !flashWhite;

    box.style.backgroundColor = white ? "#fff" : "#000";
    box.style.color = white ? "#000" : "#fff";
  });
}, flashSpeed);

function createLyricBox(text, currentSide) {
  const box = document.createElement("div");
  box.className = "lyrics-window";
  box.dataset.side = currentSide;

  const lyric = document.createElement("p");
  lyric.className = "window-lyric";
  box.appendChild(lyric);
  document.body.appendChild(box);

  const center = window.innerWidth / 2;

  box.style.left = currentSide === "left"
    ? `${center - centerGap / 2 - boxWidth}px`
    : `${center + centerGap / 2}px`;

  box.style.top = `${window.innerHeight}px`;

  const white = currentSide === "left" ? flashWhite : !flashWhite;
  box.style.backgroundColor = white ? "#fff" : "#000";
  box.style.color = white ? "#000" : "#fff";

  let i = 0;

  function typeNext() {
    if (i < text.length && box.isConnected) {
      lyric.textContent += text[i++];
      setTimeout(typeNext, typingSpeed);
    }
  }

  typeNext();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      box.style.transition = `top ${travelDuration}ms linear`;
      box.style.top = `-${boxHeight}px`;
    });
  });

  setTimeout(() => box.remove(), travelDuration + 200);
}

function syncLyrics() {
  if (song.paused || song.ended) {
    animationFrame = null;
    return;
  }

  while (
    lyricIndex < lyrics.length &&
    song.currentTime >= lyrics[lyricIndex].time
  ) {
    createLyricBox(lyrics[lyricIndex].text, side);

    lyricIndex++;
    side = side === "left" ? "right" : "left";
  }

  if (lyricIndex < lyrics.length) {
    animationFrame = requestAnimationFrame(syncLyrics);
  } else {
    animationFrame = null;
  }
}

song.addEventListener("play", () => {
  if (animationFrame === null && lyricIndex < lyrics.length) {
    syncLyrics();
  }
});

// Reset lyrics when the song restarts or is replayed from the beginning.
song.addEventListener("seeked", () => {
  if (song.currentTime < 0.5) {
    lyricIndex = 0;
    side = "left";
    document.querySelectorAll(".lyrics-window").forEach(box => box.remove());
  }

  if (!song.paused && animationFrame === null) {
    syncLyrics();
  }
});

song.addEventListener("ended", () => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
});

document.addEventListener("click", () => {
  if (song.paused) {
    song.play();
  }
}, { once: true });