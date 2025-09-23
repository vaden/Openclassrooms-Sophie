const gallery = document.querySelector(".gallery");
const filtres = document.querySelector("#filtres");

const urlWorks = "http://localhost:5678/api/works/";
const urlCat = "http://localhost:5678/api/categories/";

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
  .then(([works, categories]) => {
    works.map(function (work) {
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

    categories.map(function (categorie) {
      const pills = document.createElement("ul");
      const pill = document.createElement("li");

      pill.innerHTML = `${categorie.name}`;
      pill.classList.add("pill");

      pills.appendChild(pill);
      filtres.appendChild(pills);
    });
  })
  .catch((error) => {
    console.error("Erreur:", error);
  });
