let charts = [];

async function loadDashboard() {
  try {
    const response = await fetch("data.json?v=" + Date.now());
    if (!response.ok) throw new Error("Cannot load data.json");

    const data = await response.json();

    destroyCharts();

    renderKPIs(data.overview || {});
    renderTargetGroupsChart(data.groups?.assessment || []);
    renderDomainChart(data.competency || []);
    renderMiniCompetencyChart(data.competency || []);
    renderFocusRadarChart(data.competency || []);
    renderLearningChart(data.learning || []);
    renderDevelopmentChart(data.developmentArea || []);
    renderThemeChart("keyLearningChart", data.themes?.keyLearning || [], "Mentions");
    renderThemeChart("applicationChart", data.themes?.application || [], "Mentions");
    renderThemeChart("futureLearningChart", data.themes?.futureLearning || [], "Mentions");
    renderAIInsight(data.aiInsight || {});
    renderRecommendations(data.recommendations || []);
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function destroyCharts() {
  charts.forEach(chart => chart.destroy());
  charts = [];
}

function formatNumber(value) {
  const n = Number(value);
  if (!isNaN(n)) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  return value || "-";
}

function makeGradient(ctx, color1, color2) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 320);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

function commonScalesOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#eef4ff",
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(6,19,39,0.95)",
        titleColor: "#ffffff",
        bodyColor: "#eef4ff",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: "#d9e5f8" },
        grid: { color: "rgba(255,255,255,0.08)" }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#d9e5f8" },
        grid: { color: "rgba(255,255,255,0.08)" }
      }
    }
  };
}

function renderKPIs(overview) {
  const container = document.getElementById("kpiCards");
  container.innerHTML = "";

  const entries = Object.entries(overview);
  if (!entries.length) {
    container.innerHTML = `<div class="empty-message">No KPI data available.</div>`;
    return;
  }

  entries.forEach(([label, item]) => {
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

function renderTargetGroupsChart(items) {
  const canvas = document.getElementById("targetGroupsChart");
  if (!items.length) {
    showEmptyCanvasMessage("targetGroupsChart", "No group data available.");
    return;
  }

  const chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        data: items.map(i => Number(i.value)),
        backgroundColor: [
          "rgba(81,194,255,0.95)",
          "rgba(143,98,255,0.95)",
          "rgba(72,217,155,0.95)",
          "rgba(255,160,75,0.95)"
        ],
        borderColor: "rgba(6,19,39,1)",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#eef4ff" }
        }
      }
    }
  });

  charts.push(chart);
}

function renderDomainChart(items) {
  const canvas = document.getElementById("domainChart");
  if (!items.length) {
    showEmptyCanvasMessage("domainChart", "No competency data available.");
    return;
  }

  const chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        data: items.map(i => Number(i.value)),
        backgroundColor: [
          "rgba(81,194,255,0.95)",
          "rgba(72,217,155,0.95)",
          "rgba(143,98,255,0.95)"
        ],
        borderColor: "rgba(6,19,39,1)",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#eef4ff" }
        }
      }
    }
  });

  charts.push(chart);
}

function renderMiniCompetencyChart(items) {
  const canvas = document.getElementById("miniCompetencyChart");
  if (!items.length) {
    showEmptyCanvasMessage("miniCompetencyChart", "No competency data available.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const gradient = makeGradient(ctx, "rgba(81,194,255,0.95)", "rgba(143,98,255,0.35)");

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label: "Average Score",
        data: items.map(i => Number(i.value)),
        backgroundColor: gradient,
        borderColor: "rgba(81,194,255,1)",
        borderWidth: 1.2,
        borderRadius: 10
      }]
    },
    options: commonScalesOptions()
  });

  charts.push(chart);
}

