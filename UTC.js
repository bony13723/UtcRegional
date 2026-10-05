// =====================================================
// 1. CONFIGURACIÓN DE FIREBASE
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyAnOXA4LiM6Ctl9060WSQltj_uKoXdyUTg",
  authDomain: "regional-utc.firebaseapp.com",
  projectId: "regional-utc",
  storageBucket: "regional-utc.firebasestorage.app",
  messagingSenderId: "757926590007",
  appId: "1:757926590007:web:e5ad7a96ed6de2790a31b2",
  measurementId: "G-JX2810B11K"
};

// =====================================================
// 2. INICIALIZACIÓN
// =====================================================
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// =====================================================
// 3. ESTADO GLOBAL
// =====================================================
let currentUser = null;
let currentUserRole = "jugador";
let currentUserName = "Usuario";
let isAdmin = false;
let isEditingPlayers = false;

let players = [];
let coaches = [];
let finePeople = [];
let fines = [];

let currentConvocation = null;
let creatingNewConvocation = false;
let currentHighlights = null;

let matches = [];
let selectedMatchId = null;
let matchesUnsubscribe = null;

let playersUnsubscribe = null;
let coachesUnsubscribe = null;
let finesUnsubscribe = null;
let trainingsUnsubscribe = null;
let convocationUnsubscribe = null;
let highlightsUnsubscribe = null;


// =====================================================
// 4. CATÁLOGO DE MULTAS
// =====================================================
const FINE_CATALOG = [
  {
    code: "V_CONV",
    description: "Victoria de jugador convocado",
    amount: 1
  },
  {
    code: "V_NO_CONV",
    description: "Victoria de jugador no convocado",
    amount: 0.5
  },
  {
    code: "E_CONV",
    description: "Empate de jugador convocado",
    amount: 0.5
  },
  {
    code: "T_ENT_1",
    description: "Llegar tarde al entrenamiento entre 21:00 y 21:05",
    amount: 1
  },
  {
    code: "T_ENT_2",
    description: "Llegar tarde al entrenamiento entre 21:05 y 21:10",
    amount: 1.5
  },
  {
    code: "T_ENT_3",
    description: "Llegar tarde al entrenamiento entre 21:10 y 21:15",
    amount: 2
  },
  {
    code: "T_PAR",
    description: "Llegar tarde a un partido (importe por minuto)",
    amount: 0.2
  },
  {
    code: "MOVIL",
    description: "Uso del móvil durante el entrenamiento",
    amount: 1
  },
  {
    code: "RECOGIDA",
    description: "No recoger balones o material",
    amount: 0.5
  },
  {
    code: "AMAR_J",
    description: "Tarjeta amarilla por protestar en el campo",
    amount: 0.5
  },
  {
    code: "AMAR_B",
    description: "Tarjeta amarilla por protestar en el banquillo",
    amount: 1
  },
  {
    code: "ROJA_J",
    description: "Tarjeta roja por protestar en el campo",
    amount: 1
  },
  {
    code: "ROJA_B",
    description: "Tarjeta roja por protestar en el banquillo",
    amount: 2
  },
  {
    code: "PETO",
    description: "No traer peto al entrenamiento",
    amount: 0.2
  },
  {
    code: "EQUIP",
    description: "No traer equipación al partido (por prenda)",
    amount: 2
  },
  {
    code: "MENOSPRE",
    description: "Menosprecio o insulto a rival / árbitro",
    amount: 3
  },
  {
    code: "INSULTO",
    description: "Insultos racistas, homófobos u ofensivos graves",
    amount: 5
  },
  {
    code: "COMPA",
    description: "Insulto o menosprecio grave a un compañero",
    amount: 3
  }
];

// =====================================================
// 5. REFERENCIAS DEL DOM
// =====================================================
const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app-section");

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");

const registerForm = document.getElementById("register-form");
const registerError = document.getElementById("register-error");

const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");

const showResetPasswordBtn = document.getElementById(
  "show-reset-password-btn"
);

const resetPasswordView = document.getElementById(
  "reset-password-view"
);

const resetPasswordForm = document.getElementById(
  "reset-password-form"
);

const resetPasswordMessage = document.getElementById(
  "reset-password-message"
);

const backToLoginBtn = document.getElementById(
  "back-to-login-btn"
);

const userInfo = document.getElementById("user-info");

const playersTableBody = document.getElementById("players-table-body");
const editPlayersBtn = document.getElementById(
  "edit-players-btn"
);

const playersActionsHeader = document.getElementById(
  "players-actions-header"
);

const finesTableBody = document.getElementById("fines-table-body");

const statsTableBody = document.getElementById("stats-table-body");
const topScorersList = document.getElementById(
  "top-scorers-list"
);

const topAssistsList = document.getElementById(
  "top-assists-list"
);

const attendanceContainer = document.getElementById("attendance-container");

const playersCount = document.getElementById("players-count");
const finesTotal = document.getElementById("fines-total");

const playerMessage = document.getElementById("player-message");

const openAddPlayerBtn = document.getElementById(
  "open-add-player-btn"
);

const playerEditor = document.getElementById(
  "player-editor"
);

const cancelAddPlayerBtn = document.getElementById(
  "cancel-add-player-btn"
);


const fineMessage = document.getElementById("fine-message");
const statMessage = document.getElementById("stat-message");
const trainingMessage = document.getElementById("training-message");

const fineCode = document.getElementById("fine-code");
const fineReason = document.getElementById("fine-reason");
const fineAmount = document.getElementById("fine-amount");
const fineCatalogBody = document.getElementById("fine-catalog-body");

const myFinesTableBody = document.getElementById("my-fines-table-body");
const myFinesTotal = document.getElementById("my-fines-total");

const homeWelcome = document.getElementById("home-welcome");
const homeRoleTitle = document.getElementById("home-role-title");
const homeRoleText = document.getElementById("home-role-text");

// CONVOCATORIA
const convocationStatus = document.getElementById("convocation-status");
const convocationLocation = document.getElementById("convocation-location");
const convocationDate = document.getElementById("convocation-date");
const convocationTime = document.getElementById("convocation-time");

const convocationImageContainer = document.getElementById(
  "convocation-image-container"
);

const calledPlayersCount = document.getElementById("called-players-count");
const calledPlayersList = document.getElementById("called-players-list");

const convocationForm = document.getElementById("convocation-form");
const convocationLocationInput = document.getElementById(
  "convocation-location-input"
);
const convocationDateInput = document.getElementById(
  "convocation-date-input"
);
const convocationTimeInput = document.getElementById(
  "convocation-time-input"
);
const convocationImageUrlInput = document.getElementById(
  "convocation-image-url-input"
);
const convocationPlayersSelector = document.getElementById(
  "convocation-players-selector"
);
const convocationMessage = document.getElementById("convocation-message");

const editConvocationBtn = document.getElementById(
  "edit-convocation-btn"
);

const newConvocationBtn = document.getElementById(
  "new-convocation-btn"
);

const convocationEditor = document.getElementById(
  "convocation-editor"
);

const convocationEditorTitle = document.getElementById(
  "convocation-editor-title"
);

const cancelConvocationEditBtn = document.getElementById(
  "cancel-convocation-edit-btn"
);

const saveConvocationBtn = document.getElementById(
  "save-convocation-btn"
);

// JUGADAS DESTACADAS
const highlightsDate = document.getElementById("highlights-date");
const highlightsLocation = document.getElementById("highlights-location");
const highlightsScorers = document.getElementById("highlights-scorers");

const highlightsVideoContainer = document.getElementById(
  "highlights-video-container"
);

const highlightsForm = document.getElementById("highlights-form");

const editHighlightsBtn = document.getElementById(
  "edit-highlights-btn"
);

const highlightsEditor = document.getElementById(
  "highlights-editor"
);

const highlightsEditorTitle = document.getElementById(
  "highlights-editor-title"
);

const cancelHighlightsEditBtn = document.getElementById(
  "cancel-highlights-edit-btn"
);

const saveHighlightsBtn = document.getElementById(
  "save-highlights-btn"
);

const highlightsDateInput = document.getElementById(
  "highlights-date-input"
);
const highlightsLocationInput = document.getElementById(
  "highlights-location-input"
);

//========================================================
//GOLEADORES 
//========================================================
const highlightsScorersSelector = document.getElementById(
  "highlights-scorers-selector"
);



const highlightsVideoUrlInput = document.getElementById(
  "highlights-video-url-input"
);
const highlightsMessage = document.getElementById("highlights-message");

const goToHighlightsBtn = document.getElementById("go-to-highlights-btn");
const backToConvocationBtn = document.getElementById(
  "back-to-convocation-btn"
);
const matchHistoryList = document.getElementById("match-history-list");
const matchHistoryCount = document.getElementById("match-history-count");
const selectedMatchLabel = document.getElementById("selected-match-label");

// =====================================================
// 6. UTILIDADES
// =====================================================
function showMessage(element, message, type = "success") {
  if (!element) return;

  element.textContent = message;
  element.classList.remove("success-message", "error-message");
  element.classList.add(type === "error" ? "error-message" : "success-message");

  window.setTimeout(() => {
    element.textContent = "";
    element.classList.remove("success-message", "error-message");
  }, 4000);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normaliseName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(Number(value || 0));
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const parts = String(dateString).split("-");

  if (parts.length !== 3) return dateString;

  const [year, month, day] = parts;

  return `${day}/${month}/${year}`;
}

