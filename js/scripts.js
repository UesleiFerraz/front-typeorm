axios.defaults.baseURL = "http://localhost:3000";

const username = document.querySelector("#username");
const password = document.querySelector("#password");
const repeatPassword = document.querySelector("#repeat-password");

async function registerUser(e) {
  e.preventDefault();

  // !username.value ? (usernameError.innerHTML = "username invalido") : "";

  // if (password.value.length < 6) {
  //   passwordError.innerHTML = "A senha deve ter pelo menos 6 caracteres";
  // }

  // if (password.value !== repeatPassword.value) {
  //   repeatPasswordError.innerHTML = "As senhas não são iguais";
  // }

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
  }
}

async function login(e) {
  e.preventDefault();
  try {
    const user = await axios.post("/auth", {
      username: username.value,
      password: password.value,
    });

    localStorage.setItem("token", user.data.token);
    location = "scraps.html";
  } catch (error) {
    if (error.message.includes("406")) {
      passwordError.innerHTML = "Senha invalida";
      iconShowHidePassword1.classList.add("invalid");
    } else {
      usernameError.innerHTML = "nome de usuario não existe";
      iconShowHidePassword1.classList.add("invalid");
    }
  }
}