function renderFocusRadarChart(items) {
  const canvas = document.getElementById("focusRadarChart");
  if (!items.length) {
    showEmptyCanvasMessage("focusRadarChart", "No competency data available.");
    return;
  }

  const chart = new Chart(canvas, {
    type: "radar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label: "Competency Average",
        data: items.map(i => Number(i.value)),
        fill: true,
        backgroundColor: "rgba(81,194,255,0.20)",
        borderColor: "rgba(81,194,255,1)",
        pointBackgroundColor: "rgba(143,98,255,1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(81,194,255,1)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#eef4ff" }
        }
      },
      scales: {
        r: {
          angleLines: { color: "rgba(255,255,255,0.08)" },
          grid: { color: "rgba(255,255,255,0.10)" },
          pointLabels: {
            color: "#eef4ff",
            font: { size: 12 }
          },
          ticks: {
            color: "#dbe8ff",
            backdropColor: "transparent"
          }
        }
      }
    }
  });

  charts.push(chart);
}

function renderLearningChart(items) {
  const canvas = document.getElementById("learningChart");
  const selectedLabels = [
    "Average Before Level",
    "Average After Level",
    "Average Improvement",
    "Improved Learners (%)"
  ];

  const filtered = items.filter(i => selectedLabels.includes(i.label));
  if (!filtered.length) {
    showEmptyCanvasMessage("learningChart", "No learning progress data available.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const gradient = makeGradient(ctx, "rgba(72,217,155,0.95)", "rgba(81,194,255,0.30)");

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: filtered.map(i => i.label),
      datasets: [{
        label: "Value",
        data: filtered.map(i => Number(i.value)),
        backgroundColor: gradient,
        borderColor: "rgba(72,217,155,1)",
        borderWidth: 1.2,
        borderRadius: 12
      }]
    },
    options: commonScalesOptions()
  });

  charts.push(chart);
}

function renderDevelopmentChart(items) {
  const canvas = document.getElementById("developmentChart");
  if (!items.length) {
    showEmptyCanvasMessage("developmentChart", "No development area data available.");
    return;
  }

  const chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        data: items.map(i => Number(i.value)),
        backgroundColor: [
          "rgba(81,194,255,0.95)",
          "rgba(143,98,255,0.95)",
          "rgba(255,160,75,0.95)",
          "rgba(72,217,155,0.95)"
        ],
        borderColor: "rgba(6,19,39,1)",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#eef4ff" }
        }
      }
    }
  });

  charts.push(chart);
}

function renderThemeChart(canvasId, items, labelName) {
  const canvas = document.getElementById(canvasId);
  if (!items.length) {
    showEmptyCanvasMessage(canvasId, "No theme data available.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const gradient = makeGradient(ctx, "rgba(81,194,255,0.95)", "rgba(143,98,255,0.30)");

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label: labelName,
        data: items.map(i => Number(i.value)),
        backgroundColor: gradient,
        borderColor: "rgba(81,194,255,1)",
        borderWidth: 1.2,
        borderRadius: 10
      }]
    },
    options: {
      ...commonScalesOptions(),
      indexAxis: "y"
    }
  });

  charts.push(chart);
}

function renderAIInsight(aiInsight) {
  const container = document.getElementById("aiInsight");
  container.innerHTML = "";

  const entries = Object.entries(aiInsight);
  if (!entries.length) {
    container.innerHTML = `<div class="empty-message">No AI insight available.</div>`;
    return;
  }

  entries.forEach(([title, item]) => {
    const block = document.createElement("div");
    block.className = "insight-item";
    block.innerHTML = `
      <div class="insight-item-title">${title}</div>
      <div class="insight-item-text">${item.value || ""}</div>
    `;
    container.appendChild(block);
  });
}

function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";

  if (!recommendations.length) {
    container.innerHTML = `<div class="empty-message">No recommendations available.</div>`;
    return;
  }

  recommendations.forEach(item => {
    const div = document.createElement("div");
    div.className = "recommendation-item";
    div.textContent = item.value || "";
    container.appendChild(div);
  });
}

function showEmptyCanvasMessage(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const parent = canvas.parentElement;
  parent.innerHTML = `<div class="empty-message">${message}</div>`;
}

function showError(message) {
  document.querySelector(".page-shell").innerHTML = `
    <div class="panel glass" style="padding:24px; margin-top:20px;">
      <div class="panel-title">Dashboard Error</div>
      <div class="panel-note">${message}</div>
      <div class="panel-note">โปรดตรวจสอบไฟล์ data.json ว่ามีข้อมูลถูกต้องหรือไม่</div>
    </div>
  `;
}

loadDashboard();