function formatMatchDate(dateString) {
  if (!dateString) return "Pendiente de confirmar";
  return formatDate(dateString);
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getLastDayOfJune() {
  const now = new Date();
  const currentYear = now.getFullYear();

  const juneThisYear = new Date(currentYear, 5, 30);
  const targetYear = now > juneThisYear ? currentYear + 1 : currentYear;

  return `${targetYear}-06-30`;
}

function defaultStats() {
  return {
    goles: 0,
    asistencias: 0,
    golesSegundoPalo: 0,
    amarillasProtestar: 0,
    amarillasFalta: 0,
    rojas: 0,
    sextasFaltas: 0,
    penaltisCometidos: 0,
    penaltisProvocados: 0
  };
}

function stopListeners() {
  if (playersUnsubscribe) playersUnsubscribe();
  if (coachesUnsubscribe) coachesUnsubscribe();
  if (finesUnsubscribe) finesUnsubscribe();
  if (trainingsUnsubscribe) trainingsUnsubscribe();
  if (convocationUnsubscribe) convocationUnsubscribe();
  if (highlightsUnsubscribe) highlightsUnsubscribe();
  if (matchesUnsubscribe) matchesUnsubscribe();

  playersUnsubscribe = null;
  coachesUnsubscribe = null;
  finesUnsubscribe = null;
  trainingsUnsubscribe = null;
  convocationUnsubscribe = null;
  highlightsUnsubscribe = null;
  matchesUnsubscribe = null;
}

function setAdminInterface() {
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.classList.toggle("hidden", !isAdmin);
  });

  document.querySelectorAll(".admin-column").forEach((element) => {
    element.classList.toggle("hidden", !isAdmin);
  });
}

function updateHomePage(userName) {
  if (!homeWelcome || !homeRoleTitle || !homeRoleText) return;

  homeWelcome.textContent = `Hola, ${userName}.`;

  if (isAdmin) {
    homeRoleTitle.textContent = "Modo entrenador activo";
    homeRoleText.textContent =
      "Puedes consultar y gestionar jugadores, multas, convocatorias, estadísticas, entrenamientos y asistencias.";
  } else {
    homeRoleTitle.textContent = "Modo jugador activo";
    homeRoleText.textContent =
      "Puedes consultar la información del equipo. La edición está reservada a los entrenadores.";
  }
}

// =====================================================
// 7. AUTENTICACIÓN Y ROL
// =====================================================
auth.onAuthStateChanged(async (user) => {
  stopListeners();

  if (!user) {
    currentUser = null;
    currentUserRole = "jugador";
    currentUserName = "Usuario";
    isAdmin = false;
    players = [];
    coaches = [];
    finePeople = [];
    fines = [];

    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");

    if (loginView && registerView && resetPasswordView) {
  registerView.classList.add("hidden");
  resetPasswordView.classList.add("hidden");
  loginView.classList.remove("hidden");
  }

    return;
  }

  try {
    currentUser = user;

    const userDocRef = db.collection("usuarios").doc(user.uid);
    const userDoc = await userDocRef.get();

    let profileData = {};

    if (!userDoc.exists) {
      profileData = {
        nombre: user.displayName || "",
        email: user.email || "",
        rol: "jugador"
      };

      await userDocRef.set({
        ...profileData,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
      });

      currentUserRole = "jugador";
    } else {
      profileData = userDoc.data();
      currentUserRole = profileData.rol || "jugador";
    }

    isAdmin = currentUserRole === "entrenador";

    currentUserName =
    profileData.nombre ||
    user.displayName ||
    user.email ||
    "Usuario";

    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    userInfo.textContent = `${currentUserName} · ${
      isAdmin ? "Entrenador" : "Jugador"
    }`;

    setAdminInterface();
    updateHomePage(currentUserName);
    setTrainingDateLimits();

    renderFineCatalog();
    renderFineCodeSelect();

    loadPlayers();
    loadCoaches();
    loadFines();
    loadTrainings();
    loadConvocation();
    loadHighlights();
    loadMatchesHistory();

    showSection("inicio");
  } catch (error) {
    console.error(error);

    appSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    loginError.textContent =
      "No se pudo comprobar el perfil del usuario. Revisa las reglas de Firestore.";

    await auth.signOut();
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginError.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginForm.reset();
  } catch (error) {
    console.error(error);

    const messages = {
      "auth/invalid-email": "El correo electrónico no tiene un formato válido.",
      "auth/user-not-found": "No existe ningún usuario con ese correo.",
      "auth/wrong-password": "La contraseña no es correcta.",
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/too-many-requests":
        "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."
    };

    loginError.textContent =
      messages[error.code] || "No se ha podido iniciar sesión.";
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await auth.signOut();
});

// =====================================================
// 8. REGISTRO
// =====================================================
if (showRegisterBtn) {
  showRegisterBtn.addEventListener("click", () => {
    loginView.classList.add("hidden");
    resetPasswordView.classList.add("hidden");
    registerView.classList.remove("hidden");

    loginError.textContent = "";
    registerError.textContent = "";
    resetPasswordMessage.textContent = "";
  });
}

if (showLoginBtn) {
  showLoginBtn.addEventListener("click", () => {
    registerView.classList.add("hidden");
    resetPasswordView.classList.add("hidden");
    loginView.classList.remove("hidden");

    loginError.textContent = "";
    registerError.textContent = "";
    resetPasswordMessage.textContent = "";
  });
}

if (showResetPasswordBtn) {
  showResetPasswordBtn.addEventListener("click", () => {
    loginView.classList.add("hidden");
    registerView.classList.add("hidden");
    resetPasswordView.classList.remove("hidden");

    loginError.textContent = "";
    registerError.textContent = "";
    resetPasswordMessage.textContent = "";

    /*
      Copia automáticamente el correo del login si el usuario
      ya lo había escrito antes de pulsar “He olvidado mi contraseña”.
    */
    const loginEmail = document.getElementById("email").value.trim();

    if (loginEmail) {
      document.getElementById("reset-email").value = loginEmail;
    }
  });
}

if (backToLoginBtn) {
  backToLoginBtn.addEventListener("click", () => {
    resetPasswordView.classList.add("hidden");
    registerView.classList.add("hidden");
    loginView.classList.remove("hidden");

    resetPasswordMessage.textContent = "";
  });
}


// =====================================================
// RECUPERACIÓN DE CONTRASEÑA
// =====================================================
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("reset-email").value.trim();

    resetPasswordMessage.textContent = "";
    resetPasswordMessage.classList.remove(
      "success-message",
      "error-message"
    );

    if (!email) {
      resetPasswordMessage.textContent =
        "Escribe el correo electrónico con el que te registraste.";

      resetPasswordMessage.classList.add("error-message");
      return;
    }

    try {
      /*
        Firebase envía automáticamente un correo con un enlace
        seguro para que el usuario cree una contraseña nueva.
      */
      await auth.sendPasswordResetEmail(email);

      resetPasswordMessage.textContent =
        "Correo enviado. Revisa tu bandeja de entrada y la carpeta de spam.";

      resetPasswordMessage.classList.add("success-message");

      resetPasswordForm.reset();
    } catch (error) {
      console.error(error);

      const messages = {
        "auth/invalid-email":
          "El correo electrónico no tiene un formato válido.",

        "auth/user-not-found":
          "No existe ninguna cuenta con ese correo.",

        "auth/too-many-requests":
          "Se han realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo."
      };

      resetPasswordMessage.textContent =
        messages[error.code] ||
        "No se ha podido enviar el correo de recuperación.";

      resetPasswordMessage.classList.add("error-message");
    }
  });
}


if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const passwordConfirm = document.getElementById(
      "register-password-confirm"
    ).value;

    registerError.textContent = "";

    if (!name) {
      registerError.textContent = "Escribe tu nombre.";
      return;
    }

    if (password !== passwordConfirm) {
      registerError.textContent = "Las contraseñas no coinciden.";
      return;
    }

    if (password.length < 6) {
      registerError.textContent =
        "La contraseña debe tener al menos 6 caracteres.";
      return;
    }

    const coachNames = ["bony", "santi"];
    const normalisedName = normaliseName(name);

    const role = coachNames.includes(normalisedName)
      ? "entrenador"
      : "jugador";

    try {
      const credential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      await credential.user.updateProfile({
        displayName: name
      });

      await db.collection("usuarios").doc(credential.user.uid).set({
        nombre: name,
        email,
        rol: role,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
      });

      registerForm.reset();
    } catch (error) {
      console.error(error);

      const messages = {
        "auth/email-already-in-use":
          "Ya existe una cuenta registrada con este correo.",
        "auth/invalid-email":
          "El correo electrónico no es válido.",
        "auth/weak-password":
          "La contraseña debe tener al menos 6 caracteres."
      };

      registerError.textContent =
        messages[error.code] || "No se ha podido crear la cuenta.";
    }
  });
}

// =====================================================
// 9. NAVEGACIÓN
// =====================================================
document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.goTo);
  });
});

