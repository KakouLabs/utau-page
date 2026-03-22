let currentLang = "ko";
let currentCharacterId = "tetsu-kokuno";
let isCreditOpen = false;
let characterTransitionTimer = null;

const scrambleCharacters = "01アイウエオ카키쿠케코サシスセソ타치ツテトナニヌ네노ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*+=-_";

function setImmediateText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value ?? "";
}

const switchers = document.querySelectorAll(".lang-btn");

switchers.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    switchers.forEach((b) => b.classList.remove("active"));
    const target = event.currentTarget;
    target.classList.add("active");
    currentLang = target.getAttribute("data-lang");

    const localeContent = getLocaleContent();
    const characters = getCharacters(localeContent);
    const hasCurrentCharacter = characters.some((character) => character.id === currentCharacterId);

    if (!hasCurrentCharacter && characters[0]) {
      currentCharacterId = characters[0].id;
    }

    renderContent();
  });
});

const setText = (id, value) => {
  const node = document.getElementById(id);
  if (node) node.textContent = value ?? "";
};

function scrambleText(id, finalText, duration = 520) {
  const node = document.getElementById(id);
  if (!node) return;

  const targetText = finalText ?? "";
  const sourceText = node.textContent ?? "";
  const maxLength = Math.max(sourceText.length, targetText.length);
  const revealStart = 0.22;
  const startTime = performance.now();

  const frame = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const revealProgress = Math.max(0, (progress - revealStart) / (1 - revealStart));
    const revealedCount = Math.floor(targetText.length * revealProgress);
    let output = "";

    for (let index = 0; index < maxLength; index += 1) {
      if (index < revealedCount) {
        output += targetText[index] || "";
      } else if (index < targetText.length) {
        const targetChar = targetText[index];
        if (/\s/.test(targetChar)) {
          output += targetChar;
        } else {
          output += scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        }
      }
    }

    node.textContent = output;

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    } else {
      node.textContent = targetText;
    }
  };

  window.requestAnimationFrame(frame);
}

function scrambleHeroName(finalText) {
  const node = document.getElementById("hero-name");
  if (!node) return;

  const targetText = finalText ?? "";
  const startTime = performance.now();
  const duration = 980;
  const revealStart = 0.34;

  const frame = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const revealProgress = Math.max(0, (progress - revealStart) / (1 - revealStart));
    const revealedCount = Math.floor(targetText.length * revealProgress);
    let output = "";

    for (let index = 0; index < targetText.length; index += 1) {
      const char = targetText[index];

      if (/\s/.test(char)) {
        output += char;
      } else if (index < revealedCount) {
        output += char;
      } else {
        const randomA = scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        const randomB = scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        output += progress < 0.45 && index % 2 === 0 ? randomA + randomB : randomA;
      }
    }

    node.textContent = output.slice(0, Math.max(targetText.length + 2, output.length));

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    } else {
      node.textContent = targetText;
    }
  };

  window.requestAnimationFrame(frame);
}

const renderList = (elementId, items, renderer) => {
  const root = document.getElementById(elementId);
  if (!root) return;
  root.innerHTML = "";
  const safeItems = Array.isArray(items) ? items : [];
  safeItems.forEach((item) => {
    root.appendChild(renderer(item));
  });
};

function getLocaleContent() {
  return window.siteContent[currentLang] || window.siteContent.ko || {};
}

function getCharacters(localeContent) {
  return Array.isArray(localeContent.characters) ? localeContent.characters : [];
}

function getActiveCharacter(localeContent) {
  const characters = getCharacters(localeContent);
  return characters.find((character) => character.id === currentCharacterId) || characters[0] || {};
}

function updateCreditToggle(content) {
  const toggleButton = document.getElementById("ui-credit-toggle");
  const collapsible = document.getElementById("credit-collapsible");
  if (!toggleButton || !collapsible) return;

  const openLabel = content.ui.creditToggleOpen || "Show Credits";
  const closeLabel = content.ui.creditToggleClose || "Hide Credits";

  toggleButton.textContent = isCreditOpen ? closeLabel : openLabel;
  toggleButton.setAttribute("aria-expanded", isCreditOpen ? "true" : "false");
  collapsible.hidden = !isCreditOpen;
}

