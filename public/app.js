export function formatSummary(summary, loadFailed = false) {
  if (loadFailed) {
    return {
      day: "Unavailable",
      detail: "Community data could not be loaded. Try again shortly.",
      tone: "error"
    };
  }

  if (!summary || summary.total === 0) {
    return {
      day: "No reports yet",
      detail: "Be the first to share an observed day",
      tone: "empty"
    };
  }

  return {
    day: summary.day,
    detail: `${summary.winningReports} of ${summary.total} recent reports agree · ${summary.status}`,
    tone: summary.status === "Community consensus" ? "consensus" : "developing"
  };
}

export function makeReportPayload(values) {
  return {
    block: values.block,
    stream: values.stream,
    day: values.day,
    website: values.website || ""
  };
}

function initializeTracker() {
  const state = { block: "2100", schedule: null, loadFailed: false };
  const blockButtons = [...document.querySelectorAll("[data-block]")];
  const selectedBlock = document.querySelector("#selected-block");
  const reportBlock = document.querySelector("#report-block");
  const scheduleRegion = document.querySelector("#schedule");
  const form = document.querySelector("#report-form");
  const submitButton = document.querySelector("#submit-button");
  const formStatus = document.querySelector("#form-status");

  function renderSchedule() {
    for (const card of document.querySelectorAll("[data-stream-card]")) {
      const summary = state.schedule?.blocks?.[state.block]?.[card.dataset.streamCard];
      const view = formatSummary(summary, state.loadFailed);
      const day = card.querySelector(".schedule-day");
      const detail = card.querySelector(".schedule-detail");

      day.textContent = view.day;
      detail.textContent = view.detail;
      detail.className = "schedule-detail";
      if (["consensus", "developing", "error"].includes(view.tone)) {
        detail.classList.add(view.tone);
      }
    }
  }

  function selectBlock(block) {
    state.block = block;
    selectedBlock.textContent = block;
    reportBlock.value = block;

    for (const button of blockButtons) {
      const active = button.dataset.block === block;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    renderSchedule();
  }

  async function loadSchedule() {
    scheduleRegion.setAttribute("aria-busy", "true");
    state.loadFailed = false;

    try {
      const response = await fetch("/api/schedule", {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Schedule unavailable");
      state.schedule = await response.json();
    } catch {
      state.schedule = null;
      state.loadFailed = true;
    } finally {
      scheduleRegion.setAttribute("aria-busy", "false");
      renderSchedule();
    }
  }

  blockButtons.forEach((button) => {
    button.addEventListener("click", () => selectBlock(button.dataset.block));
  });

  reportBlock.addEventListener("change", () => selectBlock(reportBlock.value));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "Submitting…";
    formStatus.className = "form-status";
    submitButton.disabled = true;

    const data = new FormData(form);
    const payload = makeReportPayload(Object.fromEntries(data.entries()));

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Report could not be submitted.");

      formStatus.textContent = "Thank you — your community report was recorded.";
      formStatus.classList.add("success");
      form.reset();
      reportBlock.value = state.block;
      await loadSchedule();
    } catch (error) {
      formStatus.textContent = error.message || "Report could not be submitted.";
      formStatus.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });

  selectBlock(state.block);
  loadSchedule();
}

if (typeof document !== "undefined") initializeTracker();
