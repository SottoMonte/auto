const fallbackImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=82";

const state = {
  vehicles: [],
  site: {},
  mode: "tutte",
  brand: "tutte",
  sort: "evidenza",
  search: "",
};

const elements = {
  brandFilter: document.querySelector("#brand-filter"),
  contactEmail: document.querySelector("#contact-email"),
  contactPhone: document.querySelector("#contact-phone"),
  contactPrimary: document.querySelector("#contact-primary"),
  dialog: document.querySelector("#vehicle-dialog"),
  dialogContact: document.querySelector("#dialog-contact"),
  dialogDescription: document.querySelector("#dialog-description"),
  dialogImage: document.querySelector("#dialog-image"),
  dialogMode: document.querySelector("#dialog-mode"),
  dialogPrice: document.querySelector("#dialog-price"),
  dialogSpecs: document.querySelector("#dialog-specs"),
  dialogTitle: document.querySelector("#dialog-title"),
  emptyState: document.querySelector("#empty-state"),
  heroCaption: document.querySelector("#hero-caption"),
  heroImage: document.querySelector("#hero-image"),
  heroTagline: document.querySelector("#hero-tagline"),
  menuToggle: document.querySelector(".menu-toggle"),
  navigation: document.querySelector("#primary-navigation"),
  searchFilter: document.querySelector("#search-filter"),
  sortFilter: document.querySelector("#sort-filter"),
  vehicleCount: document.querySelector("#vehicle-count"),
  vehicleGrid: document.querySelector("#vehicle-grid"),
};

const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function imageUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return fallbackImage;
  }

  try {
    const url = new URL(value.trim(), window.location.href);
    if (url.origin === window.location.origin || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return fallbackImage;
  }

  return fallbackImage;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("it-IT").format(number) : "—";
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT");
}

