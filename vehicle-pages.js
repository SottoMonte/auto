const fallbackImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=82";

const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const pageState = {
  vehicles: [],
  site: {},
  filters: {
    mode: "tutte",
    brand: "tutte",
    model: "tutte",
    fuel: "tutte",
    transmission: "tutte",
    search: "",
    priceMax: "",
    sort: "evidenza",
  },
};

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT");
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

function vehicleImages(vehicle) {
  const images = [...new Set([vehicle.image, ...(Array.isArray(vehicle.images) ? vehicle.images : [])]
    .filter((image) => typeof image === "string" && image.trim()))];
  return images.length ? images : [fallbackImage];
}

function vehicleTitle(vehicle) {
  return String(vehicle.title || `${vehicle.brand || "Auto"} ${vehicle.model || ""}`).trim();
}

function formatPrice(value) {
  const price = Number(value);
  return euro.format(Number.isFinite(price) ? price : 0);
}

function validEmail(value) {
  const email = String(value ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function whatsappUrl(message) {
  const number = String(pageState.site.whatsapp ?? "").replace(/\D/g, "");
  return number.length >= 8
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : "";
}

function setLink(element, href) {
  element.hidden = !href;
  if (href) {
    element.href = href;
  } else {
    element.removeAttribute("href");
  }
}

function updateSharedContent() {
  const brand = String(pageState.site.brand || "STRADA").trim();
  const city = String(pageState.site.city || "La tua città").trim();
  const email = validEmail(pageState.site.email);
  const phone = String(pageState.site.phone || "").trim();
  const whatsappNumber = String(pageState.site.whatsapp || "").replace(/\D/g, "");
  const phoneLabel = phone || `+${whatsappNumber}`;
  const whatsapp = whatsappUrl(`Buongiorno, vorrei ricevere informazioni da ${brand}.`);

  document.querySelectorAll("[data-brand]").forEach((element) => {
    element.textContent = brand;
  });
  document.querySelectorAll("[data-city]").forEach((element) => {
    element.textContent = city;
  });

  const toplineEmail = byId("topline-email");
  setLink(toplineEmail, email ? `mailto:${email}` : "");
  toplineEmail.textContent = email;
  const toplineWhatsapp = byId("topline-whatsapp");
  setLink(toplineWhatsapp, whatsapp);
  byId("topline-whatsapp-number").textContent = phoneLabel;
  if (whatsapp) toplineWhatsapp.setAttribute("aria-label", `WhatsApp ${phoneLabel}`);
  byId("topline-contacts").hidden = !email && !whatsapp;

  const address = String(pageState.site.address || "").trim();
  const footerAddress = byId("contact-address");
  footerAddress.hidden = !address;
  footerAddress.textContent = address;

  const footerEmail = byId("contact-email");
  setLink(footerEmail, email ? `mailto:${email}` : "");
  footerEmail.textContent = email;

  const facebook = String(pageState.site.facebook || "").trim();
  const footerFacebook = byId("contact-facebook");
  footerFacebook.hidden = !facebook;
  footerFacebook.textContent = facebook;

  const instagram = String(pageState.site.instagram || "").trim();
  const footerInstagram = byId("contact-instagram");
  footerInstagram.hidden = !instagram;
  footerInstagram.textContent = instagram;

  const footerBusinessLines = [pageState.site.services, pageState.site.service_note]
    .map((line) => String(line || "").trim())
    .filter(Boolean);
  const footerBusinessCopy = byId("footer-business-copy");
  footerBusinessCopy.replaceChildren();
  footerBusinessLines.forEach((line, index) => {
    if (index > 0) footerBusinessCopy.append(document.createElement("br"));
    footerBusinessCopy.append(document.createTextNode(line));
  });
  footerBusinessCopy.hidden = footerBusinessLines.length === 0;

  const footerPhone = byId("contact-phone");
  setLink(footerPhone, phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "");
  footerPhone.textContent = phone;
  byId("header-contact").href = whatsapp || (email ? `mailto:${email}` : "#contatti");

  const legal = pageState.site.legal || {};
  const legalFields = [
    ["Titolare o denominazione", legal.holder],
    ["Forma giuridica", legal.legal_form],
    ["Sede legale", legal.registered_office],
    ["Partita IVA", legal.vat_number],
    ["REA", legal.rea],
  ];
  const legalRows = legalFields
    .filter(([, value]) => String(value ?? "").trim())
    .map(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = String(value).trim();
      row.append(term, description);
      return row;
    });
  byId("legal-details-list").replaceChildren(...legalRows);
  byId("legal-details").hidden = legalRows.length === 0;
  byId("current-year").textContent = String(new Date().getFullYear());

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Apri il menu" : "Chiudi il menu");
    navigation.classList.toggle("is-open", !isOpen);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri il menu");
      navigation.classList.remove("is-open");
    }
  });
}

