async function loadDashboard() {
  const response = await fetch("data.json");
  const data = await response.json();

  renderKPIs(data.overview);
  renderCompetencyChart(data.competency);
  renderDevelopmentChart(data.developmentArea);
  renderLearningChart(data.learning);
  renderThemeChart("keyLearningChart", data.themes.keyLearning);
  renderThemeChart("applicationChart", data.themes.application);
  renderThemeChart("futureLearningChart", data.themes.futureLearning);
  renderAIInsight(data.aiInsight);
  renderRecommendations(data.recommendations);
}

function formatNumber(value) {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  return value;
}

function renderKPIs(overview) {
  const container = document.getElementById("kpiCards");
  container.innerHTML = "";

  Object.entries(overview).forEach(([label, item]) => {
    const card = document.createElement("div");
    card.className = "kpi-card";

    card.innerHTML = `
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${formatNumber(item.value)}</div>
      <div class="kpi-desc">${item.description || ""}</div>
    `;

    container.appendChild(card);
  });
}

function renderCompetencyChart(items) {
  const ctx = document.getElementById("competencyChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        label: "Average Score",
        data: items.map(item => item.value),
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderDevelopmentChart(items) {
  const ctx = document.getElementById("developmentChart");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        data: items.map(item => item.value),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function renderLearningChart(items) {
  const filtered = items.filter(item =>
    item.label === "Average Before Level" ||
    item.label === "Average After Level" ||
    item.label === "Average Improvement"
  );

  const ctx = document.getElementById("learningChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: filtered.map(item => item.label),
      datasets: [{
        label: "Learning Level",
        data: filtered.map(item => item.value),
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderThemeChart(canvasId, items) {
  const ctx = document.getElementById(canvasId);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(item => item.label),
      datasets: [{
        label: "Theme Mentions",
        data: items.map(item => item.value),
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderAIInsight(aiInsight) {
  const container = document.getElementById("aiInsight");
  container.innerHTML = "";

  Object.entries(aiInsight).forEach(([label, item]) => {
    const block = document.createElement("div");
    block.innerHTML = `
      <div class="insight-title">${label}</div>
      <p>${item.value}</p>
    `;
    container.appendChild(block);
  });
}

function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";

  recommendations.forEach(item => {
    const div = document.createElement("div");
    div.className = "recommendation-item";
    div.textContent = item.value;
    container.appendChild(div);
  });
}

loadDashboard().catch(error => {
  console.error("Dashboard loading error:", error);
  document.body.innerHTML += `
    <div style="margin: 32px; padding: 20px; background: #fee2e2; border-radius: 12px;">
      Dashboard loading error. Please check data.json.
    </div>
  `;
});
