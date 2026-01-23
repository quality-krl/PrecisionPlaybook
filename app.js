(() => {
  const html = document.documentElement;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = (() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch { return false; }
  })();

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch {} }
  };

  // ---------- Language ----------
  const setLangAttrs = (lang) => {
    const next = lang === "en" ? "en" : "he";
    html.dataset.lang = next;
    html.lang = next;
    html.dir = next === "he" ? "rtl" : "ltr";
  };

  const swapText = (lang) => {
    // Swaps all bilingual text nodes
    $$("[data-he],[data-en]").forEach((el) => {
      const v = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-he");
      if (v != null) el.textContent = v;
    });
  };

  const setInputPlaceholders = (lang) => {
    const symptom = $("#symptom");
    const env = $("#env");
    if (symptom) symptom.placeholder = lang === "en" ? "What exactly do you see?" : "מה בדיוק אתה רואה?";
    if (env) env.placeholder = lang === "en"
      ? "iPhone 12 Pro • iOS • Safari • App version"
      : "אייפון 12 פרו • iOS • ספארי • גרסת אפליקציה";
  };

  const ensureTogglePulseSpan = () => {
    const btn = $("[data-lang-toggle]");
    if (!btn) return;
    if (btn.querySelector(".lang__pulse")) return;

    const pulse = document.createElement("span");
    pulse.className = "lang__pulse";
    pulse.setAttribute("aria-hidden", "true");
    btn.prepend(pulse);
  };

  const setToggleState = (lang) => {
    const btn = $("[data-lang-toggle]");
    if (!btn) return;

    const isEn = lang === "en";
    btn.setAttribute("aria-pressed", isEn ? "true" : "false");

    btn.classList.add("is-clicked");
    window.setTimeout(() => btn.classList.remove("is-clicked"), 180);
  };

  const announceLang = () => {
    document.dispatchEvent(new CustomEvent("krl:langChanged"));
  };

  const applyLang = (lang) => {
    const next = lang === "en" ? "en" : "he";
    setLangAttrs(next);
    swapText(next);
    setInputPlaceholders(next);
    setToggleState(next);
    storage.set("krl_lang", next);
    announceLang();
  };

  let flipLock = false;
  let t1 = null, t2 = null;

  const flipTo = (lang) => {
    if (flipLock) return;
    flipLock = true;

    if (t1) window.clearTimeout(t1);
    if (t2) window.clearTimeout(t2);

    if (prefersReduced) {
      applyLang(lang);
      flipLock = false;
      return;
    }

    html.dataset.flipping = "1";

    t1 = window.setTimeout(() => {
      applyLang(lang);
    }, 340);

    t2 = window.setTimeout(() => {
      delete html.dataset.flipping;
      flipLock = false;
    }, 780);
  };

  const initLanguage = () => {
    ensureTogglePulseSpan();

    const saved = storage.get("krl_lang");
    applyLang(saved === "en" ? "en" : "he");

    const btn = $("[data-lang-toggle]");
    if (!btn) return;

    btn.addEventListener("pointerdown", () => btn.classList.add("is-pressing"));
    btn.addEventListener("pointerup", () => btn.classList.remove("is-pressing"));
    btn.addEventListener("pointercancel", () => btn.classList.remove("is-pressing"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("is-pressing"));

    btn.addEventListener("click", () => {
      const current = html.dataset.lang === "en" ? "en" : "he";
      flipTo(current === "en" ? "he" : "en");
    });
  };

  // ---------- Smooth anchors ----------
  const initSmoothAnchors = () => {
    if (prefersReduced) return;

    document.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // ---------- Video auto play/pause ----------
  const initVideo = () => {
    const v = $("[data-hero-video]");
    if (!v) return;

    if (prefersReduced) {
      try { v.pause(); } catch {}
      return;
    }

    const tryPlay = async () => {
      try { await v.play(); } catch {}
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        const ent = entries[0];
        if (!ent) return;
        if (ent.isIntersecting) tryPlay();
        else { try { v.pause(); } catch {} }
      }, { threshold: 0.35 });

      io.observe(v);
    } else {
      tryPlay();
    }
  };

  // ---------- Protocol generator ----------
  const normalize = (s) => String(s || "").replace(/\r\n/g, "\n").trim();

  const sceneLabel = (lang, scene) => {
    const he = { login:"התחברות", checkout:"תשלום", calendar:"לוח שנה", upload:"העלאת קובץ", lang:"החלפת שפה" };
    const en = { login:"Login", checkout:"Checkout", calendar:"Calendar", upload:"File upload", lang:"Language switch" };
    return (lang === "en" ? en : he)[scene] || scene;
  };

  const protocolText = (lang, scene, symptom, env) => {
    const S = normalize(symptom) || (lang === "en" ? "Describe what you see" : "תאר בקצרה מה רואים");
    const E = normalize(env) || (lang === "en" ? "Device / OS / Browser / Version" : "מכשיר / מערכת / דפדפן / גרסה");
    const name = sceneLabel(lang, scene);

    if (lang === "en") {
      return [
        `4×4 Protocol — ${name}`,
        "",
        "SET 1 — Observe (facts only)",
        `1) Symptom: ${S}`,
        "2) Frequency: Always / Sometimes / Once",
        "3) Scope: Single user / Segment / Everyone",
        `4) Environment: ${E}`,
        "",
        "SET 2 — Reproduce (minimal steps)",
        "1) Start state: (logged in/out, empty/full data, etc.)",
        "2) Steps: 1) ...  2) ...  3) ...",
        "3) Expected vs Actual: (one sentence each)",
        "4) Evidence: screenshot / video / logs",
        "",
        "SET 3 — Isolate (remove variables)",
        "1) Try another browser/device",
        "2) Try clean session (incognito / cache cleared)",
        "3) Narrow to one action that triggers the bug",
        "4) Note the smallest reliable trigger",
        "",
        "SET 4 — Guard (reduce future risk)",
        "1) Regression test idea",
        "2) Monitoring/log suggestion",
        "3) Validation/assertion suggestion",
        "4) Definition of Done: pass criteria"
      ].join("\n");
    }

    return [
      `פרוטוקול 4×4 — ${name}`,
      "",
      "סט 1 — תצפית (רק עובדות)",
      `1) סימפטום: ${S}`,
      "2) תדירות: תמיד / לפעמים / פעם אחת",
      "3) היקף: משתמש אחד / קבוצה / כולם",
      `4) סביבה: ${E}`,
      "",
      "סט 2 — שחזור (צעדים מינימליים)",
      "1) מצב התחלתי: (מחובר/לא, נתונים ריקים/מלאים וכו')",
      "2) צעדים: 1) ...  2) ...  3) ...",
      "3) מצופה מול בפועל: (משפט אחד לכל אחד)",
      "4) ראיות: צילום / וידאו / לוגים",
      "",
      "סט 3 — בידוד (להוריד משתנים)",
      "1) נסה דפדפן/מכשיר אחר",
      "2) נסה סשן נקי (גלישה פרטית / ניקוי קאש)",
      "3) צמצם לפעולה אחת שמדליקה את הבאג",
      "4) רשום את הטריגר הכי קטן שחוזר",
      "",
      "סט 4 — הגנה (צמצום סיכון קדימה)",
      "1) רעיון לטסט רגרסיה",
      "2) הצעת ניטור/לוגים",
      "3) הצעת ולידציה/Assertion",
      "4) קריטריוני מעבר (Definition of Done)"
    ].join("\n");
  };

  const initProtocol = () => {
    const lab = $("[data-lab]");
    if (!lab) return;

    const scene = $("#scene", lab);
    const symptom = $("#symptom", lab);
    const env = $("#env", lab);

    const out = $("[data-out]", lab);
    const btnGen = $("[data-generate]", lab);
    const btnCopy = $("[data-copy]", lab);
    const btnReset = $("[data-reset]", lab);

    const render = () => {
      const lang = html.dataset.lang === "en" ? "en" : "he";
      const text = protocolText(
        lang,
        scene ? scene.value : "login",
        symptom ? symptom.value : "",
        env ? env.value : ""
      );
      if (out) out.textContent = text;
      return text;
    };

    const copyText = async (text) => {
      try { await navigator.clipboard.writeText(text); return true; }
      catch { return false; }
    };

    const flashBtn = (btn, he, en) => {
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = html.dataset.lang === "en" ? en : he;
      window.setTimeout(() => { btn.textContent = prev; }, 900);
    };

    render();

    if (btnGen) btnGen.addEventListener("click", render);

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (scene) scene.value = "login";
        if (symptom) symptom.value = "";
        if (env) env.value = "";
        render();
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        const text = (out && out.textContent) ? out.textContent : render();
        const ok = await copyText(text);
        if (ok) flashBtn(btnCopy, "הועתק", "Copied");
      });
    }

    if (scene) scene.addEventListener("change", render);
    if (symptom) symptom.addEventListener("input", render);
    if (env) env.addEventListener("input", render);

    document.addEventListener("krl:langChanged", () => {
      const lang = html.dataset.lang === "en" ? "en" : "he";
      setInputPlaceholders(lang);
      render();
    });
  };

  // ---------- Boot ----------
  const boot = () => {
    initLanguage();
    initSmoothAnchors();
    initVideo();
    initProtocol();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