function addSpec(label, value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = String(value);
  row.append(term, description);
  return row;
}

function vehicleSpecs(vehicle, includeBodySeats = true) {
  const specs = [
    addSpec("Formula", vehicle.mode === "noleggio" ? "Noleggio" : "Vendita"),
    addSpec("Anno", vehicle.year),
    addSpec("Chilometri", vehicle.kilometers !== undefined && vehicle.kilometers !== ""
      ? `${new Intl.NumberFormat("it-IT").format(Number(vehicle.kilometers))} km`
      : ""),
    addSpec("Alimentazione", vehicle.fuel),
    addSpec("Cambio", vehicle.transmission),
    ];
    if (includeBodySeats) {
      specs.push(addSpec("Posti", vehicle.seats));
    }
    return specs.filter(Boolean);
  }

  function technicalFieldRows(source, fields) {
    return fields.map(([key, label, unit]) => {
      const value = source?.[key];
      if (value === undefined || value === null || value === "") return null;
      const formatted = typeof value === "number" && Number.isFinite(value)
        ? new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(value)
        : String(value).trim();
      return addSpec(label, unit ? `${formatted} ${unit}` : formatted);
    }).filter(Boolean);
  }

  function technicalGroup(title, source, fields) {
    const rows = technicalFieldRows(source, fields);
    return rows.length ? { title, rows } : null;
  }

  function renderTechnicalData(vehicle) {
    const technical = vehicle.technical || {};
    const consumption = technical.consumption || {};
    const fuel = normalizeText(vehicle.fuel);
    const isHybrid = /ibrid|hybrid/.test(fuel);
    const isElectric = /elettric|electric/.test(fuel);
    const showCombustion = !isElectric || isHybrid;
    const showElectric = isElectric || isHybrid;
    const groups = [];

    if (showCombustion) {
      groups.push(technicalGroup("Motore termico", technical.combustion, [
        ["displacement_cc", "Cilindrata", "cc"],
        ["cylinders", "Cilindri", ""],
        ["gears", "Marce", ""],
        ["max_power_kw", "Potenza massima (kW)", ""],
        ["max_power_cv", "Potenza massima (CV)", ""],
        ["max_power_rpm", "Regime potenza massima", "giri/min"],
        ["max_torque_nm", "Coppia massima", "Nm"],
        ["max_torque_rpm", "Regime coppia massima", "giri/min"],
        ["traction", "Trazione", ""],
        ["fuel_tank_l", "Serbatoio", "L"],
      ]));
    }

    if (showElectric) {
      groups.push(technicalGroup("Motore elettrico e batteria", technical.electric, [
        ["power_kw", "Potenza motore (kW)", ""],
        ["power_cv", "Potenza motore (CV)", ""],
        ["torque_nm", "Coppia motore", "Nm"],
        ["battery_capacity_kwh", "Batteria", "kWh"],
        ["range_km", "Autonomia omologata", "km"],
        ["charging_power_kw", "Potenza di ricarica", "kW"],
      ]));
    }

    const body = technical.body || {};
    groups.push(technicalGroup("Carrozzeria", body, [
      ["height_mm", "Altezza", "mm"],
      ["width_mm", "Larghezza", "mm"],
      ["length_mm", "Lunghezza", "mm"],
      ["doors", "Porte", ""],
      ["type", "Carrozzeria", ""],
      ["max_mass_kg", "Massa massima", "kg"],
      ["trunk_min_l", "Bagagliaio", "L"],
      ["trunk_max_l", "Bagagliaio massimo", "L"],
      ["seats", "Posti", ""],
      ["color", "Colore", ""],
    ]));

    groups.push(technicalGroup("Prestazioni", technical.performance, [
      ["top_speed_kmh", "Velocità massima", "km/h"],
      ["acceleration_0_100_s", "0-100 km/h", "s"],
    ]));

    if (showCombustion) {
      groups.push(technicalGroup(isHybrid ? "Consumi carburante" : "Consumi ed emissioni", consumption, [
        ["urban_l_100km", "Urbano", "L/100 km"],
        ["extraurban_l_100km", "Extraurbano", "L/100 km"],
        ["combined_l_100km", "Misto", "L/100 km"],
        ["emissions_standard", "Omologazione", ""],
      ]));
    }

    if (showElectric) {
      groups.push(technicalGroup(isHybrid ? "Consumi elettrici" : "Consumi e autonomia", consumption, [
        ["urban_kwh_100km", "Urbano", "kWh/100 km"],
        ["extraurban_kwh_100km", "Extraurbano", "kWh/100 km"],
        ["combined_kwh_100km", "Misto", "kWh/100 km"],
      ]));
    }

    const visibleGroups = groups.filter(Boolean);
    const container = byId("detail-technical");
    const grid = byId("detail-technical-grid");
    grid.replaceChildren(...visibleGroups.map(({ title, rows }) => {
      const section = document.createElement("section");
      const heading = document.createElement("h3");
      const specs = document.createElement("dl");
      section.className = "detail-technical__group";
      heading.textContent = title;
      specs.className = "detail-technical__specs";
      specs.replaceChildren(...rows);
      section.append(heading, specs);
      return section;
    }));
    container.hidden = visibleGroups.length === 0;
}