function showSection(sectionId) {
  document.querySelectorAll(".section-panel").forEach((section) => {
    section.classList.add("hidden");
  });

  const selectedSection = document.getElementById(sectionId);

  if (!selectedSection) {
    console.error(`No existe la sección con id="${sectionId}".`);
    return;
  }

  selectedSection.classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

// =====================================================
// 10. PLANTILLA
// =====================================================

function openPlayerEditor() {
  if (!isAdmin || !playerEditor) return;

  playerEditor.classList.remove("hidden");

  if (openAddPlayerBtn) {
    openAddPlayerBtn.classList.add("hidden");
  }
}

function closePlayerEditor() {
  if (playerEditor) {
    playerEditor.classList.add("hidden");
  }

  if (openAddPlayerBtn && isAdmin) {
    openAddPlayerBtn.classList.remove("hidden");
  }
}

if (openAddPlayerBtn) {
  openAddPlayerBtn.addEventListener("click", () => {
    openPlayerEditor();
  });
}

if (cancelAddPlayerBtn) {
  cancelAddPlayerBtn.addEventListener("click", () => {
    const form = document.getElementById("add-player-form");

    if (form) {
      form.reset();
    }

    closePlayerEditor();
  });
}

document
  .getElementById("add-player-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    const name = document.getElementById("player-name").value.trim();
    const position = document.getElementById("player-position").value;
    const number = Number(document.getElementById("player-number").value);
    const leg = document.getElementById("player-leg").value;

    try {
      const existingDorsal = players.some(
        (player) => Number(player.dorsal) === number
      );

      if (existingDorsal) {
        showMessage(
          playerMessage,
          "Ya existe un jugador con ese dorsal.",
          "error"
        );
        return;
      }

      await db.collection("jugadores").add({
        nombre: name,
        posicion: position,
        dorsal: number,
        piernaDominante: leg,
        estadisticas: defaultStats(),
        creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
        creadoPor: currentUser.uid
      });

      event.target.reset();

      closePlayerEditor();

      showMessage(
        playerMessage,
        "Jugador añadido correctamente."
        );
    } catch (error) {
      console.error(error);
      showMessage(
        playerMessage,
        "No se ha podido añadir el jugador.",
        "error"
      );
    }
  });

function loadPlayers() {
  playersUnsubscribe = db
    .collection("jugadores")
    .orderBy("dorsal", "asc")
    .onSnapshot(
      (snapshot) => {
        players = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        buildFinePeople();
        renderPlayers();
        renderPlayerSelects();
        renderStats();
        renderMyFines(fines);
        renderConvocationPlayersSelector();
        renderHighlightsScorersSelector(
        currentHighlights?.goleadores || []
        );
      },
      (error) => {
        console.error(error);

        playersTableBody.innerHTML = `
          <tr>
            <td colspan="5">
              No se pueden cargar los jugadores. Revisa las reglas de Firestore.
            </td>
          </tr>
        `;
      }
    );
}

function getPositionOrder(position) {
  const positionOrder = {
    Portero: 1,
    Cierre: 2,
    Ala: 3,
    "Pívot": 4
  };

  return positionOrder[position] || 99;
}

function getSortedPlayersByPosition() {
  return [...players].sort((first, second) => {
    const positionDifference =
      getPositionOrder(first.posicion) -
      getPositionOrder(second.posicion);

    if (positionDifference !== 0) {
      return positionDifference;
    }

    const dorsalDifference =
      Number(first.dorsal || 0) - Number(second.dorsal || 0);

    if (dorsalDifference !== 0) {
      return dorsalDifference;
    }

    return String(first.nombre || "").localeCompare(
      String(second.nombre || ""),
      "es"
    );
  });
}

function renderPlayers() {
  playersCount.textContent = `${players.length} ${
    players.length === 1 ? "jugador" : "jugadores"
  }`;

  const showActions = isAdmin && isEditingPlayers;

  if (playersActionsHeader) {
    playersActionsHeader.classList.toggle(
      "hidden",
      !showActions
    );
  }

  if (!players.length) {
    playersTableBody.innerHTML = `
      <tr>
        <td colspan="${showActions ? 5 : 4}" class="empty-state">
          Todavía no hay jugadores registrados.
        </td>
      </tr>
    `;
    return;
  }

  const sortedPlayers = getSortedPlayersByPosition();

  playersTableBody.innerHTML = sortedPlayers
    .map(
      (player) => `
        <tr>
          <td>${escapeHTML(player.nombre)}</td>
          <td>${escapeHTML(player.posicion)}</td>
          <td>${escapeHTML(player.dorsal)}</td>
          <td>${escapeHTML(player.piernaDominante)}</td>

          ${
            showActions
              ? `
                <td class="action-cell">
                  <button
                    class="small-btn btn-danger"
                    data-action="delete-player"
                    data-id="${player.id}"
                    data-name="${escapeHTML(player.nombre)}"
                  >
                    Eliminar
                  </button>
                </td>
              `
              : ""
          }
        </tr>
      `
    )
    .join("");
}

if (editPlayersBtn) {
  editPlayersBtn.addEventListener("click", () => {
    if (!isAdmin) return;

    isEditingPlayers = !isEditingPlayers;

    editPlayersBtn.textContent = isEditingPlayers
      ? "Terminar edición"
      : "Editar plantilla";

    editPlayersBtn.classList.toggle(
      "btn-primary",
      !isEditingPlayers
    );

    editPlayersBtn.classList.toggle(
      "btn-success",
      isEditingPlayers
    );

    renderPlayers();
  });
}


playersTableBody.addEventListener("click", async (event) => {
  const button = event.target.closest('[data-action="delete-player"]');

  if (!button || !isAdmin) return;

  const confirmed = window.confirm(
    `¿Seguro que quieres eliminar a ${button.dataset.name}?`
  );

  if (!confirmed) return;

  try {
    await db.collection("jugadores").doc(button.dataset.id).delete();
  } catch (error) {
    console.error(error);
    alert("No se ha podido eliminar al jugador.");
  }
});

function loadCoaches() {
  coachesUnsubscribe = db
    .collection("usuarios")
    .where("rol", "==", "entrenador")
    .onSnapshot(
      (snapshot) => {
        coaches = snapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre || doc.data().email || "Entrenador",
          email: doc.data().email || "",
          rol: "entrenador",
          tipo: "entrenador"
        }));

        buildFinePeople();
        renderPlayerSelects();
        renderMyFines(fines);
      },
      (error) => {
        console.error("No se han podido cargar los entrenadores:", error);

        coaches = [];
        buildFinePeople();
        renderPlayerSelects();
      }
    );
}

function buildFinePeople() {
  const playerPeople = players.map((player) => ({
    id: player.id,
    nombre: player.nombre,
    dorsal: player.dorsal,
    tipo: "jugador",
    rol: "jugador"
  }));

  const coachPeople = coaches.map((coach) => ({
    id: coach.id,
    nombre: coach.nombre,
    email: coach.email,
    tipo: "entrenador",
    rol: "entrenador"
  }));

  finePeople = [...playerPeople, ...coachPeople];
}

function renderPlayerSelects() {
  const finePlayerSelect = document.getElementById("fine-player");
  const statPlayerSelect = document.getElementById("stat-player");

  if (finePlayerSelect) {
    const selectedValue = finePlayerSelect.value;

    finePlayerSelect.innerHTML = `
      <option value="">Selecciona una persona</option>

      ${finePeople
        .map(
          (person) => `
            <option value="${person.id}">
              ${escapeHTML(person.nombre)} · ${
                person.tipo === "jugador"
                  ? `Jugador · #${escapeHTML(person.dorsal)}`
                  : "Entrenador"
              }
            </option>
          `
        )
        .join("")}
    `;

    if (finePeople.some((person) => person.id === selectedValue)) {
      finePlayerSelect.value = selectedValue;
    }
  }

  if (statPlayerSelect) {
    const selectedValue = statPlayerSelect.value;

    statPlayerSelect.innerHTML = `
      <option value="">Selecciona un jugador</option>

      ${players
        .map(
          (player) => `
            <option value="${player.id}">
              ${escapeHTML(player.nombre)} · #${escapeHTML(player.dorsal)}
            </option>
          `
        )
        .join("")}
    `;

    if (players.some((player) => player.id === selectedValue)) {
      statPlayerSelect.value = selectedValue;
    }
  }
}

// =====================================================
// 11. MULTAS
// =====================================================
function renderFineCatalog() {
  if (!fineCatalogBody) return;

  fineCatalogBody.innerHTML = FINE_CATALOG.map(
    (fine) => `
      <tr>
        <td><strong>${escapeHTML(fine.code)}</strong></td>
        <td>${escapeHTML(fine.description)}</td>
        <td>${formatCurrency(fine.amount)}</td>
      </tr>
    `
  ).join("");
}

function renderFineCodeSelect() {
  if (!fineCode) return;

  fineCode.innerHTML = `
    <option value="">Selecciona un código</option>

    ${FINE_CATALOG.map(
      (fine) => `
        <option value="${fine.code}">
          ${fine.code} · ${fine.description}
        </option>
      `
    ).join("")}
  `;
}

function fillFineDataFromCode() {
  if (!fineCode || !fineReason || !fineAmount) return;

  const selectedFine = FINE_CATALOG.find(
    (fine) => fine.code === fineCode.value
  );

  if (!selectedFine) {
    fineReason.value = "";
    fineAmount.value = "";
    return;
  }

  fineReason.value = selectedFine.description;
  fineAmount.value = selectedFine.amount.toFixed(2);
}

function getCurrentFinePerson() {
  const registeredName = normaliseName(currentUserName);

  const playerMatch = players.find(
    (player) => normaliseName(player.nombre) === registeredName
  );

  if (playerMatch) {
    return {
      id: playerMatch.id,
      nombre: playerMatch.nombre,
      tipo: "jugador"
    };
  }

  const coachMatch = coaches.find(
    (coach) => normaliseName(coach.nombre) === registeredName
  );

  if (coachMatch) {
    return {
      id: coachMatch.id,
      nombre: coachMatch.nombre,
      tipo: "entrenador"
    };
  }

  return null;
}

