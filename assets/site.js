// adultstherapy.com — shared interactivity for the normalized static site.
(() => {
  "use strict";

  const preferenceKey = "act-analytics-consent";
  const measurementId = "G-Q7MB5026Y0";
  const allowedPreferences = new Set(["granted", "denied"]);
  const deniedConsent = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };

  const closestFromEvent = (event, selector) =>
    event.target instanceof Element ? event.target.closest(selector) : null;

  const initializeNavigation = () => {
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".nav__menu");
    if (!toggle || !menu) return;

    const setOpen = (open, restoreFocus = false) => {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (restoreFocus) toggle.focus({ preventScroll: true });
    };

    setOpen(menu.classList.contains("open"));

    toggle.addEventListener("click", () => {
      setOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", (event) => {
      if (closestFromEvent(event, "a[href]")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setOpen(false, true);
      }
    });
  };

  const readPreference = () => {
    try {
      const value = window.localStorage.getItem(preferenceKey);
      return allowedPreferences.has(value) ? value : null;
    } catch {
      return null;
    }
  };

  const writePreference = (value) => {
    try {
      window.localStorage.setItem(preferenceKey, value);
    } catch {
      // The preference remains effective for this page if storage is unavailable.
    }
  };

  const privacySignalEnabled = () =>
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1";

  const initializePrivacyControls = () => {
    let preference = readPreference();
    let analyticsLoaded = false;

    const track = (eventName, parameters = {}) => {
      if (preference !== "granted" || typeof window.gtag !== "function") return;
      window.gtag("event", eventName, parameters);
    };

    const updateAnalyticsConsent = (analyticsStorage) => {
      if (typeof window.gtag !== "function") return;
      window.gtag("consent", "update", {
        ...deniedConsent,
        analytics_storage: analyticsStorage,
      });
    };

    const loadAnalytics = () => {
      if (preference !== "granted") return;

      window[`ga-disable-${measurementId}`] = false;
      if (analyticsLoaded) {
        updateAnalyticsConsent("granted");
        return;
      }

      analyticsLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("consent", "default", {
        ...deniedConsent,
        wait_for_update: 500,
      });
      updateAnalyticsConsent("granted");
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.append(script);
    };

    const closePanel = () => {
      document.querySelector(".privacy-consent")?.remove();
      const preferencesButton = document.querySelector(".privacy-preferences-button");
      if (preferencesButton) preferencesButton.hidden = false;
    };

    const setPreference = (value) => {
      if (!allowedPreferences.has(value)) return;

      preference = value;
      writePreference(value);
      document.documentElement.dataset.analyticsConsent = value;
      closePanel();

      if (value === "granted") {
        loadAnalytics();
        return;
      }

      window[`ga-disable-${measurementId}`] = true;
      updateAnalyticsConsent("denied");
    };

    const showPanel = () => {
      closePanel();
      const preferencesButton = document.querySelector(".privacy-preferences-button");
      if (preferencesButton) preferencesButton.hidden = true;

      const panel = document.createElement("section");
      panel.className = "privacy-consent";
      panel.setAttribute("aria-labelledby", "privacy-consent-title");
      panel.innerHTML = `
        <div>
          <h2 id="privacy-consent-title">Optional analytics</h2>
          <p>This site works without analytics. Nothing you type here is stored, and no session is ever recorded. You can allow privacy-limited Google Analytics or continue without it. <a href="/privacy/">Privacy details</a></p>
        </div>
        <div class="privacy-consent__actions">
          <button type="button" data-consent="denied">Continue without analytics</button>
          <button type="button" class="privacy-consent__allow" data-consent="granted">Allow analytics</button>
        </div>`;
      panel.addEventListener("click", (event) => {
        const button = closestFromEvent(event, "[data-consent]");
        if (button) setPreference(button.dataset.consent);
      });
      document.body.append(panel);
      panel.querySelector("button")?.focus({ preventScroll: true });
    };

    const addPreferenceButton = () => {
      if (document.querySelector(".privacy-preferences-button")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "privacy-preferences-button";
      button.textContent = "Privacy choices";
      button.addEventListener("click", showPanel);
      document.body.append(button);
    };

    document.addEventListener("click", (event) => {
      const embedButton = closestFromEvent(event, "[data-load-external-embed]");
      if (embedButton) {
        const wrapper = embedButton.closest(".external-embed");
        const frame = wrapper?.querySelector("iframe[data-external-src]");
        if (frame) {
          frame.src = frame.dataset.externalSrc;
          frame.removeAttribute("data-external-src");
          wrapper.classList.add("external-embed--loaded");
          embedButton.remove();
          track("external_embed_load", { link_location: window.location.pathname });
        }
      }

      const link = closestFromEvent(event, "a[href]");
      if (!link) return;
      if (link.protocol === "mailto:") {
        track("email_click", { link_location: window.location.pathname });
      } else if (link.protocol === "tel:") {
        track("phone_click", { link_location: window.location.pathname });
      }
    });

    const privacySignal = privacySignalEnabled();
    document.documentElement.dataset.analyticsConsent = privacySignal
      ? "denied"
      : preference || "unset";
    addPreferenceButton();

    if (preference === "granted" && !privacySignal) {
      loadAnalytics();
      return;
    }
    if (privacySignal) {
      window[`ga-disable-${measurementId}`] = true;
      return;
    }
    if (preference === null) showPanel();
  };

  const initialize = () => {
    initializeNavigation();
    initializePrivacyControls();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