function renderFooterLinks(links) {
  const footerNav = document.getElementById("footer-nav");
  if (!footerNav) return;

  footerNav.innerHTML = "";

  const safeLinks = Array.isArray(links) ? links : [];
  safeLinks.forEach((item) => {
    if (!item || !item.label) return;

    const link = document.createElement("a");
    link.textContent = item.label;
    link.href = item.url || "#";

    if (item.url && /^https?:\/\//.test(item.url)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }

    footerNav.appendChild(link);
  });
}

function renderCharacterTabs(content, activeCharacter) {
  const characters = getCharacters(content);
  const floatingSwitcher = document.getElementById("character-switcher");
  if (!floatingSwitcher) return;

  floatingSwitcher.innerHTML = "";

  characters.forEach((character, index) => {
    const label =
      character.navLabel ||
      character.profile?.name ||
      `${content.ui.defaultCharacterLabel || "Character"} ${index + 1}`;

    const createButton = () => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "character-tab";
      if (character.id === activeCharacter.id) {
        button.classList.add("active");
      }
      button.setAttribute("data-character-id", character.id);
      button.textContent = label;
      button.addEventListener("click", () => {
        animateCharacterSwap(character.id);
      });
      return button;
    };

    floatingSwitcher.appendChild(createButton());
  });
}

function applyCharacterTheme(theme = {}) {
  const root = document.documentElement;
  const pairs = {
    "--theme-main": theme.main,
    "--theme-complement": theme.complement,
    "--theme-complement-dark": theme.complementDark,
    "--bg-gradient-1": theme.bg1,
    "--bg-gradient-2": theme.bg2,
    "--bg-gradient-3": theme.bg3,
    "--text-main": theme.textMain,
    "--text-muted": theme.textMuted,
  };

  Object.entries(pairs).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value);
    }
  });
}

function animateCharacterSwap(nextCharacterId) {
  if (nextCharacterId === currentCharacterId) {
    return;
  }

  if (characterTransitionTimer) {
    window.clearTimeout(characterTransitionTimer);
  }

  const portraitFrame = document.getElementById("portrait-frame");
  if (portraitFrame) {
    portraitFrame.classList.remove("is-wiping");
    void portraitFrame.offsetWidth;
    portraitFrame.classList.add("is-wiping");
  }

  characterTransitionTimer = window.setTimeout(() => {
    currentCharacterId = nextCharacterId;
    renderContent();

    characterTransitionTimer = null;
  }, 190);
}

function toggleCreditSection() {
  isCreditOpen = !isCreditOpen;
  const content = getLocaleContent();
  updateCreditToggle(content);
  refreshTilt();
}