function renderMyFines(finesList) {
  if (!myFinesTableBody || !myFinesTotal) return;

  const linkedPerson = getCurrentFinePerson();

  if (!linkedPerson) {
    myFinesTotal.textContent = "Debes: 0,00 €";

    myFinesTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Tu cuenta no está asociada a un jugador o entrenador.
          El nombre de registro debe coincidir con el perfil correspondiente.
        </td>
      </tr>
    `;

    return;
  }

  const myFines = finesList.filter(
    (fine) =>
      fine.personaId === linkedPerson.id ||
      fine.jugadorId === linkedPerson.id
  );

  const myTotal = myFines.reduce(
    (sum, fine) => sum + Number(fine.importe || 0),
    0
  );

  myFinesTotal.textContent = `Debes: ${formatCurrency(myTotal)}`;

  if (!myFines.length) {
    myFinesTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          No tienes multas registradas.
        </td>
      </tr>
    `;

    return;
  }

  myFinesTableBody.innerHTML = myFines
    .map(
      (fine) => `
        <tr>
          <td>${formatDate(fine.fecha)}</td>
          <td><strong>${escapeHTML(fine.codigo || "-")}</strong></td>
          <td>${escapeHTML(fine.motivo)}</td>
          <td>${formatCurrency(fine.importe)}</td>
        </tr>
      `
    )
    .join("");
}

const fineDateInput = document.getElementById("fine-date");

if (fineDateInput) {
  fineDateInput.value = getTodayDate();
}

if (fineCode) {
  fineCode.addEventListener("change", fillFineDataFromCode);
}

document
  .getElementById("add-fine-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    const personId = document.getElementById("fine-player").value;
    const code = fineCode.value;
    const date = fineDateInput.value;

    const person = finePeople.find((item) => item.id === personId);

    const selectedFine = FINE_CATALOG.find(
      (fine) => fine.code === code
    );

    if (!person) {
      showMessage(
        fineMessage,
        "Selecciona un jugador o entrenador válido.",
        "error"
      );
      return;
    }

    if (!selectedFine) {
      showMessage(
        fineMessage,
        "Selecciona un código de multa válido.",
        "error"
      );
      return;
    }

    if (!date) {
      showMessage(fineMessage, "Selecciona una fecha.", "error");
      return;
    }

    try {
      await db.collection("multas").add({
        personaId: person.id,
        personaNombre: person.nombre,
        personaTipo: person.tipo,

        jugadorId: person.tipo === "jugador" ? person.id : null,
        jugadorNombre: person.tipo === "jugador" ? person.nombre : null,

        codigo: selectedFine.code,
        motivo: selectedFine.description,
        importe: selectedFine.amount,
        fecha: date,
        creadoPor: currentUser.uid,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
      });

      event.target.reset();
      fineDateInput.value = getTodayDate();

      fillFineDataFromCode();

      showMessage(
        fineMessage,
        `Multa ${selectedFine.code} añadida a ${person.nombre}.`
      );
    } catch (error) {
      console.error(error);

      showMessage(
        fineMessage,
        "No se ha podido añadir la multa.",
        "error"
      );
    }
  });

function loadFines() {
  finesUnsubscribe = db
    .collection("multas")
    .orderBy("fecha", "desc")
    .onSnapshot(
      (snapshot) => {
        fines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        renderFines(fines);
        renderMyFines(fines);
      },
      (error) => {
        console.error(error);

        finesTableBody.innerHTML = `
          <tr>
            <td colspan="${isAdmin ? 6 : 5}">
              No se pueden cargar las multas.
            </td>
          </tr>
        `;
      }
    );
}

function renderFines(finesList) {
  const total = finesList.reduce(
    (sum, fine) => sum + Number(fine.importe || 0),
    0
  );

  finesTotal.textContent = `Total general: ${formatCurrency(total)}`;

  if (!finesList.length) {
    finesTableBody.innerHTML = `
      <tr>
        <td colspan="${isAdmin ? 6 : 5}" class="empty-state">
          No hay multas registradas.
        </td>
      </tr>
    `;
    return;
  }

  finesTableBody.innerHTML = finesList
    .map(
      (fine) => `
        <tr>
          <td>${formatDate(fine.fecha)}</td>

          <td>
            ${escapeHTML(
              fine.personaNombre ||
                fine.jugadorNombre ||
                "Sin asignar"
            )}

            ${
              fine.personaTipo === "entrenador"
                ? '<span class="role-label">Entrenador</span>'
                : ""
            }
          </td>

          <td>
            <strong>${escapeHTML(fine.codigo || "-")}</strong>
          </td>

          <td>${escapeHTML(fine.motivo)}</td>
          <td>${formatCurrency(fine.importe)}</td>

          ${
            isAdmin
              ? `
              <td class="action-cell">
                <button
                  class="small-btn btn-danger"
                  data-action="delete-fine"
                  data-id="${fine.id}"
                >
                  Eliminar
                </button>
              </td>
            `
              : ""
          }
        </tr>
      `
    )
    .join("");
}

finesTableBody.addEventListener("click", async (event) => {
  const button = event.target.closest('[data-action="delete-fine"]');

  if (!button || !isAdmin) return;

  const confirmed = window.confirm("¿Quieres eliminar esta multa?");

  if (!confirmed) return;

  try {
    await db.collection("multas").doc(button.dataset.id).delete();
  } catch (error) {
    console.error(error);
    alert("No se ha podido eliminar la multa.");
  }
});

// =====================================================
// 12. CONVOCATORIA E HISTORIAL DE PARTIDOS
// =====================================================
function getDriveFileId(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    const fileMatch = parsedUrl.pathname.match(
      /\/file\/d\/([^/]+)/
    );

    if (fileMatch && fileMatch[1]) {
      return fileMatch[1];
    }

    return parsedUrl.searchParams.get("id");
  } catch {
    return null;
  }
}

