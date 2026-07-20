const loadingMessages = [
  "🔍 Sneaking into your GitHub...",
  "📦 Dusting off your repositories...",
  "👀 Reading commit messages... yikes.",
  "🧠 Measuring confidence vs actual code...",
  "🤖 Convincing AI to be slightly nicer...",
  "🌶️ Adding the perfect amount of spice...",
  "💀 Preparing emotional damage...",
];
const logo = document.querySelector(".logo");
const input = document.getElementById("usernameInput");
const button = document.getElementById("searchBtn");
const avatar = document.getElementById("profileAvatar");
const profileLink = document.getElementById("profileLink");
const grillCount = document.getElementById("grillCount");
const statusText = document.getElementById("statusText");
const loadingSection = document.getElementById("loadingSection");
const loadingText = document.getElementById("loadingText");
const loader = document.getElementById("loader");
const roastCard = document.getElementById("roastCard");
const roastText = document.getElementById("roastText");
const actionButtons = document.getElementById("actionButtons");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadCard = document.getElementById("downloadCard");
const downloadAvatar = document.getElementById("downloadAvatar");
const downloadUsername = document.getElementById("downloadUsername");
const downloadRoast = document.getElementById("downloadRoast");
const shareBtn = document.getElementById("shareBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalAction = document.getElementById("modalAction");
const modalImage = document.getElementById("modalImage");
const url = window.location.origin;
let currentRoast = "";
let currentScreenshot = "";
let loadingInterval;

button.addEventListener("click", handleSearch);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !button.disabled) {
    button.click();
  }
});
logo.addEventListener("click", () => {
  window.location.href = window.location.origin;
});
copyBtn.addEventListener("click", async () => {
  if (!currentRoast) return;
  try {
    await navigator.clipboard.writeText(currentRoast);
  } catch {
    openModal({
      title: "Roast Copied",
      message:
        "Your GitGrill roast has been copied to the clipboard. Ready to share the damage?",
      actionText: "Share",
      actionFunction: closeModalBox,
    });
    return;
  }

  openModal({
    title: "Text Copied",
    message: "Your roast has been copied successfully. Want to share it?",
    actionText: "Share",
    actionFunction: shareRoast,
  });
});
downloadBtn.addEventListener("click", async () => {
  if (!currentRoast) return;
  closeModalBox();
  currentScreenshot = await generateDownloadCard();

  openModal({
    title: "Download Preview",
    message: "",
    image: currentScreenshot,
    actionText: "Download",
    actionFunction: async () => {
      downloadImage();
      modalAction.textContent = "Share";
      modalAction.onclick = shareImage;
    },
  });
});
shareBtn.addEventListener("click", async () => {
  if (!currentRoast) return;
  if (navigator.share) {
    try {
      await navigator.share({
        title: "My GitGrill Roast 🔥",
        text: "Think your GitHub profile can survive GitGrill? Come find out 😂",
        url: url,
      });
    } catch (err) {
      console.log("Share cancelled");
    }
  } else {
    await navigator.clipboard.writeText(url);

    openModal({
      title: "Link Copied",
      message:
        "GitGrill link copied to your clipboard. Share it with someone brave enough to get roasted.",
      actionText: "Open Website",
      actionFunction: () => window.open(url, "_blank"),
    });
  }
});
closeModal.addEventListener("click", closeModalBox);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModalBox();
  }
});