function renderCatalogCard(vehicle) {
  const title = vehicleTitle(vehicle);
  const isRental = vehicle.mode === "noleggio";
  const details = [
    vehicle.year ? String(vehicle.year) : "",
    vehicle.kilometers !== undefined && vehicle.kilometers !== ""
      ? `${new Intl.NumberFormat("it-IT").format(Number(vehicle.kilometers))} km`
      : "",
    vehicle.fuel || "",
    vehicle.transmission || "",
  ].filter(Boolean);
  const images = vehicleImages(vehicle);
  const vehicleUrl = `auto.html?id=${encodeURIComponent(vehicle.id)}`;

  return `
    <article class="vehicle-card catalog-card">
      <button class="vehicle-card__image catalog-card__image" type="button" data-open-vehicle="${escapeHtml(vehicle.id)}" aria-label="Apri l'anteprima di ${escapeHtml(title)}">
        <img src="${escapeHtml(imageUrl(images[0]))}" alt="" loading="lazy" decoding="async" />
        <span class="vehicle-card__badge">${isRental ? "Noleggio" : "Vendita"}</span>
        ${vehicle.featured ? '<span class="vehicle-card__featured">In evidenza</span>' : ""}
        ${images.length > 1 ? `<span class="catalog-photo-count">${images.length} foto</span>` : ""}
      </button>
      <div class="vehicle-card__body">
        <p class="vehicle-card__eyebrow">${escapeHtml(vehicle.brand || "")}</p>
        <h3>${escapeHtml(title)}</h3>
        <ul class="vehicle-card__specs">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
        <div class="vehicle-card__footer">
          <p class="vehicle-card__price"><strong>${escapeHtml(formatPrice(vehicle.price))}</strong><span>${isRental ? "al giorno" : "prezzo"}</span></p>
          <a class="vehicle-card__details" href="${escapeHtml(vehicleUrl)}">Scheda completa <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>
  `;
}

function fillSelect(select, values, allLabel) {
  const options = [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second, "it"));
  select.replaceChildren(new Option(allLabel, "tutte"));
  options.forEach((value) => select.add(new Option(value, value)));
}

