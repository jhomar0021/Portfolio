document.addEventListener("DOMContentLoaded", () => {
  // Clone Marquee tracks to allow seamless wrapping loops
  const tracks = document.querySelectorAll(".marquee-track");
  tracks.forEach((track) => {
    const items = Array.from(track.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });
  });

  // Load Experience Data
  fetch("experience.json")
    .then((res) => res.json())
    .then((data) => renderExperience(data))
    .catch((err) => console.error("Error fetching experiences:", err));

  // Load Projects Data
  fetch("projects.json")
    .then((res) => res.json())
    .then((data) => {
      renderFilterButtons(data);
      renderProjects(data);
      setupFiltering(data);
    })
    .catch((err) => console.error("Error fetching projects:", err));
});

// Add a variable at the top of your script.js to track position
let currentExpIndex = 0;
let globalExperiences = []; // To store the fetched data globally

// Update your DOMContentLoaded fetch block to save the data globally
// Replace your old fetch("experience.json") with this:
fetch("experience.json")
  .then((res) => res.json())
  .then((data) => {
    globalExperiences = data;
    renderExperience();
  })
  .catch((err) => console.error("Error fetching experiences:", err));

function renderExperience() {
  const container = document.getElementById("experience-container");

  const visibleExperiences = globalExperiences.slice(
    currentExpIndex,
    currentExpIndex + 2,
  );

  let cardsHtml = visibleExperiences
    .map(
      (exp) => `
        <div class="col-md-10 mb-4">
            <div class="card exp-card p-4">
                <div class="d-flex justify-content-between align-items-start flex-wrap">
                    <div>
                        <h4 class="fw-bold mb-1">${exp.company}</h4>
                        <h6 class="text-muted fw-semibold mb-3">${exp.role}</h6>
                    </div>
                    <span class="badge bg-light text-dark border p-2 mb-2">${exp.duration}</span>
                </div>
                ${
                  exp.highlights.length
                    ? `
                    <ul class="mb-0 plan-list">
                        ${exp.highlights.map((li) => `<li class="mb-2 text-secondary">${li}</li>`).join("")}
                    </ul>
                `
                    : ""
                }
            </div>
        </div>
    `,
    )
    .join("");

  // Simplified Boundary Checks
  const isStart = currentExpIndex === 0;
  const isEnd = currentExpIndex >= globalExperiences.length - 2;

  let controlsHtml = `
    <div class="col-md-1 d-flex flex-column align-items-center justify-content-center gap-2 mb-4">
        <button id="prev-exp-btn" class="btn btn-purple rounded-circle shadow-sm ${isStart ? "disabled opacity-25" : ""}" 
                style="width: 45px; height: 45px; margin: 10px;" onclick="scrollExperience(-1)">
            <i class="fas fa-arrow-up"></i>
        </button>
        <button id="next-exp-btn" class="btn btn-purple rounded-circle shadow-sm ${isEnd ? "disabled opacity-25" : ""}" 
                style="width: 45px; height: 45px; margin: 10px;" onclick="scrollExperience(1)">
            <i class="fas fa-arrow-down"></i>
        </button>
    </div>
  `;

  container.innerHTML =
    `<div class="col-md-11"><div class="row justify-content-center">${cardsHtml}</div></div>` +
    controlsHtml;
}
window.scrollExperience = function (direction) {
  const newIndex = currentExpIndex + direction;
  const maxIndex = Math.max(0, globalExperiences.length - 2);

  // Only update if the new index is within safe bounds [0, maxIndex]
  if (newIndex >= 0 && newIndex <= maxIndex) {
    currentExpIndex = newIndex;
    renderExperience();
  }
};

// Generate dynamic filter categories based on distinct entries inside JSON
function renderFilterButtons(projects) {
  const filterBtnContainer = document.getElementById("filter-buttons");
  const categories = [
    "all",
    ...new Set(projects.map((p) => p.category.toLowerCase())),
  ];

  // Clear and reset static all button
  filterBtnContainer.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `btn filter-btn ${cat === "all" ? "active" : ""}`;
    btn.setAttribute("data-filter", cat);
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filterBtnContainer.appendChild(btn);
  });
}

// Render Project Layout Grid Mapping
function renderProjects(projects, filter = "all") {
  const container = document.getElementById("projects-container");
  const filtered =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category.toLowerCase() === filter);

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">No projects found in this category.</p>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (proj) => `
        <div class="col-md-6 col-lg-4">
            <div class="card project-card">
                <img src="${proj.image}" alt="${proj.title}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-secondary badge-category">${proj.category}</span>
                        </div>
                        <h5 class="fw-bold text-dark">${proj.title}</h5>
                        <p class="text-muted small">${proj.description}</p>
                        <div class="mb-3 d-flex flex-wrap gap-1">
                            ${proj.builtWith.map((tech) => `<span class="badge bg-light text-dark border font-monospace" style="font-size:0.75rem">${tech}</span>`).join("")}
                        </div>
                    </div>
                    <a href="${proj.link}" class="btn btn-purple w-100 mt-2" target="blank">View Project</a>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

// Handle action event hooks for filters
function setupFiltering(projects) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      buttons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      const targetFilter = e.target.getAttribute("data-filter");
      renderProjects(projects, targetFilter);
    });
  });
}