function validEmail(value) {
  const email = String(value ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function contactUrl(subject = "") {
  const whatsapp = String(state.site.whatsapp ?? "").replace(/\D/g, "");
  const message = subject || `Buongiorno, vorrei ricevere informazioni da ${state.site.brand || "STRADA"}.`;
  if (whatsapp.length >= 8) {
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  }

  const email = validEmail(state.site.email);
  if (email) {
    return `mailto:${email}?subject=${encodeURIComponent(subject || "Richiesta informazioni")}`;
  }

  return "#contatti";
}

function updateSiteDetails() {
  const brand = String(state.site.brand || "STRADA").trim();
  const city = String(state.site.city || "La tua città").trim();
  const email = validEmail(state.site.email);
  const phone = String(state.site.phone || "").trim();

  document.querySelectorAll("[data-brand]").forEach((element) => {
    element.textContent = brand;
  });
  document.querySelectorAll("[data-city]").forEach((element) => {
    element.textContent = city;
  });

  document.title = `${brand} — Noleggio e vendita auto`;
  elements.heroTagline.textContent = state.site.tagline || "Vendita chiara. Noleggio flessibile.";
  elements.contactPrimary.href = contactUrl();
  document.querySelector("#header-contact").href = contactUrl();
  elements.contactEmail.hidden = !email;
  if (email) {
    elements.contactEmail.href = `mailto:${email}`;
    elements.contactEmail.textContent = email;
  }

  elements.contactPhone.hidden = !phone;
  if (phone) {
    elements.contactPhone.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
    elements.contactPhone.textContent = phone;
  }
}

function setHeroVehicle() {
  const vehicle = state.vehicles.find((item) => item.featured && item.available !== false) ||
    state.vehicles.find((item) => item.available !== false);
  if (!vehicle) {
    return;
  }

  elements.heroImage.src = imageUrl(vehicle.image);
  elements.heroImage.alt = vehicle.title || "Auto in primo piano";
  elements.heroCaption.textContent = vehicle.title || "Le auto del momento";
}

function buildBrandFilter() {
  const brands = [...new Set(state.vehicles
    .filter((vehicle) => vehicle.available !== false)
    .map((vehicle) => String(vehicle.brand || "").trim())
    .filter(Boolean))]
    .sort((first, second) => first.localeCompare(second, "it"));

  elements.brandFilter.replaceChildren(new Option("Tutte le marche", "tutte"));
  brands.forEach((brand) => {
    elements.brandFilter.add(new Option(brand, brand));
  });
}

function vehicleCard(vehicle) {
  const isRental = vehicle.mode === "noleggio";
  const modeLabel = isRental ? "Noleggio" : "Vendita";
  const title = String(vehicle.title || `${vehicle.brand || "Auto"} ${vehicle.model || ""}`).trim();
  const details = [
    vehicle.year ? String(vehicle.year) : "",
    vehicle.kilometers !== undefined && vehicle.kilometers !== "" ? `${formatNumber(vehicle.kilometers)} km` : "",
    vehicle.fuel || "",
    vehicle.transmission || "",
  ].filter(Boolean);
  const priceSuffix = isRental ? "al giorno" : "prezzo";

  return `
    <article class="vehicle-card">
      <button
        class="vehicle-card__image"
        type="button"
        data-open-vehicle="${escapeHtml(vehicle.id)}"
        aria-label="Mostra i dettagli di ${escapeHtml(title)}"
      >
        <img src="${escapeHtml(imageUrl(vehicle.image))}" alt="" loading="lazy" decoding="async" />
        <span class="vehicle-card__badge">${modeLabel}</span>
        ${vehicle.featured ? '<span class="vehicle-card__featured">In evidenza</span>' : ""}
      </button>
      <div class="vehicle-card__body">
        <p class="vehicle-card__eyebrow">${escapeHtml(vehicle.brand || "")}</p>
        <h3>${escapeHtml(title)}</h3>
        <ul class="vehicle-card__specs">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
        <div class="vehicle-card__footer">
          <p class="vehicle-card__price">
            <strong>${escapeHtml(euro.format(Number(vehicle.price) || 0))}</strong>
            <span>${priceSuffix}</span>
          </p>
          <button class="vehicle-card__details" type="button" data-open-vehicle="${escapeHtml(vehicle.id)}">
            Dettagli <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function sortedVehicles(vehicles) {
  const sorted = [...vehicles];
  if (state.sort === "prezzo-crescente") {
    return sorted.sort((first, second) => Number(first.price) - Number(second.price));
  }
  if (state.sort === "prezzo-decrescente") {
    return sorted.sort((first, second) => Number(second.price) - Number(first.price));
  }
  if (state.sort === "anno-recente") {
    return sorted.sort((first, second) => Number(second.year) - Number(first.year));
  }
  return sorted.sort((first, second) => Number(Boolean(second.featured)) - Number(Boolean(first.featured)));
}

function renderVehicles() {
  const query = normalizeText(state.search);
  const filtered = state.vehicles.filter((vehicle) => {
    if (vehicle.available === false) {
      return false;
    }
    if (state.mode !== "tutte" && vehicle.mode !== state.mode) {
      return false;
    }
    if (state.brand !== "tutte" && vehicle.brand !== state.brand) {
      return false;
    }
    const searchable = normalizeText(`${vehicle.title} ${vehicle.brand} ${vehicle.mode} ${vehicle.fuel}`);
    return !query || searchable.includes(query);
  });

  const vehicles = sortedVehicles(filtered);
  elements.vehicleGrid.innerHTML = vehicles.map(vehicleCard).join("");
  elements.vehicleGrid.hidden = vehicles.length === 0;
  elements.emptyState.hidden = vehicles.length !== 0;
  elements.vehicleCount.textContent = `${vehicles.length} ${vehicles.length === 1 ? "auto disponibile" : "auto disponibili"}`;
}

function addSpec(label, value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = String(value);
  wrapper.append(term, description);
  return wrapper;
}

function openVehicleDetails(vehicleId) {
  const vehicle = state.vehicles.find((item) => String(item.id) === String(vehicleId));
  if (!vehicle) {
    return;
  }

  const isRental = vehicle.mode === "noleggio";
  const title = String(vehicle.title || `${vehicle.brand || "Auto"} ${vehicle.model || ""}`).trim();
  elements.dialogTitle.textContent = title;
  elements.dialogMode.textContent = isRental ? "Noleggio" : "Vendita";
  elements.dialogImage.src = imageUrl(vehicle.image);
  elements.dialogImage.alt = title;
  elements.dialogDescription.textContent = vehicle.description || "Contattaci per verificare disponibilità e condizioni.";
  elements.dialogContact.href = contactUrl(`Buongiorno, vorrei informazioni su ${title}.`);
  elements.dialogPrice.replaceChildren(document.createTextNode(euro.format(Number(vehicle.price) || 0)));
  const suffix = document.createElement("span");
  suffix.textContent = isRental ? "al giorno" : "prezzo";
  elements.dialogPrice.append(suffix);

  const specs = [
    addSpec("Anno", vehicle.year),
    addSpec("Chilometri", vehicle.kilometers !== undefined ? `${formatNumber(vehicle.kilometers)} km` : ""),
    addSpec("Alimentazione", vehicle.fuel),
    addSpec("Cambio", vehicle.transmission),
    addSpec("Posti", vehicle.seats),
  ].filter(Boolean);
  elements.dialogSpecs.replaceChildren(...specs);
  elements.dialog.showModal();
}

function bindEvents() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((tab) => {
        tab.setAttribute("aria-pressed", String(tab === button));
      });
      renderVehicles();
    });
  });

  elements.brandFilter.addEventListener("change", (event) => {
    state.brand = event.target.value;
    renderVehicles();
  });
  elements.sortFilter.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderVehicles();
  });
  elements.searchFilter.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderVehicles();
  });
  elements.vehicleGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-vehicle]");
    if (button) {
      openVehicleDetails(button.dataset.openVehicle);
    }
  });
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) {
      elements.dialog.close();
    }
  });
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.menuToggle.getAttribute("aria-expanded") === "true";
    elements.menuToggle.setAttribute("aria-expanded", String(!isOpen));
    elements.menuToggle.setAttribute("aria-label", isOpen ? "Apri il menu" : "Chiudi il menu");
    elements.navigation.classList.toggle("is-open", !isOpen);
  });
  elements.navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      elements.menuToggle.setAttribute("aria-expanded", "false");
      elements.menuToggle.setAttribute("aria-label", "Apri il menu");
      elements.navigation.classList.remove("is-open");
    }
  });
  document.addEventListener("error", (event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.dataset.fallback !== "true") {
      image.dataset.fallback = "true";
      image.src = fallbackImage;
    }
  }, true);
}

async function init() {
  const [vehiclesResponse, siteResponse] = await Promise.all([
    fetch("data/vehicles.json"),
    fetch("data/site.json"),
  ]);
  if (!vehiclesResponse.ok || !siteResponse.ok) {
    throw new Error("Impossibile caricare i contenuti del sito.");
  }

  const [vehicleData, siteData] = await Promise.all([
    vehiclesResponse.json(),
    siteResponse.json(),
  ]);
  if (!Array.isArray(vehicleData.vehicles)) {
    throw new Error("Il file data/vehicles.json non contiene l'elenco auto previsto.");
  }

  state.vehicles = vehicleData.vehicles;
  state.site = siteData;
  updateSiteDetails();
  buildBrandFilter();
  setHeroVehicle();
  renderVehicles();
  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  bindEvents();
}

init().catch((error) => {
  console.error(error);
  elements.vehicleCount.textContent = "Il parco auto non è al momento disponibile.";
  elements.vehicleGrid.hidden = true;
  elements.emptyState.hidden = false;
});