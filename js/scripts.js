axios.defaults.baseURL = "http://localhost:3000";

const token = localStorage.getItem("token");
const button = document.querySelector(".save");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const repeatPassword = document.querySelector("#repeat-password");
const title = document.querySelector("#title");
const description = document.querySelector("#description");
const tBody = document.querySelector("tbody");
const usernameError = document.querySelector("#username-error");
const passwordError = document.querySelector("#password-error");
const repeatPasswordError = document.querySelector("#repeat-password-error");
const scrapError = document.querySelector("#scrap-error");

if (document.querySelector("#signUp")) {
  let timerUsername;
  username.addEventListener("keyup", () => {
    clearTimeout(timerUsername);
    timerUsername = setTimeout(async () => {
      try {
        await axios.post("/users", {
          username: username.value,
        });
      } catch (error) {
        if (error.message.includes("409")) {
          usernameError.innerHTML = "usuario ja esta em uso";
        }
      }
    }, 1000);
    usernameError.innerHTML = "";
  });

  password.addEventListener("keyup", () => {
    if (password.value.length < 6) {
      passwordError.innerHTML = "a senha deve ser maior que 6 caracteres";
    } else {
      passwordError.innerHTML = "";
    }
  });

  repeatPassword.addEventListener("keyup", () => {
    if (repeatPassword.value !== password.value) {
      repeatPasswordError.innerHTML = "as senhas não são iguais";
    } else {
      repeatPasswordError.innerHTML = "";
    }
  });
}

async function registerUser(event) {
  event.preventDefault();
  if (
    username.value !== "" &&
    password.value.length >= 6 &&
    password.value === repeatPassword.value
  ) {
    try {
      await axios.post("/users", {
        username: username.value,
        password: password.value,
      });

      username.value = "";
      password.value = "";
      repeatPassword.value = "";
    } catch {
      usernameError.innerHTML = "Verifique se os campos estão preenchidos";
    }
  } else {
    usernameError.innerHTML = "Verifique se os campos estão preenchidos";
  }
}
async function login(event) {
  event.preventDefault();
  try {
    const user = await axios.post("/auth", {
      username: username.value,
      password: password.value,
    });

    localStorage.setItem("token", user.data.token);
    localStorage.setItem("username", username.value);
    location = "scraps.html";
  } catch {
    passwordError.innerHTML = "senha ou nome invalido";
  }
}

if (document.querySelector("#scraps")) {
  document.querySelector(
    "#welcome"
  ).innerHTML = `Bem vindo ao sistema de recados, ${localStorage.getItem(
    "username"
  )}`;

  if (token) {
    try {
      JSON.parse(atob(token.split(".")[1])).userIdToken;
    } catch {
      location = "index.html?error=login";
    }
  } else {
    location = "index.html?error=login";
  }

  title.addEventListener("keyup", () => {
    scrapError.innerHTML = "";
  });

  description.addEventListener("keyup", () => {
    scrapError.innerHTML = "";
  });

  (async function getScraps() {
    const response = await axios.get(`/scraps`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const scraps = response.data.scraps;

    console.log("oi");

    scraps.reverse();
    scraps.forEach(scrap => {
      tBody.innerHTML += `
      <tr id="id_${scrap.id}">
      ${createElement(scrap).innerHTML}
      </tr>
      `;
    });
  })();
}

async function saveScrap(event) {
  event.preventDefault();

  if (button.id) {
    editScrap();
  } else {
    try {
      const response = await axios.post(
        "/scraps",
        {
          title: title.value,
          description: description.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const scrap = response.data.scrap;
      tBody.prepend(createElement(scrap));
      title.value = "";
      description.value = "";
    } catch {
      scrapError.innerHTML = "verifique se todos campos foram preenchidos";
    }
  }
}

async function editScrap() {
  try {
    const response = await axios.put(
      `/scraps/${button.id}`,
      {
        title: title.value,
        description: description.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const scrap = await response.data.scrap;

    document.querySelector(`#id_${button.id}`).innerHTML =
      createElement(scrap).innerHTML;

    title.value = "";
    description.value = "";
    button.id = "";
  } catch {
    scrapError.innerHTML = "verifique se todos campos foram preenchidos";
  }
}

function signOff() {
  localStorage.removeItem("token");
  location = "index.html";
}

function deleteTodo(id) {
  new bootstrap.Modal(document.getElementById("myModal"), {}).show();

  document.querySelector("#excluir").addEventListener("click", async event => {
    event.preventDefault;
    document.querySelector(`#id_${id}`).remove();

    await axios.delete(`/scraps/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
}

function editTodo(id) {
  const data = document.querySelector(`#id_${id}`);

  title.value = data.querySelectorAll("td")[1].innerText;
  description.value = data.querySelectorAll("td")[2].innerText;

  button.id = id;
}

function createElement(scrap) {
  let trDOM = document.createElement("tr");
  trDOM.id = `id_${scrap.id}`;
  trDOM.innerHTML = `
      <td scope="row">${localStorage.getItem("username")}</td>
      <td>${scrap.title}</td>
      <td>${scrap.description}</td>
      <td>
      <a onclick="editTodo('${scrap.id}')">Editar</a>
      <a onclick="deleteTodo('${scrap.id}')">Excluir</a>
      </td>
      `;

  return trDOM;
}