function handleSearch() {
  const username = input.value.trim();
  if (window.innerWidth < 768) {
    input.blur();
  }
  if (username === "") {
    clearInterval(loadingInterval);
    loadingSection.classList.add("hidden");
    statusText.classList.remove("hidden");
    statusText.textContent =
      "🤨 Planning to roast invisible developers? Enter a username first.";
    return;
  }
  fetchGitHubProfile(username);
}
async function fetchGitHubProfile(username) {
  try {
    clearInterval(loadingInterval);

    roastCard.classList.add("hidden");
    actionButtons.classList.add("hidden");
    roastText.textContent = "";
    currentRoast = "";
    statusText.classList.remove("hidden");
    statusText.textContent = "";
    loadingSection.classList.remove("hidden");
    loader.classList.remove("hidden");
    loadingText.textContent = loadingMessages[0];
    button.disabled = true;
    button.style.pointerEvents = "none";
    button.style.opacity = "0.6";

    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
      clearInterval(loadingInterval);
      loader.classList.add("hidden");
      loadingSection.classList.add("hidden");
      statusText.classList.remove("hidden");
      statusText.textContent = "😅 That GitHub profile doesn't exist.";
      button.disabled = false;
      button.style.pointerEvents = "";
      button.style.opacity = "";
      return;
    }
    const user = await response.json();

    avatar.src = user.avatar_url;
    profileLink.href = user.html_url;

    startLoadingMessages();
    const result = await generateRoast({
      username,
    });

    clearInterval(loadingInterval);

    loadingSection.classList.add("hidden");
    statusText.classList.add("hidden");
    roastCard.classList.remove("hidden");
    roastText.textContent = result.roast;
    currentRoast = result.roast;

    const total = result.totalGrills ?? 0;

    if (total <= 0) {
      grillCount.textContent = "Grills";
    } else if (total === 1) {
      grillCount.textContent = "1 Grill";
    } else {
      grillCount.textContent = `${total.toLocaleString()} Grills`;
    }

    actionButtons.classList.remove("hidden");
    button.disabled = false;
    button.style.pointerEvents = "";
    button.style.opacity = "";
  } catch (error) {
    console.error(error);
    clearInterval(loadingInterval);
    loadingSection.classList.add("hidden");
    loader.classList.add("hidden");
    statusText.classList.remove("hidden");
    statusText.textContent =
      "💀 GitGrill accidentally roasted itself. Try again.";
    button.disabled = false;
    button.style.pointerEvents = "";
    button.style.opacity = "";
  }
}

async function loadGrillCount() {
  try {
    const response = await fetch("/grills");
    const data = await response.json();

    grillCount.textContent = `${data.totalGrills.toLocaleString()} Grills`;
  } catch (err) {
    console.error(err);
  }
}
async function generateRoast(data) {
  const response = await fetch("/roast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate roast");
  }

  return await response.json();
}
function startLoadingMessages() {
  clearInterval(loadingInterval);
  let index = 0;
  loadingText.textContent = loadingMessages[index];

  loadingInterval = setInterval(() => {
    if (index < loadingMessages.length - 1) {
      index++;
      loadingText.textContent = loadingMessages[index];
    }
  }, 800);
}

function openModal({
  title,
  message,
  actionText,
  actionFunction,
  image = null,
}) {
  modalTitle.textContent = title;
  modalAction.textContent = actionText;
  modalAction.onclick = actionFunction;

  if (image) {
    modalImage.src = image;

    modalImage.classList.remove("hidden");
  } else {
    modalImage.classList.add("hidden");
  }
  if (message) {
    modalMessage.textContent = message;
    modalMessage.style.display = "block";
  } else {
    modalMessage.style.display = "none";
  }
  modalOverlay.classList.remove("hidden");
}

function closeModalBox() {
  modalOverlay.classList.add("hidden");
}

async function shareRoast() {
  if (navigator.share) {
    await navigator.share({
      title: "My GitGrill Roast 🔥",
      text: currentRoast,
    });
  } else {
    try {
      await navigator.clipboard.writeText(currentRoast);
    } catch {
      openModal({
        title: "Copy Failed",
        message: "Clipboard permission denied.",
        actionText: "Okay",
        actionFunction: closeModalBox,
      });
    }
  }
}
async function generateDownloadCard() {
  downloadAvatar.src = avatar.src;
  downloadUsername.textContent = input.value.trim();
  downloadRoast.textContent = currentRoast;
  downloadCard.style.display = "flex";

  await new Promise((resolve) => setTimeout(resolve, 100));

  const canvas = await html2canvas(downloadCard, {
    backgroundColor: "#010409",
    scale: 3,
    useCORS: true,
  });

  downloadCard.style.display = "";
  return canvas.toDataURL("image/png");
}
function downloadImage() {
  const link = document.createElement("a");

  link.href = currentScreenshot;
  const username = input.value.trim() || "github-user";
  link.download = `${username}-GitGrillRoast.png`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
async function shareImage() {
  const response = await fetch(currentScreenshot);

  const blob = await response.blob();

  const file = new File([blob], "GitGrill-Roast.png", {
    type: "image/png",
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "My GitGrill Roast 🔥",

      files: [file],
    });
  } else {
    await navigator.clipboard.writeText(url);

    openModal({
      title: "Sharing Unavailable",
      message:
        "😔 Your device refused to share this masterpiece. Download it instead and flex manually.",
      actionText: "Okay",
      actionFunction: closeModalBox,
    });
  }
}

loadGrillCount();