function initCatalog() {
  const availableVehicles = pageState.vehicles.filter((vehicle) => vehicle.available !== false);
  const brands = [...new Set(availableVehicles
    .map((vehicle) => String(vehicle.brand || "").trim())
    .filter(Boolean))]
    .sort((first, second) => first.localeCompare(second, "it"));
  const brandFilter = byId("catalog-brands");
  const modelFilter = byId("catalog-model");
  const brandOptions = [["tutte", "Tutte le marche"], ...brands.map((brand) => [brand, brand])];
  brandFilter.replaceChildren(...brandOptions.map(([value, label], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-brand-chip";
    button.dataset.brand = value;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(index === 0));
    return button;
  }));
  fillSelect(byId("catalog-fuel"), availableVehicles.map((vehicle) => vehicle.fuel), "Tutte");
  fillSelect(byId("catalog-transmission"), availableVehicles.map((vehicle) => vehicle.transmission), "Tutti");

  function updateModelOptions() {
    const models = availableVehicles
      .filter((vehicle) => {
        if (pageState.filters.mode !== "tutte" && vehicle.mode !== pageState.filters.mode) return false;
        if (pageState.filters.brand !== "tutte" && normalizeText(vehicle.brand) !== normalizeText(pageState.filters.brand)) return false;
        if (pageState.filters.fuel !== "tutte" && vehicle.fuel !== pageState.filters.fuel) return false;
        if (pageState.filters.transmission !== "tutte" && vehicle.transmission !== pageState.filters.transmission) return false;
        if (pageState.filters.priceMax && Number(vehicle.price) > Number(pageState.filters.priceMax)) return false;
        return true;
      })
      .sort((first, second) => vehicleTitle(first).localeCompare(vehicleTitle(second), "it"));
    const modelOptions = [new Option("Tutti i modelli", "tutte"), ...models.map((vehicle) => {
      const label = `${vehicleTitle(vehicle)}${vehicle.year ? ` (${vehicle.year})` : ""}`;
      return new Option(label, String(vehicle.id));
    })];
    const modelExists = models.some((vehicle) => String(vehicle.id) === pageState.filters.model);
    if (pageState.filters.model !== "tutte" && !modelExists) {
      pageState.filters.model = "tutte";
    }
    modelFilter.replaceChildren(...modelOptions);
    modelFilter.value = pageState.filters.model;
  }

  function render() {
    const query = normalizeText(pageState.filters.search);
    const maxPrice = Number(pageState.filters.priceMax);
    const results = pageState.vehicles.filter((vehicle) => {
      if (vehicle.available === false) return false;
      if (pageState.filters.mode !== "tutte" && vehicle.mode !== pageState.filters.mode) return false;
      if (pageState.filters.brand !== "tutte" && normalizeText(vehicle.brand) !== normalizeText(pageState.filters.brand)) return false;
      if (pageState.filters.model !== "tutte" && String(vehicle.id) !== pageState.filters.model) return false;
      if (pageState.filters.fuel !== "tutte" && vehicle.fuel !== pageState.filters.fuel) return false;
      if (pageState.filters.transmission !== "tutte" && vehicle.transmission !== pageState.filters.transmission) return false;
      if (pageState.filters.priceMax && Number(vehicle.price) > maxPrice) return false;
      const searchable = normalizeText(`${vehicle.title} ${vehicle.brand} ${vehicle.mode} ${vehicle.fuel}`);
      return !query || searchable.includes(query);
    });

    const sort = pageState.filters.sort;
    if (sort === "prezzo-crescente") results.sort((first, second) => Number(first.price) - Number(second.price));
    if (sort === "prezzo-decrescente") results.sort((first, second) => Number(second.price) - Number(first.price));
    if (sort === "anno-recente") results.sort((first, second) => Number(second.year) - Number(first.year));
    if (sort === "evidenza") results.sort((first, second) => Number(Boolean(second.featured)) - Number(Boolean(first.featured)));

    byId("catalog-grid").innerHTML = results.map(renderCatalogCard).join("");
    byId("catalog-grid").hidden = results.length === 0;
    byId("catalog-empty").hidden = results.length !== 0;
    byId("catalog-count").textContent = `${results.length} ${results.length === 1 ? "auto disponibile" : "auto disponibili"}`;
    byId("catalog-price-unit").textContent = pageState.filters.mode === "noleggio"
      ? "Tariffa giornaliera in euro"
      : pageState.filters.mode === "vendita"
        ? "Prezzo totale in euro"
        : "Prezzo totale o tariffa giornaliera";
  }

  document.querySelectorAll("[data-catalog-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      pageState.filters.mode = button.dataset.catalogMode;
      document.querySelectorAll("[data-catalog-mode]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      updateModelOptions();
      render();
    });
  });
  brandFilter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-brand]");
    if (!button) return;
    pageState.filters.brand = button.dataset.brand;
    brandFilter.querySelectorAll("[data-brand]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    updateModelOptions();
    render();
  });
  modelFilter.addEventListener("change", (event) => {
    pageState.filters.model = event.target.value;
    updateModelOptions();
    render();
  });
  byId("catalog-search").addEventListener("input", (event) => {
    pageState.filters.search = event.target.value;
    render();
  });
  byId("catalog-fuel").addEventListener("change", (event) => {
    pageState.filters.fuel = event.target.value;
    updateModelOptions();
    render();
  });
  byId("catalog-transmission").addEventListener("change", (event) => {
    pageState.filters.transmission = event.target.value;
    updateModelOptions();
    render();
  });
  byId("catalog-price-max").addEventListener("input", (event) => {
    pageState.filters.priceMax = event.target.value;
    updateModelOptions();
    render();
  });
  byId("catalog-sort").addEventListener("change", (event) => {
    pageState.filters.sort = event.target.value;
    render();
  });
  byId("catalog-reset").addEventListener("click", () => {
    pageState.filters = { mode: "tutte", brand: "tutte", model: "tutte", fuel: "tutte", transmission: "tutte", search: "", priceMax: "", sort: "evidenza" };
    byId("catalog-search").value = "";
    modelFilter.value = "tutte";
    byId("catalog-fuel").value = "tutte";
    byId("catalog-transmission").value = "tutte";
    byId("catalog-price-max").value = "";
    byId("catalog-sort").value = "evidenza";
    document.querySelectorAll("[data-catalog-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.catalogMode === "tutte"));
    });
    brandFilter.querySelectorAll("[data-brand]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.brand === "tutte"));
    });
    updateModelOptions();
    render();
  });

  updateModelOptions();
  initCatalogDialog();
  render();
}

