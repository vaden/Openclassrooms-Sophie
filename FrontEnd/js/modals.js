import { works, categories, showWorks, removeWork, addNewWork } from "./app.js";

const URL_API = "http://localhost:5678/api";

export function openGalleryModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "gallery-modal";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal" type="button">&times;</button>
      <h3>Galerie photo</h3>
      <div class="modal-gallery"></div>
      <button class="add-photo-btn" type="button">Ajouter une photo</button>
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

export function displayWorksInModal() {
  const modalGallery = document.querySelector(".modal-gallery");
  if (!modalGallery) return;
  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-work");
    figure.dataset.id = work.id;

    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button type="button" class="delete-work-btn" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    modalGallery.appendChild(figure);

    figure.querySelector(".delete-work-btn").addEventListener("click", () => {
      deleteWork(work.id);
    });
  });
}

export function openAddPhotoModal() {
  closeModal();

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.id = "add-photo-modal";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal" type="button">&times;</button>
      <button class="back-btn" type="button"><i class="fa-solid fa-arrow-left"></i></button>
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

export function closeModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => modal.remove());
}

export async function deleteWork(workId) {
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

    removeWork(workId);

    showWorks(works);
    displayWorksInModal();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la suppression");
  }
}

export async function addWork(imageFile, title, categoryId) {
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

    addNewWork(newWork);

    showWorks(works);

    closeModal();
    openGalleryModal();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de l'ajout de la photo");
  }
}