const tiltOptions = {
  max: 2,
  speed: 400,
  glare: true,
  "max-glare": 0.12,
  scale: 1.01,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

let tiltRefreshTimer = null;

function refreshTilt() {
  if (typeof VanillaTilt === "undefined") return;

  if (tiltRefreshTimer) {
    clearTimeout(tiltRefreshTimer);
  }

  const tiltElements = document.querySelectorAll(".tilt-element");

  tiltElements.forEach((el) => {
    if (el.vanillaTilt) {
      el.vanillaTilt.destroy();
    }

    const staleGlares = el.querySelectorAll(".js-tilt-glare");
    staleGlares.forEach((glareEl) => glareEl.remove());
  });

  tiltRefreshTimer = window.setTimeout(() => {
    VanillaTilt.init(tiltElements, tiltOptions);
    tiltRefreshTimer = null;
  }, 0);
}

window.refreshTilt = refreshTilt;

function updateCanvasAsset() {
  const canvasImage = window.bgAnimationImage;
  if (!canvasImage) return;

  if (currentCharacterId === "tetsu-kokuno") {
    canvasImage.src = "assets/crab.png";
  } else {
    canvasImage.src = "assets/ghost.png";
  }
}

function renderContent() {
  const content = getLocaleContent();
  const contact = content.contact || {};
  const ui = content.ui || {};
  const activeCharacter = getActiveCharacter(content);
  const hero = activeCharacter.hero || {};
  const profile = activeCharacter.profile || {};
  const credit = activeCharacter.credit || {};
  const footer = activeCharacter.footer || content.footer || {};

  document.documentElement.lang = currentLang;
  document.body.classList.remove("lang-ko", "lang-en", "lang-ja");
  document.body.classList.add(`lang-${currentLang}`);

  renderCharacterTabs(content, activeCharacter);
  applyCharacterTheme(activeCharacter.theme || {});

  scrambleText("hero-label", hero.label, 420);
  scrambleHeroName(hero.name);
  scrambleText("hero-tagline", hero.tagline, 560);
  setText("btn-profile", hero.buttonProfile);
  setText("hero-download-link", hero.buttonDownload);
  setText("profile-download-link", hero.buttonDownload);

  setImmediateText("ui-status-label", contact.sectionLabel || ui.statusLabel);
  setImmediateText("ui-profile-eyebrow", ui.profileSection);
  scrambleText("ui-profile-heading", ui.profileSection, 420);
  scrambleText("ui-dossier-title", ui.dossierLabel, 420);
  setImmediateText("ui-dossier-note", ui.dossierLabel);
  setImmediateText("ui-download-eyebrow", ui.downloadSection);
  scrambleText("ui-notes-title", ui.notesLabel, 380);
  setImmediateText("ui-drive-label", ui.driveLabel);
  setImmediateText("ui-notes-label", ui.notesLabel);
  updateCreditToggle(content);

  const contributors = credit.contributors || [];
  const creditToggle = document.getElementById("ui-credit-toggle");
  const creditCollapsible = document.getElementById("credit-collapsible");
  const creditDescription = document.getElementById("credit-description");

  if (contributors.length > 0) {
    if (creditToggle) creditToggle.style.display = "inline-flex";
    if (creditDescription) creditDescription.style.display = "block";
    if (creditCollapsible) {
      creditCollapsible.style.display = isCreditOpen ? "block" : "none";
    }
  } else {
    if (creditToggle) creditToggle.style.display = "none";
    if (creditDescription) creditDescription.style.display = "none";
    if (creditCollapsible) creditCollapsible.style.display = "none";
  }

  scrambleText("profile-name", profile.name, 520);
  setImmediateText("profile-type", profile.type);
  scrambleText("profile-summary", profile.summary, 620);

  scrambleText("credit-title", credit.title, 480);
  scrambleText("credit-description", credit.description, 600);
  scrambleText("dl-title", credit.primaryAction?.title, 420);
  setImmediateText("footer-meta", footer.metaText);
  renderFooterLinks(footer.links);

  const profileStatus = document.getElementById("profile-status");
  if (profileStatus) {
    profileStatus.innerHTML = "";
    if (contact.primaryUrl) {
      const primaryLink = document.createElement("a");
      primaryLink.className = "status-primary-link";
      primaryLink.href = contact.primaryUrl;
      primaryLink.target = "_blank";
      primaryLink.rel = "noreferrer";
      primaryLink.textContent = contact.primaryText || profile.status;
      profileStatus.appendChild(primaryLink);
    } else {
      profileStatus.textContent = contact.primaryText || profile.status;
    }
  }

  renderList("hero-facts", contact.channels || hero.facts, (fact) => {
    const item = document.createElement("li");
    if (typeof fact === "string") {
      item.textContent = fact;
      return item;
    }

    const label = fact.label ? `${fact.label}: ` : "";
    const value = fact.value || fact.text || "";

    if (fact.url) {
      const link = document.createElement("a");
      link.className = "status-link";
      link.href = fact.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = `${label}${value}`;
      item.appendChild(link);
      return item;
    }

    item.textContent = `${label}${value}`;
    return item;
  });

  const tags = profile.tags || [];
  const tagRow = document.getElementById("tag-row");
  if (tags.length > 0) {
    if (tagRow) tagRow.style.display = "flex";
    renderList("tag-row", tags, (tag) => {
      const item = document.createElement("span");
      item.className = "tag";
      item.textContent = tag;
      return item;
    });
  } else if (tagRow) {
    tagRow.style.display = "none";
  }

  renderList("profile-grid", profile.stats, (stat) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const desc = document.createElement("dd");
    term.textContent = stat.label;
    desc.textContent = stat.value;
    wrapper.appendChild(term);
    wrapper.appendChild(desc);
    return wrapper;
  });

  renderList("dossier-list", profile.dossier, (entry) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const desc = document.createElement("dd");
    item.className = "dossier-item";
    term.textContent = entry.label;
    desc.textContent = entry.value;
    item.appendChild(term);
    item.appendChild(desc);
    return item;
  });

  renderList("credit-grid", credit.contributors, (contributor) => {
    const isLink = !!contributor.link;
    const card = document.createElement(isLink ? "a" : "article");
    card.className = "contributor-card tilt-element";

    if (isLink) {
      card.href = contributor.link;
      card.target = "_blank";
      card.rel = "noreferrer";
      card.classList.add("is-link");
    }

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "contributor-content";

    const role = document.createElement("p");
    role.className = "contributor-role";
    role.textContent = contributor.role;

    const name = document.createElement("p");
    name.className = "contributor-name";
    name.textContent = contributor.name;

    contentWrapper.appendChild(role);
    contentWrapper.appendChild(name);

    if (contributor.image) {
      const avatar = document.createElement("div");
      avatar.className = "contributor-avatar";
      const img = document.createElement("img");
      img.src = contributor.image;
      img.alt = `${contributor.name} profile`;
      avatar.appendChild(img);
      card.appendChild(avatar);
    }

    card.appendChild(contentWrapper);
    return card;
  });

  const creditNotesList = document.getElementById("credit-notes");
  if (creditNotesList) creditNotesList.innerHTML = "";
  renderList("credit-notes", credit.notes, (note) => {
    const item = document.createElement("li");
    item.textContent = note;
    return item;
  });

  const portraitImage = document.getElementById("portrait-image");
  const portraitFallback = document.getElementById("portrait-fallback");
  if (portraitImage && portraitFallback) {
    if (profile.portraitImage) {
      portraitImage.src = profile.portraitImage;
      portraitImage.alt = `${profile.name || hero.name || "Character"} profile image`;
      portraitImage.hidden = false;
      portraitFallback.hidden = true;
    } else {
      portraitImage.hidden = true;
      portraitFallback.hidden = false;
      portraitFallback.textContent = profile.portraitFallback;
    }
  }

  const creditLink = document.getElementById("credit-link");
  if (creditLink) {
    if (credit.primaryAction && credit.primaryAction.url) {
      creditLink.style.display = "inline-flex";
      creditLink.href = credit.primaryAction.url;
      creditLink.textContent = credit.primaryAction.label;
    } else {
      creditLink.style.display = "none";
    }
  }

  const creditLinkAlt = document.getElementById("credit-link-alt");
  if (creditLinkAlt) {
    if (credit.secondaryAction && credit.secondaryAction.url) {
      creditLinkAlt.style.display = "inline-flex";
      creditLinkAlt.href = credit.secondaryAction.url;
      creditLinkAlt.textContent = credit.secondaryAction.label;
    } else {
      creditLinkAlt.style.display = "none";
    }
  }

  updateCanvasAsset();
  refreshTilt();
}