function initCatalogDialog() {
  const dialog = byId("catalog-dialog");
  const image = byId("catalog-dialog-image");
  const thumbnails = byId("catalog-dialog-thumbnails");
  let currentVehicle = null;
  let images = [];
  let currentImage = 0;

  function setImage(index) {
    if (!images.length || !currentVehicle) return;
    currentImage = ((index % images.length) + images.length) % images.length;
    image.src = imageUrl(images[currentImage]);
    image.alt = `${vehicleTitle(currentVehicle)}, foto ${currentImage + 1}`;
    byId("catalog-dialog-counter").textContent = images.length > 1 ? `${currentImage + 1} / ${images.length}` : "";
    thumbnails.querySelectorAll("[data-image-index]").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.imageIndex) === currentImage));
    });
  }

  function open(vehicleId) {
    currentVehicle = pageState.vehicles.find((vehicle) => String(vehicle.id) === String(vehicleId));
    if (!currentVehicle) return;

    const title = vehicleTitle(currentVehicle);
    const isRental = currentVehicle.mode === "noleggio";
    const modeLabel = isRental ? "noleggio" : "vendita";
    const message = `Buongiorno, vorrei informazioni su ${title}${currentVehicle.year ? `, anno ${currentVehicle.year}` : ""} (${modeLabel}).`;
    const email = validEmail(pageState.site.email);
    images = vehicleImages(currentVehicle);
    byId("catalog-dialog-title").textContent = title;
    byId("catalog-dialog-mode").textContent = isRental ? "Noleggio" : "Vendita";
    byId("catalog-dialog-price").replaceChildren(document.createTextNode(formatPrice(currentVehicle.price)));
    const suffix = document.createElement("span");
    suffix.textContent = isRental ? "al giorno" : "prezzo";
    byId("catalog-dialog-price").append(suffix);
    byId("catalog-dialog-description").textContent = currentVehicle.description || "Contattaci per verificare disponibilità e condizioni.";
    byId("catalog-dialog-specs").replaceChildren(...vehicleSpecs(currentVehicle));
    byId("catalog-dialog-full-details").href = `auto.html?id=${encodeURIComponent(currentVehicle.id)}`;
    setLink(byId("catalog-dialog-email"), email
      ? `mailto:${email}?subject=${encodeURIComponent(`Informazioni ${modeLabel}: ${title}`)}&body=${encodeURIComponent(message)}`
      : "");
    setLink(byId("catalog-dialog-whatsapp"), whatsappUrl(message));
    thumbnails.replaceChildren(...images.map((src, index) => {
      const button = document.createElement("button");
      const thumbnail = document.createElement("img");
      button.type = "button";
      button.className = "vehicle-dialog__thumb";
      button.dataset.imageIndex = String(index);
      button.setAttribute("aria-label", `Mostra foto ${index + 1}`);
      button.setAttribute("aria-pressed", String(index === 0));
      thumbnail.src = imageUrl(src);
      thumbnail.alt = "";
      button.append(thumbnail);
      return button;
    }));
    thumbnails.hidden = images.length < 2;
    setImage(0);
    dialog.showModal();
  }

  byId("catalog-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-vehicle]");
    if (button) open(button.dataset.openVehicle);
  });
  thumbnails.addEventListener("click", (event) => {
    const button = event.target.closest("[data-image-index]");
    if (button) setImage(Number(button.dataset.imageIndex));
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function initVehicleDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  const vehicle = pageState.vehicles.find((item) => String(item.id) === id);
  if (!vehicle) {
    byId("vehicle-not-found").hidden = false;
    return;
  }

  const title = vehicleTitle(vehicle);
  const isRental = vehicle.mode === "noleggio";
  const message = `Buongiorno, vorrei informazioni su ${title}${vehicle.year ? `, anno ${vehicle.year}` : ""} (${isRental ? "noleggio" : "vendita"}).`;
  const images = vehicleImages(vehicle);
  byId("vehicle-detail").hidden = false;
  byId("detail-breadcrumb-title").textContent = title;
  byId("detail-mode").textContent = isRental ? "Noleggio" : "Vendita";
  byId("detail-brand").textContent = String(vehicle.brand || "");
  byId("detail-title").textContent = title;
  byId("detail-price").textContent = formatPrice(vehicle.price);
  byId("detail-price-unit").textContent = isRental ? "al giorno" : "prezzo";
  byId("detail-availability").textContent = vehicle.available === false ? "Non disponibile" : "Disponibile";
  byId("detail-availability").classList.toggle("is-unavailable", vehicle.available === false);
  byId("detail-description").textContent = String(vehicle.description || "").trim();
  document.title = `${title} — ${String(pageState.site.brand || "STRADA")}`;
  document.querySelector('meta[name="description"]').content = String(vehicle.description || `Dettagli, prezzo e disponibilità di ${title}.`);
  const bodySeats = vehicle.technical?.body?.seats;
  byId("detail-specs").replaceChildren(...vehicleSpecs(
    vehicle,
    bodySeats === undefined || bodySeats === null || bodySeats === "",
  ));
  renderTechnicalData(vehicle);

  const email = validEmail(pageState.site.email);
  setLink(byId("detail-email"), email
    ? `mailto:${email}?subject=${encodeURIComponent(`Informazioni ${isRental ? "noleggio" : "vendita"}: ${title}`)}&body=${encodeURIComponent(message)}`
    : "");
  setLink(byId("detail-whatsapp"), whatsappUrl(message));

  const image = byId("detail-image");
  const thumbnails = byId("detail-thumbnails");
  function selectImage(index) {
    const active = ((index % images.length) + images.length) % images.length;
    image.src = imageUrl(images[active]);
    image.alt = `${title}, foto ${active + 1}`;
    byId("detail-image-counter").textContent = images.length > 1 ? `${active + 1} / ${images.length}` : "";
    thumbnails.querySelectorAll("[data-image-index]").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.imageIndex) === active));
    });
  }

  thumbnails.replaceChildren(...images.map((src, index) => {
    const button = document.createElement("button");
    const thumbnail = document.createElement("img");
    button.type = "button";
    button.className = "detail-gallery__thumb";
    button.dataset.imageIndex = String(index);
    button.setAttribute("aria-label", `Mostra foto ${index + 1}`);
    button.setAttribute("aria-pressed", String(index === 0));
    thumbnail.src = imageUrl(src);
    thumbnail.alt = "";
    button.append(thumbnail);
    return button;
  }));
  thumbnails.hidden = images.length < 2;
  thumbnails.addEventListener("click", (event) => {
    const button = event.target.closest("[data-image-index]");
    if (button) selectImage(Number(button.dataset.imageIndex));
  });
  selectImage(0);
}

async function initializeVehiclePages() {
  const [vehiclesResponse, siteResponse] = await Promise.all([
    fetch("data/vehicles.json"),
    fetch("data/site.json", { cache: "no-store" }),
  ]);
  if (!vehiclesResponse.ok || !siteResponse.ok) {
    throw new Error("Impossibile caricare i dati del parco auto.");
  }

  const [vehiclesData, siteData] = await Promise.all([vehiclesResponse.json(), siteResponse.json()]);
  pageState.vehicles = Array.isArray(vehiclesData.vehicles) ? vehiclesData.vehicles : [];
  pageState.site = siteData;
  updateSharedContent();

  if (document.body.dataset.page === "catalog") {
    initCatalog();
  } else {
    initVehicleDetail();
  }
}

initializeVehiclePages().catch((error) => {
  console.error(error);
  const count = byId("catalog-count");
  if (count) count.textContent = "Impossibile caricare il parco auto.";
  const notFound = byId("vehicle-not-found");
  if (notFound) notFound.hidden = false;
});