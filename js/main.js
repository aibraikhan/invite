/**
 * Басты логика (Интерактивті конверт, Таймер, Аудио, Мәліметтерді толтыру)
 */
document.addEventListener("DOMContentLoaded", () => {
  const config = window.INVITATION_CONFIG || {};

  // 1. МӘЛІМЕТТЕРДІ БЕТКЕ ЖҮКТЕУ (POPULATE DATA)
  // Тек элемент бос болған жағдайда ғана config-тен аламыз.
  // Егер HTML-де тікелей жазылған болса, HTML-дегі мәтін БІРІНШІ ОРЫНДА сақталады!
  const setTextIfEmpty = (id, val) => {
    const el = document.getElementById(id);
    if (el && !el.textContent.trim() && val) {
      el.textContent = val;
    }
  };

  setTextIfEmpty("cfgCelebrantName", config.celebrantName);
  setTextIfEmpty("cfgEventTitle", config.eventTitle);
  setTextIfEmpty("cfgSubtitle", config.subtitle);
  setTextIfEmpty("cfgDateDisplay", config.dateDisplay);
  setTextIfEmpty("cfgDayOfWeek", config.dayOfWeek);
  setTextIfEmpty("cfgTimeDisplay", config.timeDisplay);
  setTextIfEmpty("cfgCity", config.city);
  setTextIfEmpty("cfgRestaurantName", config.restaurantName);
  setTextIfEmpty("cfgAddress", config.address);
  setTextIfEmpty("cfgHosts", config.hosts);

  // Карта сілтемесі (2GIS) - егер HTML-де href="#" немесе бос болса ғана config-тен аламыз
  const mapBtn = document.getElementById("cfgMapLink");
  if (mapBtn && (!mapBtn.getAttribute("href") || mapBtn.getAttribute("href") === "#") && config.gisUrl) {
    mapBtn.href = config.gisUrl;
  }

  // Бағдарламаны толтыру (Timeline)
  const timelineContainer = document.getElementById("cfgProgramTimeline");
  if (timelineContainer && timelineContainer.children.length === 0 && config.program && config.program.length) {
    timelineContainer.innerHTML = config.program.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-time">${item.time}</div>
        <div class="timeline-name">${item.title}</div>
        ${item.desc ? `<div class="timeline-desc">${item.desc}</div>` : ""}
      </div>
    `).join("");
  }

  // 2. АУДИО БАҚЫЛАУ (AUDIO CONTROLLER)
  const bgAudio = document.getElementById("bgAudio");
  const audioBtnHeader = document.getElementById("audioBtnHeader");
  const audioBtnMobile = document.getElementById("audioBtnMobile");
  let isPlaying = false;

  if (bgAudio && config.musicUrl) {
    bgAudio.src = config.musicUrl;
    bgAudio.addEventListener("error", () => {
      // Егер аудио файл әлі салынбаған болса, тыныш өңдейміз
      console.info("Аудио файл әлі салынбаған немесе қолжетімсіз.");
      updateAudioUI(false);
    });
  }

  const updateAudioUI = (playing) => {
    isPlaying = playing;
    if (audioBtnHeader) {
      if (playing) {
        audioBtnHeader.classList.add("playing");
        audioBtnHeader.querySelector(".audio-label").textContent = "Әуен қосулы";
      } else {
        audioBtnHeader.classList.remove("playing");
        audioBtnHeader.querySelector(".audio-label").textContent = "Әуен қосу";
      }
    }
    if (audioBtnMobile) {
      if (playing) {
        audioBtnMobile.classList.add("playing");
      } else {
        audioBtnMobile.classList.remove("playing");
      }
    }
  };

  const toggleAudio = () => {
    if (!bgAudio) return;
    if (isPlaying) {
      bgAudio.pause();
      updateAudioUI(false);
    } else {
      bgAudio.play().then(() => {
        updateAudioUI(true);
      }).catch(err => {
        console.warn("Audio play prevented:", err);
      });
    }
  };

  if (audioBtnHeader) audioBtnHeader.addEventListener("click", toggleAudio);
  if (audioBtnMobile) audioBtnMobile.addEventListener("click", toggleAudio);

  // 3. ИНТЕРАКТИВТІ КОНВЕРТТІ АШУ (ENVELOPE OPENING)
  const envelopeScreen = document.getElementById("envelopeScreen");
  const envelopeWrapper = document.getElementById("envelopeWrapper");
  const btnOpen = document.getElementById("btnOpenEnvelope");
  const waxSealBtn = document.getElementById("waxSealBtn");

  const openEnvelope = () => {
    if (!envelopeScreen || envelopeScreen.classList.contains("opened")) return;

    // Конверт қақпағын ашу
    if (envelopeWrapper) {
      envelopeWrapper.classList.add("opening");
    }

    // Музыканы автоматты түрде қосу (қолданушының қимылымен рұқсат етілген)
    if (bgAudio) {
      bgAudio.play().then(() => {
        updateAudioUI(true);
      }).catch(() => {
        // Браузер шектеуі болса
      });
    }

    // Сәл кідіріспен конверт экранын жасыру
    setTimeout(() => {
      envelopeScreen.classList.add("opened");
    }, 750);
  };

  if (btnOpen) btnOpen.addEventListener("click", openEnvelope);
  if (waxSealBtn) waxSealBtn.addEventListener("click", openEnvelope);
  if (envelopeWrapper) {
    envelopeWrapper.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        openEnvelope();
      }
    });
  }

  // 4. КЕРІ САНАҚ ТАЙМЕРІ (COUNTDOWN TIMER)
  const timerDays = document.getElementById("timerDays");
  const timerHours = document.getElementById("timerHours");
  const timerMinutes = document.getElementById("timerMinutes");
  const timerSeconds = document.getElementById("timerSeconds");
  const timerStatus = document.getElementById("timerStatus");

  const updateCountdown = () => {
    if (!config.eventDate) return;
    const targetDate = new Date(config.eventDate).getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (timerStatus) timerStatus.textContent = "Той басталды! Қош келдіңіздер!";
      if (timerDays) timerDays.textContent = "00";
      if (timerHours) timerHours.textContent = "00";
      if (timerMinutes) timerMinutes.textContent = "00";
      if (timerSeconds) timerSeconds.textContent = "00";
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, "0");

    if (timerDays) timerDays.textContent = pad(d);
    if (timerHours) timerHours.textContent = pad(h);
    if (timerMinutes) timerMinutes.textContent = pad(m);
    if (timerSeconds) timerSeconds.textContent = pad(s);
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