function getDriveImageUrl(url) {
  const fileId = getDriveFileId(url);

  if (!fileId) {
    return url;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
}

function getDrivePreviewUrl(url) {
  const fileId = getDriveFileId(url);

  if (!fileId) return null;

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function renderConvocationPlayersSelector() {
  if (!convocationPlayersSelector) return;

  const selectedIds =
    currentConvocation?.convocados?.map((player) => player.id) || [];

  if (!players.length) {
    convocationPlayersSelector.innerHTML = `
      <p class="empty-state">
        Primero añade jugadores en la sección Plantilla.
      </p>
    `;
    return;
  }

  convocationPlayersSelector.innerHTML = players
    .map(
      (player) => `
        <label class="player-checkbox">
          <input
            type="checkbox"
            name="convocated-player"
            value="${player.id}"
            ${selectedIds.includes(player.id) ? "checked" : ""}
          />

          <span>
            ${escapeHTML(player.nombre)} · #${escapeHTML(player.dorsal)}
          </span>
        </label>
      `
    )
    .join("");
}

function clearConvocationForm() {
  if (convocationLocationInput) {
    convocationLocationInput.value = "";
  }

  if (convocationDateInput) {
    convocationDateInput.value = "";
  }

  if (convocationTimeInput) {
    convocationTimeInput.value = "";
  }

  if (convocationImageUrlInput) {
    convocationImageUrlInput.value = "";
  }
}

function openConvocationEditor({ isNew = false } = {}) {
  if (!isAdmin || !convocationEditor) return;

  creatingNewConvocation = isNew;

  if (isNew) {
    clearConvocationForm();
  }

  convocationEditor.classList.remove("hidden");

  if (editConvocationBtn) {
    editConvocationBtn.classList.add("hidden");
  }

  if (newConvocationBtn) {
    newConvocationBtn.classList.add("hidden");
  }

  if (convocationEditorTitle) {
    convocationEditorTitle.textContent = isNew
      ? "Nueva convocatoria"
      : "Editar convocatoria";
  }

  if (saveConvocationBtn) {
    saveConvocationBtn.textContent = isNew
      ? "Publicar convocatoria"
      : "Guardar cambios";
  }

  renderConvocationPlayersSelector();
}

function closeConvocationEditor() {
  if (convocationEditor) {
    convocationEditor.classList.add("hidden");
  }

  if (!isAdmin) return;

  if (currentConvocation && editConvocationBtn) {
    editConvocationBtn.classList.remove("hidden");
  }

  if (newConvocationBtn) {
    newConvocationBtn.classList.remove("hidden");
  }
}

if (editConvocationBtn) {
  editConvocationBtn.addEventListener("click", () => {
    openConvocationEditor({ isNew: false });
  });
}

if (newConvocationBtn) {
  newConvocationBtn.addEventListener("click", () => {
    openConvocationEditor({ isNew: true });
  });
}

if (cancelConvocationEditBtn) {
  cancelConvocationEditBtn.addEventListener("click", () => {
    creatingNewConvocation = false;
    closeConvocationEditor();
  });
}

function renderConvocation(convocation) {
  currentConvocation = convocation;

  if (!convocation) {
    convocationStatus.textContent = "Sin convocatoria publicada";

    convocationLocation.textContent = "Pendiente de confirmar";
    convocationDate.textContent = "Pendiente de confirmar";
    convocationTime.textContent = "Pendiente de confirmar";

    convocationImageContainer.innerHTML = `
      <p class="empty-state">
        Todavía no se ha publicado una imagen de convocatoria.
      </p>
    `;

    calledPlayersCount.textContent = "0 convocados";

    calledPlayersList.innerHTML = `
      <p class="empty-state">
        Todavía no hay jugadores convocados.
      </p>
    `;

    if (isAdmin) {
      creatingNewConvocation = false;

      if (editConvocationBtn) {
        editConvocationBtn.classList.add("hidden");
      }

      if (newConvocationBtn) {
        newConvocationBtn.classList.add("hidden");
      }

      if (convocationEditorTitle) {
        convocationEditorTitle.textContent =
          "Publicar convocatoria";
      }

      if (saveConvocationBtn) {
        saveConvocationBtn.textContent =
          "Publicar convocatoria";
      }

      if (convocationLocationInput) {
        convocationLocationInput.value = "";
      }

      if (convocationDateInput) {
        convocationDateInput.value = "";
      }

      if (convocationTimeInput) {
        convocationTimeInput.value = "";
      }

      if (convocationImageUrlInput) {
        convocationImageUrlInput.value = "";
      }

      renderConvocationPlayersSelector();
      openConvocationEditor({ isNew: true });
    }

    renderConvocationPlayersSelector();
    return;
  }

  convocationStatus.textContent = "Convocatoria publicada";

  convocationLocation.textContent =
    convocation.ubicacion || "Pendiente de confirmar";

  convocationDate.textContent =
    formatMatchDate(convocation.fecha);

  convocationTime.textContent =
    convocation.hora || "Pendiente de confirmar";

  const imageUrl = convocation.imageUrl
    ? getDriveImageUrl(convocation.imageUrl)
    : null;

  if (imageUrl) {
    convocationImageContainer.innerHTML = `
      <img
        src="${escapeHTML(imageUrl)}"
        alt="Imagen de convocatoria del partido"
        class="convocation-image"
        referrerpolicy="no-referrer"
        onerror="
          this.style.display='none';
          this.parentElement.insertAdjacentHTML(
            'beforeend',
            '<p class=&quot;empty-state&quot;>No se ha podido mostrar la imagen. Comprueba que el archivo de Google Drive esté compartido como “Cualquier persona con el enlace → Lector”.</p>'
          );
        "
      />
    `;
  } else {
    convocationImageContainer.innerHTML = `
      <p class="empty-state">
        La convocatoria se ha publicado sin imagen.
      </p>
    `;
  }

  const calledPlayers = Array.isArray(convocation.convocados)
    ? convocation.convocados
    : [];

  calledPlayersCount.textContent = `${calledPlayers.length} ${
    calledPlayers.length === 1
      ? "convocado"
      : "convocados"
  }`;

  if (!calledPlayers.length) {
    calledPlayersList.innerHTML = `
      <p class="empty-state">
        No hay jugadores convocados en esta convocatoria.
      </p>
    `;
  } else {
    calledPlayersList.innerHTML = calledPlayers
      .map(
        (player) => `
          <article class="called-player-card">
            <span class="called-player-number">
              #${escapeHTML(player.dorsal ?? "")}
            </span>

            <strong>
              ${escapeHTML(player.nombre || "Jugador")}
            </strong>

            <span>
              ${escapeHTML(player.posicion || "")}
            </span>
          </article>
        `
      )
      .join("");
  }

  if (isAdmin) {
    /*
      Cuando llega una convocatoria ya publicada desde Firestore,
      dejamos el formulario preparado para editarla, pero oculto.
    */
    creatingNewConvocation = false;

    if (convocationLocationInput) {
      convocationLocationInput.value =
        convocation.ubicacion || "";
    }

    if (convocationDateInput) {
      convocationDateInput.value =
        convocation.fecha || "";
    }

    if (convocationTimeInput) {
      convocationTimeInput.value =
        convocation.hora || "";
    }

    if (convocationImageUrlInput) {
      convocationImageUrlInput.value =
        convocation.imageUrl || "";
    }

    if (convocationEditorTitle) {
      convocationEditorTitle.textContent =
        "Editar convocatoria";
    }

    if (saveConvocationBtn) {
      saveConvocationBtn.textContent = "Guardar cambios";
    }

    renderConvocationPlayersSelector();
    closeConvocationEditor();
  } else {
    renderConvocationPlayersSelector();
  }
}

function loadConvocation() {
  if (!convocationStatus) {
    console.error("Falta #convocation-status en el HTML.");
    return;
  }

  convocationUnsubscribe = db
    .collection("convocatorias")
    .doc("actual")
    .onSnapshot(
      (doc) => {
        if (!doc.exists) {
          renderConvocation(null);
          return;
        }

        renderConvocation(doc.data());
      },
      (error) => {
        console.error(
          "Error leyendo convocatorias/actual:",
          error
        );

        convocationStatus.textContent =
          "Error al cargar convocatoria";

        convocationLocation.textContent = "No disponible";
        convocationDate.textContent = "No disponible";
        convocationTime.textContent = "No disponible";

        convocationImageContainer.innerHTML = `
          <p class="empty-state">
            No se ha podido cargar la convocatoria.
          </p>
        `;

        calledPlayersList.innerHTML = `
          <p class="empty-state">
            No se han podido cargar los convocados.
          </p>
        `;
      }
    );
}

if (convocationForm) {
  convocationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    const wasEditing =
      Boolean(currentConvocation) && !creatingNewConvocation;

    const ubicacion = convocationLocationInput.value.trim();
    const fecha = convocationDateInput.value;
    const hora = convocationTimeInput.value;
    const imageUrl = convocationImageUrlInput.value.trim();

    const selectedIds = [
      ...document.querySelectorAll(
        'input[name="convocated-player"]:checked'
      )
    ].map((input) => input.value);

    const convocados = players
      .filter((player) => selectedIds.includes(player.id))
      .map((player) => ({
        id: player.id,
        nombre: player.nombre,
        dorsal: player.dorsal,
        posicion: player.posicion
      }));

    if (!ubicacion || !fecha || !hora) {
      showMessage(
        convocationMessage,
        "Completa ubicación, fecha y hora.",
        "error"
      );
      return;
    }

    if (!convocados.length) {
      showMessage(
        convocationMessage,
        "Selecciona al menos un jugador convocado.",
        "error"
      );
      return;
    }

    if (imageUrl && !getDriveFileId(imageUrl)) {
      showMessage(
        convocationMessage,
        "Pega un enlace válido de Google Drive.",
        "error"
      );
      return;
    }

    try {
      /*
        Si se ha pulsado "Nueva convocatoria", no usamos el ID
        de la convocatoria actual: crearemos un documento nuevo
        en la colección "partidos".
      */
      const currentMatchId = creatingNewConvocation
        ? null
        : currentConvocation?.partidoId || null;

      /*
        Solo buscamos un partido existente si estamos editando
        la convocatoria actual.
      */
      const existingMatch = currentMatchId
        ? matches.find((match) => match.id === currentMatchId)
        : null;

      const matchData = {
        ubicacion,
        fecha,
        hora,
        convocados,
        imageUrl: imageUrl || null,
        actualizadoPor: currentUser.uid,
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
      };

      let matchId;

      if (existingMatch) {
        /*
          Edición: actualiza el documento del partido actual
          sin borrar posibles jugadas destacadas ya registradas.
        */
        matchId = existingMatch.id;

        await db.collection("partidos").doc(matchId).set(
          matchData,
          { merge: true }
        );
      } else {
        /*
          Primera convocatoria o nueva convocatoria:
          crea un documento independiente para el historial.
        */
        const createdMatch = await db.collection("partidos").add({
          ...matchData,
          estado: "convocatoria",
          creadoPor: currentUser.uid,
          creadoEn: firebase.firestore.FieldValue.serverTimestamp()
        });

        matchId = createdMatch.id;
      }

      /*
        Actualiza el documento que representa la convocatoria
        que se muestra como "actual" en la app.
      */
      await db.collection("convocatorias").doc("actual").set(
        {
          ...matchData,
          partidoId: matchId
        },
        { merge: true }
      );

      selectedMatchId = matchId;

      /*
        Ya se ha guardado: salimos del modo de creación para
        que vuelvan a aparecer "Editar" y "Nueva convocatoria".
      */
      creatingNewConvocation = false;

      closeConvocationEditor();

      showMessage(
        convocationMessage,
        wasEditing
          ? "Convocatoria actualizada correctamente."
          : "Convocatoria publicada correctamente."
      );
    } catch (error) {
      console.error(error);

      showMessage(
        convocationMessage,
        "No se ha podido guardar la convocatoria.",
        "error"
      );
    }
  });
}

// =====================================================
// HISTORIAL DE CONVOCATORIAS Y PARTIDOS
// =====================================================
function getMatchStatus(match) {
  const scorers = normaliseScorers(match.goleadores);

  return match.videoUrl || scorers.length > 0 || match.estado === "finalizado"
    ? "Finalizado"
    : "Convocatoria";
}

function renderMatchesHistory() {
  if (!matchHistoryList || !matchHistoryCount) return;

  matchHistoryCount.textContent = `${matches.length} ${
    matches.length === 1 ? "partido" : "partidos"
  }`;

  if (!matches.length) {
    matchHistoryList.innerHTML = `
      <p class="empty-state">
        Todavía no hay convocatorias o partidos anteriores.
      </p>
    `;
    return;
  }

  matchHistoryList.innerHTML = matches
    .map((match) => {
      const status = getMatchStatus(match);

      const statusClass =
        status === "Finalizado" ? "finished" : "";

      return `
        <button
          type="button"
          class="match-history-card"
          data-action="open-match"
          data-match-id="${match.id}"
        >
          <div>
            <p class="eyebrow">Partido</p>
            <h4>${formatMatchDate(match.fecha)}</h4>
          </div>

          <p>
            ${escapeHTML(
              match.ubicacion || "Ubicación pendiente"
            )}
          </p>

          <p>
            ${
              match.hora
                ? `Hora: ${escapeHTML(match.hora)}`
                : "Hora pendiente"
            }
          </p>

          <div class="match-history-card-footer">
            <span>${(match.convocados || []).length} convocados</span>

            <span class="match-history-status ${statusClass}">
              ${status}
            </span>
          </div>
        </button>
      `;
    })
    .join("");
}

