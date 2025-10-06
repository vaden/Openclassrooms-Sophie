const form = document.querySelector("#login-form");
const errorMessage = document.querySelector("#error-message");
const emailInput = document.querySelector("#email");
const URL_API = "http://localhost:5678/api";

async function login(email, password) {
  try {
    const response = await fetch(`${URL_API}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 404) {
        throw new Error("Email ou mot de passe incorrect");
      }
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem("authToken", data.token);

    return data;
  } catch (error) {
    throw error;
  }
}

emailInput.addEventListener("blur", () => {
  const email = emailInput.value.trim();

  if (email && !isValidEmail(email)) {
    errorMessage.textContent = "Format d'email invalide";
    errorMessage.classList.add("show");
    emailInput.classList.add("input-error");
  } else {
    errorMessage.classList.remove("show");
    emailInput.classList.remove("input-error");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorMessage.classList.remove("show");
  errorMessage.textContent = "";

  const email = emailInput.value.trim();
  const password = document.querySelector("#password").value;

  if (!isValidEmail(email)) {
    errorMessage.textContent = "Veuillez entrer une adresse email valide";
    errorMessage.classList.add("show");
    return;
  }

  try {
    await login(email, password);

    window.location.href = "index.html";
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.classList.add("show");
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
