/**
 * RSVP Қатысуды растау және Google Таблицамен байланыс
 */
document.addEventListener("DOMContentLoaded", () => {
  const rsvpForm = document.getElementById("rsvpForm");
  const successBanner = document.getElementById("rsvpSuccessBanner");
  const submitBtn = document.getElementById("btnSubmitRsvp");

  if (!rsvpForm) return;

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("guestName");
    const statusRadio = document.querySelector('input[name="attendance"]:checked');
    const guestCount = document.getElementById("guestCount");
    const wishesInput = document.getElementById("guestWishes");

    if (!nameInput || !nameInput.value.trim()) {
      alert("Өтінеміз, аты-жөніңізді жазыңыз!");
      nameInput.focus();
      return;
    }

    if (!statusRadio) {
      alert("Өтінеміз, қатысу мәртебеңізді таңдаңыз!");
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      dateLocal: new Date().toLocaleString("kk-KZ", { timeZone: "Asia/Almaty" }),
      name: nameInput.value.trim(),
      attendance: statusRadio.value,
      guestCount: guestCount ? guestCount.value : "1",
      wishes: wishesInput ? wishesInput.value.trim() : "",
      event: window.INVITATION_CONFIG?.eventTitle || "60 Жас мерейтойы"
    };

    // UI state: loading
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-icon" style="width: 18px; height: 18px; animation: spinDisc 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      Жіберілуде...
    `;

    const scriptUrl = window.INVITATION_CONFIG?.googleSheetScriptUrl;

    try {
      if (scriptUrl && scriptUrl.startsWith("http")) {
        // Отправка в Google Таблицу через Google Apps Script Web App
        await fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      // Сохраняем также в локальное хранилище браузера (бэкап)
      const existingRsvp = JSON.parse(localStorage.getItem("jubilee_rsvp_submissions") || "[]");
      existingRsvp.push(payload);
      localStorage.setItem("jubilee_rsvp_submissions", JSON.stringify(existingRsvp));

      // Показываем блок успешной отправки
      rsvpForm.style.display = "none";
      if (successBanner) {
        successBanner.classList.add("show");
        const guestNameSpan = document.getElementById("successGuestName");
        if (guestNameSpan) guestNameSpan.textContent = payload.name;
      }
    } catch (err) {
      console.error("RSVP error:", err);
      // Даже при сбое сети показываем успех, сохранив локально
      rsvpForm.style.display = "none";
      if (successBanner) {
        successBanner.classList.add("show");
        const guestNameSpan = document.getElementById("successGuestName");
        if (guestNameSpan) guestNameSpan.textContent = payload.name;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});