function loadMatchesHistory() {
  matchesUnsubscribe = db
    .collection("partidos")
    .orderBy("fecha", "desc")
    .onSnapshot(
      (snapshot) => {
        matches = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        renderMatchesHistory();
      },
      (error) => {
        console.error(
          "Error al cargar historial de partidos:",
          error
        );

        if (matchHistoryList) {
          matchHistoryList.innerHTML = `
            <p class="empty-state">
              No se ha podido cargar el historial de partidos.
            </p>
          `;
        }
      }
    );
}

function renderSelectedMatch(match) {
  if (!match) return;

  selectedMatchId = match.id;

  if (selectedMatchLabel) {
    selectedMatchLabel.textContent =
      `Partido seleccionado: ${formatMatchDate(match.fecha)} · ${
        match.ubicacion || "Ubicación pendiente"
      }`;
  }

  if (highlightsDate) {
    highlightsDate.textContent = formatMatchDate(match.fecha);
  }

  if (highlightsLocation) {
    highlightsLocation.textContent =
      match.ubicacion || "Pendiente de confirmar";
  }

  if (highlightsScorers) {
    highlightsScorers.innerHTML = formatScorersHTML(
      match.goleadores
    );
  }

  const previewUrl = getDrivePreviewUrl(match.videoUrl);

  if (highlightsVideoContainer) {
    if (previewUrl) {
      highlightsVideoContainer.innerHTML = `
        <iframe
          class="highlights-video"
          src="${escapeHTML(previewUrl)}"
          title="Jugadas destacadas del partido"
          allow="autoplay"
          allowfullscreen
        ></iframe>
      `;
    } else {
      highlightsVideoContainer.innerHTML = `
        <p class="empty-state">
          Todavía no se ha publicado un vídeo de jugadas destacadas para este partido.
        </p>
      `;
    }
  }

  if (isAdmin) {
    if (highlightsDateInput) {
      highlightsDateInput.value = match.fecha || "";
    }

    if (highlightsLocationInput) {
      highlightsLocationInput.value =
        match.ubicacion || "";
    }

    if (highlightsVideoUrlInput) {
      highlightsVideoUrlInput.value =
        match.videoUrl || "";
    }

    renderHighlightsScorersSelector(match.goleadores || []);
  }
}

if (matchHistoryList) {
  matchHistoryList.addEventListener("click", (event) => {
    const button = event.target.closest(
      '[data-action="open-match"]'
    );

    if (!button) return;

    const match = matches.find(
      (item) => item.id === button.dataset.matchId
    );

    if (!match) return;

    renderSelectedMatch(match);
    showSection("jugadas-destacadas");
  });
}

// =====================================================
// 13. JUGADAS DESTACADAS
// =====================================================
function normaliseScorers(scorers) {
  if (!scorers) return [];

  /*
    Formato nuevo:
    [
      { id: "idJugador", nombre: "Bony", goles: 2 },
      { id: "idJugador2", nombre: "Santi", goles: 1 }
    ]
  */
  if (Array.isArray(scorers)) {
    return scorers
      .map((scorer) => ({
        id: scorer.id || "",
        nombre: String(scorer.nombre || "").trim(),
        goles: Number(scorer.goles || 0)
      }))
      .filter(
        (scorer) =>
          scorer.nombre &&
          Number.isFinite(scorer.goles) &&
          scorer.goles > 0
      );
  }

  /*
    Compatibilidad con partidos antiguos guardados como texto:
    "Bony (2), Santi (1)"
  */
  return String(scorers)
    .split(",")
    .map((item) => {
      const result = item.trim().match(/^(.*?)\s*\((\d+)\)$/);

      if (result) {
        return {
          id: "",
          nombre: result[1].trim(),
          goles: Number(result[2])
        };
      }

      return {
        id: "",
        nombre: item.trim(),
        goles: 1
      };
    })
    .filter(
      (scorer) =>
        scorer.nombre &&
        Number.isFinite(scorer.goles) &&
        scorer.goles > 0
    );
}

function formatScorersHTML(scorers) {
  const scorerList = normaliseScorers(scorers);

  if (!scorerList.length) {
    return "Sin registrar";
  }

  return `
    <ul class="scorers-list">
      ${scorerList
        .map((scorer) => {
          const goals = Number(scorer.goles || 0);

          return `
            <li class="scorer-line">
              ${escapeHTML(scorer.nombre).toUpperCase()}: ${goals}
              ${"⚽".repeat(goals)}
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}



let selectedScorers = [];



