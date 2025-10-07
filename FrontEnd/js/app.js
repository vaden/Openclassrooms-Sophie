import { openGalleryModal } from "./modals.js";
const URL_API = "http://localhost:5678/api";

export let works = [];
export let categories = [];

export function setWorks(newWorks) {
  works = newWorks;
}

export function removeWork(workId) {
  works = works.filter((work) => work.id !== workId);
}

export function addNewWork(work) {
  works.push(work);
}

function isLoggedIn() {
  return localStorage.getItem("authToken") !== null;
}

function updateNav() {
  const loginLink = document.querySelector("#login-link");

  if (isLoggedIn()) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
}

function showAdminElements() {
  if (!isLoggedIn()) return;

  const banner = document.createElement("div");
  banner.classList.add("admin-banner");
  banner.innerHTML = `
    <i class="fa-regular fa-pen-to-square"></i>
    <p>Mode édition</p>
  `;
  document.body.insertBefore(banner, document.body.firstChild);

  const portfolioTitle = document.querySelector("#portfolio h2");
  const modifyBtn = document.createElement("button");
  modifyBtn.classList.add("modify-btn");
  modifyBtn.innerHTML = `
    <i class="fa-regular fa-pen-to-square"></i>
    modifier
  `;

  const titleContainer = document.createElement("div");
  titleContainer.classList.add("portfolio-title-container");
  portfolioTitle.parentNode.insertBefore(titleContainer, portfolioTitle);
  titleContainer.appendChild(portfolioTitle);
  titleContainer.appendChild(modifyBtn);

  const filtres = document.querySelector("#filtres");
  if (filtres) {
    filtres.style.display = "none";
  }

  modifyBtn.addEventListener("click", openGalleryModal);
}

async function fetchData() {
  try {
    const [worksResponse, categoriesResponse] = await Promise.all([
      fetch(`${URL_API}/works`),
      fetch(`${URL_API}/categories`),
    ]);

    if (!worksResponse.ok) {
      throw new Error(`Erreur works: ${worksResponse.status}`);
    }
    if (!categoriesResponse.ok) {
      throw new Error(`Erreur categories: ${categoriesResponse.status}`);
    }

    works = await worksResponse.json();
    categories = await categoriesResponse.json();

    showWorks(works);
    createFilters();
  } catch (error) {
    console.error("Erreur:", error);
  }
}

export function showWorks(worksToDisplay) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  worksToDisplay.forEach((work) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    const figCaption = document.createElement("figcaption");

    img.src = work.imageUrl;
    img.alt = work.title;
    figCaption.textContent = work.title;

    fig.appendChild(img);
    fig.appendChild(figCaption);
    gallery.appendChild(fig);
  });
}

function removeSelectedClass() {
  const pills = document.querySelector(".pills");
  pills.querySelectorAll("li").forEach((pill) => {
    pill.classList.remove("selected");
  });
}

function createFilters() {
  const pills = document.querySelector(".pills");
  const all = document.querySelector("#all");

  if (all) {
    all.addEventListener("click", () => {
      removeSelectedClass();
      all.classList.add("selected");
      showWorks(works);
    });
  }

  categories.forEach((category) => {
    const pill = document.createElement("li");
    pill.textContent = category.name;
    pill.classList.add("pill");
    pills.appendChild(pill);

    pill.addEventListener("click", () => {
      removeSelectedClass();
      pill.classList.add("selected");
      filterByCategory(category.name);
    });
  });
}

function filterByCategory(nomCategorie) {
  const worksFiltres = works.filter(
    (work) => work.category.name === nomCategorie
  );
  showWorks(worksFiltres);
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchData();
  updateNav();
  showAdminElements();
});
