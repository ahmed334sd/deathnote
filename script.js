const button = document.getElementById("typewriter-button");
const textSpan = document.getElementById("button-text");
function getMaxLines() {
  return window.innerWidth < 700 ? 5 : 10;
}

const fullText = "Next Page";
let index = 0;
let typing = false;
let interval;
let direction = "forward"; // or "backward"

function startTypingLoop() {
  typing = true;
  interval = setInterval(() => {
    if (direction === "forward") {
      index++;
      if (index > fullText.length) {
        direction = "backward";
        index = fullText.length - 1;
      }
    } else {
      index--;
      if (index < 0) {
        direction = "forward";
        index = 1;
      }
    }
    textSpan.textContent = fullText.slice(0, index);
  }, 100); // Speed: change as you like
}

function stopTypingLoop() {
  // Finish current cycle before stopping
  clearInterval(interval);
  const finish = setInterval(() => {
    if (direction === "forward") {
      index++;
      if (index >= fullText.length) {
        clearInterval(finish);
        textSpan.textContent = fullText;
        typing = false;
      } else {
        textSpan.textContent = fullText.slice(0, index);
      }
    } else {
      index--;
      if (index <= 0) {
        clearInterval(finish);
        textSpan.textContent = fullText;
        typing = false;
      } else {
        textSpan.textContent = fullText.slice(0, index);
      }
    }
  }, 100);
}

button.addEventListener("mouseenter", () => {
  if (!typing) startTypingLoop();
});

button.addEventListener("mouseleave", () => {
  stopTypingLoop();
});

// ======= CONFIG =======
const totalPages = 73; // 0 is the first .cover, 1–71 are dynamic, 72 is final cover
let currentPage = 0;

// ======= PAGE GENERATION =======
const body = document.body;

// Add: Rules Page 1
addPage("page", "rules", "rules1.png");

// Add: 68 Writing Pages
for (let i = 0; i < 68; i++) {
  const pageIndex = document.querySelectorAll(".page, .cover").length;
  addPage("page writing", "writing", "writingbg.png");
  const writingPage = document.getElementById(`page-writing-${pageIndex}`);
  setupWritingPage(writingPage);
}

// Add: Rules Page 2
addPage("page", "rules", "rules2.png");

// Add: Rules Page 3
addPage("page", "rules", "rules3.png");

// Add: Final Cover Page
addPage("cover", "cover2", "cover2.png");

// ======= ADD PAGE FUNCTION =======
function addPage(classes, id, bgImage) {
  const div = document.createElement("div");
  div.className = classes;
  div.id = `page-${id}-${document.querySelectorAll(".page, .cover").length}`;
  div.style.backgroundImage = `url("${bgImage}")`;
  div.style.display = "none";

  // Add page number if it's a writing page
  if (classes.includes("writing")) {
    const pageNumber = document.createElement("div");
    pageNumber.className = "page-number";
    const num = document.querySelectorAll(".writing").length + 1;
    pageNumber.textContent = num;
    div.appendChild(pageNumber);
  }
  body.insertBefore(div, document.querySelector(".parent"));
  // Hide the button only on the final cover page
}

function setupWritingPage(page) {
  const linesContainer = document.createElement("div");
  linesContainer.className = "lines";

  for (let i = 0; i < 10; i++) {
    const line = document.createElement("p");
    line.className = "line";
    linesContainer.appendChild(line);
  }

  page.appendChild(linesContainer);
}

// ======= SOUND SETUP =======
const rulesSound = new Audio("rules.mp3");
const writingSound = new Audio("writing.mp3");
const flipSound = new Audio("flip.mp3");

// ======= BUTTON FUNCTIONALITY =======
const nextBtn = document.getElementById("typewriter-button");

nextBtn.addEventListener("click", () => {
  const pages = document.querySelectorAll(".cover, .page");
  flipSound.playbackRate = 2.5;
  flipSound.play();

  // Hide current page
  pages[currentPage].style.display = "none";

  // Go to next page
  currentPage++;
  if (currentPage >= pages.length) currentPage = 0;

  // Show new page
  pages[currentPage].style.display = "block";

  // Hide the button if this is the final cover page
  if (
    pages[currentPage].classList.contains("cover") &&
    currentPage === pages.length - 1
  ) {
    nextBtn.classList.add("hidden");
  } else {
    nextBtn.classList.remove("hidden");
  }

  // 🔒 HIDE NEXT BUTTON IF FINAL PAGE
  if (currentPage === pages.length - 1) {
    nextBtn.style.display = "none";
  }

  // Play sounds based on page type
  const current = pages[currentPage];
  if (current.classList.contains("writing")) {
    writingSound.currentTime = 0;
    writingSound.play();
    rulesSound.pause();
    const writingPages = document.querySelectorAll(".writing.page");
    const writingIndex = [...writingPages].indexOf(current);
    activateWritingPage(writingIndex);
    document.getElementById("write-instruction").style.display = "block";
  } else if (current.classList.contains("page")) {
    rulesSound.currentTime = 0;
    rulesSound.play();
    writingSound.pause();
    document.getElementById("write-instruction").style.display = "none";
  }
});

// Handle tab switching to pause/resume audio
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Tab is not active: pause both
    if (!writingSound.paused) writingSound.pause();
    if (!rulesSound.paused) rulesSound.pause();
  } else {
    // Tab is active again: resume the correct one
    const pages = document.querySelectorAll(".cover, .page");
    const current = pages[currentPage];
    if (current.classList.contains("writing")) {
      writingSound.play();
    } else if (current.classList.contains("page")) {
      rulesSound.play();
    }
  }
});

let currentLine = 0;
let writingPageIndex = 0;

const hiddenInput = document.getElementById("hidden-input");

hiddenInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const writingPages = document.querySelectorAll(".writing.page");
    const current = writingPages[writingPageIndex];
    const lines = current.querySelectorAll(".line");
    const currentLineElement = lines[currentLine];
    // Find the next available empty line
    while (
      currentLine < lines.length &&
      lines[currentLine].textContent.trim() !== ""
    ) {
      currentLine++;
    }

    // If no empty lines are left, clear input and exit
    if (currentLine >= lines.length) {
      hiddenInput.value = "";
      return;
    }

    const text = hiddenInput.value.trim();
    const words = text.split(/\s+/).filter(Boolean);
    let finalText = text;

    if (words.length > 10) {
      // Fallback phrases for exceeding 10 words
      const fallbackSnippets = [
        "The limit is ten words, darling.",
        "Breathe, honey. Just ten words.",
        "Slow down, Shakespeare!",
        "Ten. Just ten. That’s the rule.",
        "Whoops! Word overload.",
      ];
      finalText =
        fallbackSnippets[Math.floor(Math.random() * fallbackSnippets.length)];
    }

    if (currentLine < 10) {
      lines[currentLine].textContent = finalText;

      // Save to localStorage
      const key = `writing-${writingPageIndex}-line-${currentLine}`;
      localStorage.setItem(key, finalText);

      currentLine++;
      hiddenInput.value = "";
    }
  }
});

function activateWritingPage(index) {
  writingPageIndex = index;
  currentLine = 0;
  hiddenInput.focus();

  const writingPages = document.querySelectorAll(".writing.page");
  const current = writingPages[writingPageIndex];
  const lines = current.querySelectorAll(".line");

  for (let i = 0; i < lines.length; i++) {
    const saved = localStorage.getItem(`writing-${writingPageIndex}-line-${i}`);
    if (saved) {
      lines[i].textContent = saved;
    } else {
      lines[i].textContent = ""; // clear in case of reused pages
    }
  }
}