function renderHighlightsScorersSelector(existingScorers = []) {
  if (!highlightsScorersSelector) return;

  const scorerList = normaliseScorers(existingScorers);

  const goalsByPlayerId = new Map(
    scorerList
      .filter((scorer) => scorer.id)
      .map((scorer) => [
        scorer.id,
        Number(scorer.goles || 0)
      ])
  );

  const goalsByPlayerName = new Map(
    scorerList.map((scorer) => [
      normaliseName(scorer.nombre),
      Number(scorer.goles || 0)
    ])
  );

  /*
    Prioridad:
    1. Partido abierto desde el historial.
    2. Convocatoria actual.
    3. Lista vacía si todavía no existe convocatoria.
  */
  const selectedMatch = selectedMatchId
    ? matches.find((match) => match.id === selectedMatchId)
    : null;

  const calledPlayers =
    selectedMatch?.convocados ||
    currentConvocation?.convocados ||
    [];

  if (!calledPlayers.length) {
    highlightsScorersSelector.innerHTML = `
      <p class="empty-state">
        Primero publica una convocatoria para mostrar los jugadores convocados.
      </p>
    `;
    return;
  }

  const goalOptions = Array.from(
    { length: 11 },
    (_, goals) => {
      const label =
        goals === 0
          ? "0 goles"
          : goals === 1
          ? "1 gol"
          : `${goals} goles`;

      return {
        goals,
        label
      };
    }
  );

  highlightsScorersSelector.innerHTML = calledPlayers
    .map((player) => {
      const goals =
        goalsByPlayerId.get(player.id) ??
        goalsByPlayerName.get(normaliseName(player.nombre)) ??
        0;

      return `
        <div class="scorer-selector-row">
          <span class="scorer-player-name">
            ${escapeHTML(player.nombre)} · #${escapeHTML(player.dorsal)}
          </span>

          <select
            class="scorer-goals-select"
            data-player-id="${escapeHTML(player.id)}"
            data-player-name="${escapeHTML(player.nombre)}"
          >
            ${goalOptions
              .map(
                (option) => `
                  <option
                    value="${option.goals}"
                    ${
                      Number(goals) === option.goals
                        ? "selected"
                        : ""
                    }
                  >
                    ${option.label}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>
      `;
    })
    .join("");
}

function getSelectedScorers() {
  if (!highlightsScorersSelector) return [];

  return [
    ...highlightsScorersSelector.querySelectorAll(
      ".scorer-goals-select"
    )
  ]
    .map((select) => ({
      id: select.dataset.playerId || "",
      nombre: select.dataset.playerName || "",
      goles: Number(select.value)
    }))
    .filter(
      (scorer) =>
        scorer.nombre &&
        Number.isFinite(scorer.goles) &&
        scorer.goles > 0
    );
}

function openHighlightsEditor() {
  if (!isAdmin || !highlightsEditor) return;

  highlightsEditor.classList.remove("hidden");

  if (editHighlightsBtn) {
    editHighlightsBtn.classList.add("hidden");
  }

  if (currentHighlights) {
    if (highlightsEditorTitle) {
      highlightsEditorTitle.textContent = "Editar jugadas destacadas";
    }

    if (saveHighlightsBtn) {
      saveHighlightsBtn.textContent = "Guardar cambios";
    }
  } else {
    if (highlightsEditorTitle) {
      highlightsEditorTitle.textContent = "Publicar jugadas destacadas";
    }

    if (saveHighlightsBtn) {
      saveHighlightsBtn.textContent = "Publicar jugadas destacadas";
    }
  }
}

function closeHighlightsEditor() {
  if (highlightsEditor) {
    highlightsEditor.classList.add("hidden");
  }

  if (editHighlightsBtn && isAdmin && currentHighlights) {
    editHighlightsBtn.classList.remove("hidden");
  }
}

if (editHighlightsBtn) {
  editHighlightsBtn.addEventListener("click", () => {
    openHighlightsEditor();
  });
}

if (cancelHighlightsEditBtn) {
  cancelHighlightsEditBtn.addEventListener("click", () => {
    closeHighlightsEditor();
  });
}

function renderHighlights(highlights) {
  currentHighlights = highlights;

  if (isAdmin && highlights) {
  if (highlightsEditorTitle) {
    highlightsEditorTitle.textContent =
      "Editar jugadas destacadas";
  }

  if (saveHighlightsBtn) {
    saveHighlightsBtn.textContent = "Guardar cambios";
  }

  closeHighlightsEditor();
}

  if (!highlights) {
  if (highlightsDate) {
    highlightsDate.textContent = "Pendiente de confirmar";
  }

  if (highlightsLocation) {
    highlightsLocation.textContent = "Pendiente de confirmar";
  }

  if (highlightsScorers) {
    highlightsScorers.innerHTML = "Sin registrar";
  }

  if (highlightsVideoContainer) {
    highlightsVideoContainer.innerHTML = `
      <p class="empty-state">
        Todavía no se ha publicado un vídeo de jugadas destacadas.
      </p>
    `;
  }

  if (isAdmin) {
    if (highlightsDateInput) {
      highlightsDateInput.value = "";
    }

    if (highlightsLocationInput) {
      highlightsLocationInput.value = "";
    }

    if (highlightsVideoUrlInput) {
      highlightsVideoUrlInput.value = "";
    }

    renderHighlightsScorersSelector([]);

    if (editHighlightsBtn) {
      editHighlightsBtn.classList.add("hidden");
    }

    if (highlightsEditorTitle) {
      highlightsEditorTitle.textContent =
        "Publicar jugadas destacadas";
    }

    if (saveHighlightsBtn) {
      saveHighlightsBtn.textContent =
        "Publicar jugadas destacadas";
    }

    openHighlightsEditor();
  }

  return;
}

  if (highlightsDate) {
    highlightsDate.textContent =
      formatMatchDate(highlights.fecha);
  }

  if (highlightsLocation) {
    highlightsLocation.textContent =
      highlights.ubicacion || "Pendiente de confirmar";
  }

  if (highlightsScorers) {
    highlightsScorers.innerHTML = formatScorersHTML(
      highlights.goleadores
    );
  }

  const previewUrl = getDrivePreviewUrl(highlights.videoUrl);

  if (highlightsVideoContainer) {
    if (previewUrl) {
      highlightsVideoContainer.innerHTML = `
        <iframe
          class="highlights-video"
          src="${escapeHTML(previewUrl)}"
          title="Jugadas destacadas del partido"
          allow="autoplay"
          allowfullscreen
        ></iframe>
      `;
    } else {
      highlightsVideoContainer.innerHTML = `
        <p class="empty-state">
          Todavía no se ha publicado un vídeo de jugadas destacadas.
        </p>
      `;
    }
  }

  if (isAdmin) {
    if (highlightsDateInput) {
      highlightsDateInput.value = highlights.fecha || "";
    }

    if (highlightsLocationInput) {
      highlightsLocationInput.value =
        highlights.ubicacion || "";
    }

    if (highlightsVideoUrlInput) {
      highlightsVideoUrlInput.value =
        highlights.videoUrl || "";
    }

    renderHighlightsScorersSelector(
      highlights.goleadores || []
    );
  }
}

function loadHighlights() {
  highlightsUnsubscribe = db
    .collection("jugadasDestacadas")
    .doc("actual")
    .onSnapshot(
      (doc) => {
        renderHighlights(
          doc.exists ? doc.data() : null
        );
      },
      (error) => {
        console.error(
          "Error al cargar jugadas destacadas actuales:",
          error
        );

        if (highlightsVideoContainer) {
          highlightsVideoContainer.innerHTML = `
            <p class="empty-state">
              No se han podido cargar las jugadas destacadas.
            </p>
          `;
        }
      }
    );
}

if (highlightsForm) {
  highlightsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    const fecha = highlightsDateInput.value;
    const ubicacion = highlightsLocationInput.value.trim();
    const goleadores = getSelectedScorers();
    const videoUrl = highlightsVideoUrlInput.value.trim();

    /*
      Los goleadores no son obligatorios:
      el partido puede haber terminado 0-0.
    */
    if (!fecha || !ubicacion) {
      showMessage(
        highlightsMessage,
        "Completa la fecha y la ubicación del partido.",
        "error"
      );
      return;
    }

    if (videoUrl && !getDriveFileId(videoUrl)) {
      showMessage(
        highlightsMessage,
        "Pega un enlace válido de un vídeo de Google Drive.",
        "error"
      );
      return;
    }

    let targetMatchId =
      selectedMatchId ||
      currentConvocation?.partidoId ||
      null;

    try {
      if (!targetMatchId) {
        const matchSnapshot = await db
          .collection("partidos")
          .where("fecha", "==", fecha)
          .where("ubicacion", "==", ubicacion)
          .get();

        if (!matchSnapshot.empty) {
          targetMatchId = matchSnapshot.docs[0].id;
        }
      }

      if (!targetMatchId) {
        showMessage(
          highlightsMessage,
          "No se ha encontrado un partido asociado. Publica primero una convocatoria o abre un partido desde el historial.",
          "error"
        );
        return;
      }

      const highlightsData = {
        fecha,
        ubicacion,
        goleadores,
        videoUrl: videoUrl || null,
        estado: "finalizado",
        actualizadoPor: currentUser.uid,
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("partidos").doc(targetMatchId).set(
        highlightsData,
        { merge: true }
      );

      await db.collection("jugadasDestacadas").doc("actual").set(
        {
          ...highlightsData,
          partidoId: targetMatchId
        },
        { merge: true }
      );

      selectedMatchId = targetMatchId;

      showMessage(
        highlightsMessage,
        "Jugadas destacadas guardadas correctamente."
      );
    } catch (error) {
      console.error(error);

      showMessage(
        highlightsMessage,
        "No se han podido guardar las jugadas destacadas.",
        "error"
      );
    }
  });
}

if (goToHighlightsBtn) {
  goToHighlightsBtn.addEventListener("click", () => {
    selectedMatchId =
      selectedMatchId ||
      currentConvocation?.partidoId ||
      null;

    /*
      Si se ha publicado una convocatoria actual, muestra
      sus datos en la pantalla de jugadas destacadas.
    */
    const selectedMatch = matches.find(
      (match) => match.id === selectedMatchId
    );

    if (selectedMatch) {
      renderSelectedMatch(selectedMatch);
    }

    showSection("jugadas-destacadas");
  });
}

if (backToConvocationBtn) {
  backToConvocationBtn.addEventListener("click", () => {
    showSection("convocatoria");
  });
}



// =====================================================
// 14. ESTADÍSTICAS
// =====================================================
document
  .getElementById("update-stat-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    const playerId = document.getElementById("stat-player").value;
    const statType = document.getElementById("stat-type").value;
    const amount = Number(document.getElementById("stat-value").value);

    if (!playerId) {
      showMessage(statMessage, "Selecciona un jugador.", "error");
      return;
    }

    if (!Number.isInteger(amount) || amount === 0) {
      showMessage(
        statMessage,
        "Introduce un número entero distinto de cero.",
        "error"
      );
      return;
    }

    const player = players.find((item) => item.id === playerId);

    if (!player) {
      showMessage(
        statMessage,
        "El jugador seleccionado no existe.",
        "error"
      );
      return;
    }

    const currentValue = Number(player.estadisticas?.[statType] || 0);
    const newValue = currentValue + amount;

    if (newValue < 0) {
      showMessage(
        statMessage,
        "La estadística no puede quedar por debajo de cero.",
        "error"
      );
      return;
    }

    try {
      await db.collection("jugadores").doc(playerId).update({
        [`estadisticas.${statType}`]: newValue,
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage(statMessage, "Estadística actualizada correctamente.");
    } catch (error) {
      console.error(error);

      showMessage(
        statMessage,
        "No se ha podido actualizar la estadística.",
        "error"
      );
    }
  });

function getPlayerStatValue(player, statName) {
  return Number(player.estadisticas?.[statName] || 0);
}

function renderStatsRanking(
  container,
  statName,
  emptyMessage,
  singularLabel,
  pluralLabel
) {
  if (!container) return;

  const ranking = [...players]
    .map((player) => ({
      id: player.id,
      nombre: player.nombre,
      dorsal: player.dorsal,
      valor: getPlayerStatValue(player, statName)
    }))
    .filter((player) => player.valor > 0)
    .sort((first, second) => {
      if (second.valor !== first.valor) {
        return second.valor - first.valor;
      }

      return String(first.nombre).localeCompare(
        String(second.nombre),
        "es"
      );
    })
    .slice(0, 5);

  if (!ranking.length) {
    container.innerHTML = `
      <li class="empty-state">
        ${emptyMessage}
      </li>
    `;
    return;
  }

  container.innerHTML = ranking
    .map((player, index) => {
      const statLabel =
        player.valor === 1 ? singularLabel : pluralLabel;

      return `
        <li class="stats-ranking-item">
          <span class="stats-ranking-position">
            ${index + 1}
          </span>

          <span class="stats-ranking-player">
            ${escapeHTML(player.nombre)}
            <small>#${escapeHTML(player.dorsal)}</small>
          </span>

          <strong class="stats-ranking-value">
            ${player.valor} ${statLabel}
          </strong>
        </li>
      `;
    })
    .join("");
}

function renderStatsRankings() {
  renderStatsRanking(
    topScorersList,
    "goles",
    "Todavía no hay goles registrados.",
    "gol",
    "goles"
  );

  renderStatsRanking(
    topAssistsList,
    "asistencias",
    "Todavía no hay asistencias registradas.",
    "asistencia",
    "asistencias"
  );
}

function renderStats() {
  
  renderStatsRankings();
  
  if (!players.length) {
    statsTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-state">
          Añade jugadores para mostrar las estadísticas.
        </td>
      </tr>
    `;
    return;
  }

  statsTableBody.innerHTML = players
    .map((player) => {
      const stats = {
        ...defaultStats(),
        ...(player.estadisticas || {})
      };

      return `
        <tr>
          <td>${escapeHTML(player.nombre)} · #${escapeHTML(player.dorsal)}</td>
          <td>${stats.goles}</td>
          <td>${stats.asistencias}</td>
          <td>${stats.golesSegundoPalo}</td>
          <td>${stats.amarillasProtestar}</td>
          <td>${stats.amarillasFalta}</td>
          <td>${stats.rojas}</td>
          <td>${stats.sextasFaltas}</td>
          <td>${stats.penaltisCometidos}</td>
          <td>${stats.penaltisProvocados}</td>
        </tr>
      `;
    })
    .join("");
}

// =====================================================
// 15. ENTRENAMIENTOS Y ASISTENCIA
// =====================================================
function setTrainingDateLimits() {
  const input = document.getElementById("training-date");

  if (!input) return;

  input.min = getTodayDate();
  input.max = getLastDayOfJune();
}

document
  .getElementById("add-training-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) return;

    const date = document.getElementById("training-date").value;

    if (!date) {
      showMessage(trainingMessage, "Selecciona una fecha.", "error");
      return;
    }

    if (date > getLastDayOfJune()) {
      showMessage(
        trainingMessage,
        "Solo puedes añadir entrenamientos hasta el 30 de junio.",
        "error"
      );
      return;
    }

    try {
      const existingTraining = await db
        .collection("entrenamientos")
        .where("fecha", "==", date)
        .get();

      if (!existingTraining.empty) {
        showMessage(
          trainingMessage,
          "Ya existe un entrenamiento para esa fecha.",
          "error"
        );
        return;
      }

      await db.collection("entrenamientos").add({
        fecha: date,
        creadoPor: currentUser.uid,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
      });

      event.target.reset();

      showMessage(
        trainingMessage,
        "Entrenamiento añadido correctamente."
      );
    } catch (error) {
      console.error(error);

      showMessage(
        trainingMessage,
        "No se ha podido añadir el entrenamiento.",
        "error"
      );
    }
  });

