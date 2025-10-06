const URL_API = "http://localhost:5678/api";
let works = [];
let categories = [];

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

function openGalleryModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "gallery-modal";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">&times;</button>
      <h3>Galerie photo</h3>
      <div class="modal-gallery"></div>
      <button class="add-photo-btn">Ajouter une photo</button>
    </div>
  `;

  document.body.appendChild(modal);

  displayWorksInModal();

  modal.querySelector(".close-modal").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  modal
    .querySelector(".add-photo-btn")
    .addEventListener("click", openAddPhotoModal);
}

function displayWorksInModal() {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-work");
    figure.dataset.id = work.id;

    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button class="delete-work-btn" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    modalGallery.appendChild(figure);

    figure.querySelector(".delete-work-btn").addEventListener("click", () => {
      deleteWork(work.id);
    });
  });
}

function openAddPhotoModal() {
  closeModal();

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "add-photo-modal";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">&times;</button>
      <button class="back-btn"><i class="fa-solid fa-arrow-left"></i></button>
      <h3>Ajout photo</h3>
      <form id="add-photo-form">
        <div class="photo-upload-container">
          <i class="fa-solid fa-image"></i>
          <label for="photo-input" class="photo-label">+ Ajouter photo</label>
          <input type="file" id="photo-input" accept="image/png, image/jpeg" hidden>
          <p class="photo-info">jpg, png : 4mo max</p>
          <img id="photo-preview" style="display:none;">
        </div>
        
        <label for="title-input">Titre</label>
        <input type="text" id="title-input" required>
        
        <label for="category-select">Catégorie</label>
        <select id="category-select" required>
          <option value="">Sélectionnez une catégorie</option>
        </select>

        <hr class="form-separator">
        
        <button type="submit" class="validate-btn" disabled>Valider</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const categorySelect = modal.querySelector("#category-select");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });

  modal.querySelector(".close-modal").addEventListener("click", closeModal);
  modal.querySelector(".back-btn").addEventListener("click", () => {
    closeModal();
    openGalleryModal();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const photoInput = modal.querySelector("#photo-input");
  const photoPreview = modal.querySelector("#photo-preview");
  const uploadContainer = modal.querySelector(".photo-upload-container");

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 4Mo");
        photoInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = "block";
        uploadContainer.querySelector("i").style.display = "none";
        uploadContainer.querySelector(".photo-label").style.display = "none";
        uploadContainer.querySelector(".photo-info").style.display = "none";
      };
      reader.readAsDataURL(file);

      checkFormValidity();
    }
  });

  const titleInput = modal.querySelector("#title-input");
  const validateBtn = modal.querySelector(".validate-btn");

  titleInput.addEventListener("input", checkFormValidity);
  categorySelect.addEventListener("change", checkFormValidity);

  function checkFormValidity() {
    const hasPhoto = photoInput.files.length > 0;
    const hasTitle = titleInput.value.trim() !== "";
    const hasCategory = categorySelect.value !== "";

    if (hasPhoto && hasTitle && hasCategory) {
      validateBtn.disabled = false;
      validateBtn.style.backgroundColor = "#1D6154";
    } else {
      validateBtn.disabled = true;
      validateBtn.style.backgroundColor = "#A7A7A7";
    }
  }

  const form = modal.querySelector("#add-photo-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addWork(photoInput.files[0], titleInput.value, categorySelect.value);
  });
}

function closeModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => modal.remove());
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

function showWorks(worksToDisplay) {
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

async function deleteWork(workId) {
  const token = localStorage.getItem("authToken");

  if (!confirm("Voulez-vous vraiment supprimer cette image ?")) {
    return;
  }

  try {
    const response = await fetch(`${URL_API}/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }

    works = works.filter((work) => work.id !== workId);

    showWorks(works);
    displayWorksInModal();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la suppression");
  }
}

async function addWork(imageFile, title, categoryId) {
  const token = localStorage.getItem("authToken");

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", title);
  formData.append("category", categoryId);

  try {
    const response = await fetch(`${URL_API}/works`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout");
    }

    const newWork = await response.json();

    works.push(newWork);

    showWorks(works);

    closeModal();
    openGalleryModal();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de l'ajout de la photo");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchData();
  updateNav();
  showAdminElements();
});