renderContent();

const creditToggleButton = document.getElementById("ui-credit-toggle");
if (creditToggleButton) {
  creditToggleButton.addEventListener("click", toggleCreditSection);
}

const canvas = document.getElementById("crab-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width;
  let height;
  const items = [];
  let isAnimating = false;
  window.bgAnimationImage = new Image();
  updateCanvasAsset(); // Set initial asset

  let mouseX = -1000;
  let mouseY = -1000;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("mouseleave", () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener("resize", resize);
  resize();

  class FloatingAsset {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.size = Math.random() * 20 + 15;
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -this.size;
      this.speedY = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      
      // 캐릭터에 따라 불투명도 조절 (글릿일 때 더 진하게)
      const opacityBaseRange = currentCharacterId === "tetsu-kokuno" ? 0.4 : 0.6;
      const opacityMin = currentCharacterId === "tetsu-kokuno" ? 0.2 : 0.4;
      
      this.baseOpacity = Math.random() * opacityBaseRange + opacityMin;
      this.currentOpacity = this.baseOpacity;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > height + this.size) {
        this.reset();
      }

      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 150;

      if (distance < interactionRadius) {
        const factor = distance / interactionRadius;
        const targetOpacity = this.baseOpacity * Math.pow(factor, 2);
        this.currentOpacity += (targetOpacity - this.currentOpacity) * 0.1;
      } else {
        this.currentOpacity += (this.baseOpacity - this.currentOpacity) * 0.05;
      }
    }

    draw() {
      if (!window.bgAnimationImage.complete) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.currentOpacity);
      ctx.drawImage(window.bgAnimationImage, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  const itemCount = Math.floor((width * height) / 40000);
  for (let i = 0; i < itemCount; i += 1) {
    items.push(new FloatingAsset());
  }

  function animate() {
    isAnimating = true;
    ctx.clearRect(0, 0, width, height);
    items.forEach((item) => {
      item.update();
      item.draw();
    });
    requestAnimationFrame(animate);
  }

  window.bgAnimationImage.onload = () => {
    if (!isAnimating) animate();
  };

  if (window.bgAnimationImage.complete && !isAnimating) {
    animate();
  }
}