function loadTrainings() {
  trainingsUnsubscribe = db
    .collection("entrenamientos")
    .orderBy("fecha", "asc")
    .onSnapshot(
      async (snapshot) => {
        const trainings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        await renderTrainings(trainings);
      },
      (error) => {
        console.error(error);

        attendanceContainer.innerHTML = `
          <p class="empty-state">
            No se pueden cargar los entrenamientos. Revisa las reglas de Firestore.
          </p>
        `;
      }
    );
}

async function renderTrainings(trainings) {
  if (!trainings.length) {
    attendanceContainer.innerHTML = `
      <p class="empty-state">
        No hay entrenamientos registrados.
      </p>
    `;
    return;
  }

  try {
    const attendancePromises = trainings.map(async (training) => {
      const attendanceSnapshot = await db
        .collection("entrenamientos")
        .doc(training.id)
        .collection("asistencias")
        .get();

      const attendanceMap = {};

      attendanceSnapshot.forEach((doc) => {
        attendanceMap[doc.id] = doc.data();
      });

      return {
        ...training,
        attendanceMap
      };
    });

    const trainingsWithAttendance = await Promise.all(
      attendancePromises
    );

    attendanceContainer.innerHTML = trainingsWithAttendance
      .map((training) => {
        const allPlayersRegistered =
          players.length > 0 &&
          players.every((player) => {
            return training.attendanceMap[player.id]?.asistio !== undefined;
          });

        const rows = players.length
          ? players
              .map((player) => {
                const attendance = training.attendanceMap[player.id];
                const attended = attendance?.asistio;

                if (!isAdmin) {
                  const readableStatus =
                    attended === true
                      ? "Sí"
                      : attended === false
                      ? "No"
                      : "Sin registrar";

                  return `
                    <div class="attendance-row">
                      <strong>
                        ${escapeHTML(player.nombre)} · #${escapeHTML(
                          player.dorsal
                        )}
                      </strong>

                      <span>${readableStatus}</span>

                      <span class="attendance-status">
                        Solo lectura
                      </span>
                    </div>
                  `;
                }

                /*
                  Para el entrenador siempre se generan selectores.
                  Después de guardar se ocultan mediante la clase
                  "attendance-locked", salvo que pulse Editar.
                */
                return `
                  <div class="attendance-row">
                    <strong>
                      ${escapeHTML(player.nombre)} · #${escapeHTML(
                        player.dorsal
                      )}
                    </strong>

                    <select
                      class="attendance-select"
                      data-training-id="${training.id}"
                      data-player-id="${player.id}"
                      data-player-name="${escapeHTML(player.nombre)}"
                    >
                      <option
                        value=""
                        ${attended === undefined ? "selected" : ""}
                      >
                        Sin registrar
                      </option>

                      <option
                        value="si"
                        ${attended === true ? "selected" : ""}
                      >
                        Sí
                      </option>

                      <option
                        value="no"
                        ${attended === false ? "selected" : ""}
                      >
                        No
                      </option>
                    </select>

                    <span class="attendance-readonly-status">
                      ${
                        attended === true
                          ? "Sí"
                          : attended === false
                          ? "No"
                          : "Sin registrar"
                      }
                    </span>
                  </div>
                `;
              })
              .join("")
          : `
            <div class="attendance-row">
              <span>No hay jugadores registrados.</span>
            </div>
          `;

        return `
          <article
            class="training-card ${
              allPlayersRegistered ? "attendance-locked" : ""
            }"
            data-training-id="${training.id}"
          >
            <div class="training-card-header">
              <h3>Entrenamiento: ${formatDate(training.fecha)}</h3>

              ${
                isAdmin
                  ? `
                    <div class="training-card-actions">
                      <button
                        class="small-btn btn-primary edit-attendance-btn"
                        data-action="edit-attendance"
                        data-training-id="${training.id}"
                      >
                        Editar asistencia
                      </button>

                      <button
                        class="small-btn btn-danger"
                        data-action="delete-training"
                        data-training-id="${training.id}"
                      >
                        Eliminar fecha
                      </button>
                    </div>
                  `
                  : ""
              }
            </div>

            <div class="attendance-list">
              ${rows}
            </div>

            ${
              isAdmin
                ? `
                  <div class="attendance-batch-actions">
                    <button
                      class="btn btn-primary"
                      data-action="save-attendance-batch"
                      data-training-id="${training.id}"
                    >
                      ${
                        allPlayersRegistered
                          ? "Guardar cambios"
                          : "Guardar asistencia"
                      }
                    </button>
                  </div>
                `
                : ""
            }
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);

    attendanceContainer.innerHTML = `
      <p class="empty-state">
        No se ha podido cargar la asistencia.
      </p>
    `;
  }
}

attendanceContainer.addEventListener("click", async (event) => {
  const saveBatchButton = event.target.closest(
    '[data-action="save-attendance-batch"]'
  );

  const editButton = event.target.closest(
    '[data-action="edit-attendance"]'
  );

  const deleteButton = event.target.closest(
    '[data-action="delete-training"]'
  );

  /*
    EDITAR ASISTENCIA:
    hace visibles los selectores y el botón de guardar
    solo para ese entrenamiento.
  */
  if (editButton && isAdmin) {
    const trainingCard = editButton.closest(".training-card");

    if (!trainingCard) return;

    trainingCard.classList.remove("attendance-locked");

    const saveButton = trainingCard.querySelector(
      '[data-action="save-attendance-batch"]'
    );

    if (saveButton) {
      saveButton.textContent = "Guardar cambios";
    }

    return;
  }

  /*
    GUARDAR TODA LA ASISTENCIA:
    comprueba todos los selectores y guarda los registros
    en una sola operación batch de Firestore.
  */
  if (saveBatchButton && isAdmin) {
    const trainingId = saveBatchButton.dataset.trainingId;

    const trainingCard = saveBatchButton.closest(".training-card");

    if (!trainingCard) return;

    const selectors = [
      ...trainingCard.querySelectorAll(".attendance-select")
    ];

    if (!selectors.length) {
      alert("No hay jugadores para registrar.");
      return;
    }

    const missingAttendance = selectors.some(
      (selector) => selector.value === ""
    );

    if (missingAttendance) {
      alert(
        "Selecciona Sí o No para todos los jugadores antes de guardar."
      );
      return;
    }

    saveBatchButton.disabled = true;
    saveBatchButton.textContent = "Guardando...";

    try {
      const batch = db.batch();

      selectors.forEach((selector) => {
        const playerId = selector.dataset.playerId;
        const playerName = selector.dataset.playerName;

        const attendanceRef = db
          .collection("entrenamientos")
          .doc(trainingId)
          .collection("asistencias")
          .doc(playerId);

        batch.set(
          attendanceRef,
          {
            jugadorId: playerId,
            jugadorNombre: playerName,
            asistio: selector.value === "si",
            actualizadoPor: currentUser.uid,
            actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      });

      await batch.commit();

      trainingCard.classList.add("attendance-locked");

      saveBatchButton.textContent = "Guardado";

      window.setTimeout(() => {
        saveBatchButton.textContent = "Guardar cambios";
      }, 1500);
    } catch (error) {
      console.error(error);

      saveBatchButton.disabled = false;
      saveBatchButton.textContent = "Guardar cambios";

      alert("No se ha podido guardar la asistencia.");
    }

    return;
  }

  /*
    ELIMINAR ENTRENAMIENTO Y SUS ASISTENCIAS.
  */
  if (deleteButton && isAdmin) {
    const trainingId = deleteButton.dataset.trainingId;

    const confirmed = window.confirm(
      "¿Quieres eliminar este entrenamiento y sus asistencias?"
    );

    if (!confirmed) return;

    try {
      const attendanceSnapshot = await db
        .collection("entrenamientos")
        .doc(trainingId)
        .collection("asistencias")
        .get();

      const batch = db.batch();

      attendanceSnapshot.forEach((document) => {
        batch.delete(document.ref);
      });

      batch.delete(
        db.collection("entrenamientos").doc(trainingId)
      );

      await batch.commit();
    } catch (error) {
      console.error(error);
      alert("No se ha podido eliminar el entrenamiento.");
    }
  }
});