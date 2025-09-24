const gallery = document.querySelector(".gallery");
const filtres = document.querySelector("#filtres");
const pills = document.querySelector(".pills");
const all = document.querySelector("#all");

const urlWorks = "http://localhost:5678/api/works/";
const urlCat = "http://localhost:5678/api/categories/";

let works = [];
let categories = [];

Promise.all([
  fetch(urlWorks).then((res) => {
    if (!res.ok) {
      throw new Error("Problème ça pue en works");
    }
    return res.json();
  }),
  fetch(urlCat).then((res) => {
    if (!res.ok) {
      throw new Error("Problème ça pue en categories");
    }
    return res.json();
  }),
])
  .then(([worksData, categoriesData]) => {
    works = worksData;
    categories = categoriesData;

    showWorks(works);

    categories.map((category) => {
      const pill = document.createElement("li");
      pill.innerHTML = `${category.name}`;
      pill.classList.add("pill");
      pills.appendChild(pill);

      pill.addEventListener("click", () => {
        pills.querySelectorAll("li").forEach((pill) => {
          if (pill.classList.contains("selected")) {
            pill.classList.remove("selected");
          }
        });

        pill.classList.toggle("selected");
        filterByCategory(category.name);
      });

      if (all) {
        all.addEventListener("click", () => {
          pills.querySelectorAll("li").forEach((pill) => {
            if (pill.classList.contains("selected")) {
              pill.classList.remove("selected");
            }
          });
          all.classList.add("selected");
          showWorks(works);
        });
      }
    });
  })
  .catch((error) => {
    console.error("Erreur:", error);
  });

function showWorks(worksToDisplay) {
  gallery.innerHTML = "";

  worksToDisplay.map((work) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    const figCaption = document.createElement("figcaption");

    img.src = `${work.imageUrl}`;
    img.alt = `${work.title}`;
    figCaption.innerHTML = `${work.title}`;

    fig.appendChild(img);
    fig.appendChild(figCaption);
    gallery.appendChild(fig);
  });
}

function filterByCategory(nomCategorie) {
  const worksFiltres = works.filter(
    (work) => work.category.name === nomCategorie
  );
  showWorks(worksFiltres);
}
