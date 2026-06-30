(function () {
  "use strict";

  const form = document.getElementById("waitlist-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const btnSpinner = submitBtn?.querySelector(".btn-spinner");
  const successState = document.getElementById("success-state");
  const errorState = document.getElementById("error-state");
  const errorMessage = document.getElementById("error-message");
  const counterEl = document.getElementById("counter");
  const counterPulse = document.getElementById("counter-pulse");

  let currentCount = parseInt(counterEl?.dataset.target ?? "0", 10);

  function animateCounter(to) {
    if (!counterEl || to === currentCount) return;

    const from = currentCount;
    const duration = 600;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      counterEl.textContent = value.toLocaleString("fr-FR");
      if (progress < 1) requestAnimationFrame(step);
      else {
        currentCount = to;
        counterEl.textContent = to.toLocaleString("fr-FR");
      }
    }

    requestAnimationFrame(step);
  }

  function triggerPulse() {
    if (!counterPulse) return;
    counterPulse.classList.remove("pulse-animate");
    void counterPulse.offsetWidth; // Force reflow pour relancer l'animation CSS
    counterPulse.classList.add("pulse-animate");

    counterEl?.classList.remove("counter-bump");
    void counterEl?.offsetWidth;
    counterEl?.classList.add("counter-bump");
    counterEl?.addEventListener("animationend", () => {
      counterEl.classList.remove("counter-bump");
    }, { once: true });
  }

  function connectWS() {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${location.host}/api/ws`);

    let pingInterval = null;

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 30_000);
    };

    ws.onmessage = (e) => {
      try {
        const { count } = JSON.parse(e.data);
        if (typeof count === "number" && count !== currentCount) {
          if (count > currentCount) triggerPulse();
          animateCounter(count);
        }
      } catch {}
    };

    ws.onclose = () => {
      clearInterval(pingInterval);
      setTimeout(connectWS, 5_000);
    };

    ws.onerror = () => ws.close();
  }

  function setLoading(loading) {
    if (!submitBtn || !btnText || !btnSpinner) return;
    submitBtn.disabled = loading;
    btnText.classList.toggle("d-none", loading);
    btnSpinner.classList.toggle("d-none", !loading);
  }

  function showError(message) {
    if (!errorState || !errorMessage) return;
    errorMessage.textContent = message;
    errorState.classList.remove("d-none");
    setTimeout(() => errorState.classList.add("d-none"), 5000);
  }

  function showSuccess() {
    if (!form || !successState) return;
    form.style.opacity = "0";
    form.style.transform = "scale(0.95)";
    form.style.transition = "opacity 0.3s, transform 0.3s";
    setTimeout(() => {
      form.classList.add("d-none");
      successState.classList.remove("d-none");
      successState.style.opacity = "0";
      successState.style.transform = "scale(0.95)";
      successState.style.transition = "opacity 0.3s, transform 0.3s";
      requestAnimationFrame(() => {
        successState.style.opacity = "1";
        successState.style.transform = "scale(1)";
      });
    }, 300);
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim() ?? "";
    const name = nameInput?.value.trim() ?? "";

    if (!email) {
      showError("Veuillez entrer votre adresse email.");
      emailInput?.focus();
      return;
    }

    setLoading(true);
    errorState?.classList.add("d-none");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (data.success) {
        showSuccess();
        if (typeof data.count === "number") {
          triggerPulse();
          animateCounter(data.count);
        }
      } else if (data.duplicate) {
        showError(data.error ?? "Cet email est déjà inscrit.");
        if (typeof data.count === "number") animateCounter(data.count);
      } else {
        showError(data.error ?? "Une erreur est survenue. Réessayez.");
      }
    } catch {
      showError("Impossible de se connecter. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  });

  if (counterEl) {
    counterEl.textContent = currentCount.toLocaleString("fr-FR");
  }

  const sessionId = (() => {
    const key = "wl_sid";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  })();

  async function ping() {
    try {
      await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, url: location.pathname }),
      });
    } catch {}
  }

  ping();
  setInterval(ping, 10_000);

  connectWS();
})();
