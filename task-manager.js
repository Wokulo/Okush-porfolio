(() => {
  "use strict";

  const STORAGE_KEY = "okush.taskManager.v1";
  const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

  const state = {
    tasks: [],
    filter: "all",
    query: "",
    sortBy: "created-desc",
    editingTaskId: null
  };

  const ui = {
    form: document.getElementById("task-form"),
    titleInput: document.getElementById("task-title"),
    priorityInput: document.getElementById("task-priority"),
    dueInput: document.getElementById("task-due"),
    notesInput: document.getElementById("task-notes"),
    formError: document.getElementById("form-error"),
    filterButtons: Array.from(document.querySelectorAll(".chip")),
    searchInput: document.getElementById("search-input"),
    sortSelect: document.getElementById("sort-select"),
    taskList: document.getElementById("task-list"),
    emptyState: document.getElementById("empty-state"),
    taskStats: document.getElementById("task-stats"),
    clearCompletedBtn: document.getElementById("clear-completed"),
    statusMessage: document.getElementById("status-message"),
    taskTemplate: document.getElementById("task-item-template"),
    editDialog: document.getElementById("edit-dialog"),
    editForm: document.getElementById("edit-form"),
    editTitle: document.getElementById("edit-title"),
    editPriority: document.getElementById("edit-priority"),
    editDue: document.getElementById("edit-due"),
    editNotes: document.getElementById("edit-notes"),
    editError: document.getElementById("edit-error"),
    cancelEdit: document.getElementById("cancel-edit")
  };

  const sanitizeText = (text, maxLength) => String(text || "").trim().replace(/\s+/g, " ").slice(0, maxLength);

  const makeId = () => {
    const cryptoObj = window.crypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
      return cryptoObj.randomUUID();
    }

    return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  };

  const safeDateString = (value) => {
    if (!value) return "";
    const input = new Date(`${value}T00:00:00`);
    if (Number.isNaN(input.getTime())) return "";
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const parsed = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return "No due date";
    return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const announceStatus = (message) => {
    ui.statusMessage.textContent = message;
  };

  const isStorageAvailable = () => {
    try {
      const testKey = `${STORAGE_KEY}.healthcheck`;
      localStorage.setItem(testKey, "ok");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadTasks = () => {
    if (!isStorageAvailable()) {
      announceStatus("Storage is blocked. Open the app using http://localhost to enable saving.");
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        announceStatus("Saved data was invalid and has been reset.");
        return;
      }

      state.tasks = parsed
        .map((task) => {
          const title = sanitizeText(task.title, 100);
          if (!title) return null;

          const priority = ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium";
          const due = safeDateString(task.due);
          return {
            id: String(task.id || makeId()),
            title,
            notes: sanitizeText(task.notes, 240),
            priority,
            due,
            completed: Boolean(task.completed),
            createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now(),
            updatedAt: Number.isFinite(task.updatedAt) ? task.updatedAt : Date.now()
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Failed to load tasks", error);
      state.tasks = [];
      announceStatus("Could not read saved tasks. Starting with a clean list.");
    }
  };

  const persistTasks = () => {
    if (!isStorageAvailable()) {
      announceStatus("Storage is blocked. Tasks cannot be saved in this tab.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (error) {
      console.error("Failed to save tasks", error);
      announceStatus("Unable to save tasks. Check browser storage settings.");
    }
  };

  const getVisibleTasks = () => {
    const query = state.query.toLowerCase();

    return state.tasks
      .filter((task) => {
        if (state.filter === "active") return !task.completed;
        if (state.filter === "completed") return task.completed;
        return true;
      })
      .filter((task) => {
        if (!query) return true;
        return task.title.toLowerCase().includes(query) || task.notes.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (state.sortBy === "created-asc") return a.createdAt - b.createdAt;
        if (state.sortBy === "priority-desc") return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || b.createdAt - a.createdAt;
        if (state.sortBy === "due-asc") {
          const aDue = a.due ? new Date(`${a.due}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
          const bDue = b.due ? new Date(`${b.due}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
          return aDue - bDue || b.createdAt - a.createdAt;
        }
        return b.createdAt - a.createdAt;
      });
  };

  const renderStats = () => {
    const total = state.tasks.length;
    const done = state.tasks.filter((task) => task.completed).length;
    const active = total - done;
    ui.taskStats.textContent = `${active} active | ${done} completed | ${total} total`;
    ui.clearCompletedBtn.disabled = done === 0;
  };

  const renderTasks = () => {
    const tasks = getVisibleTasks();
    ui.taskList.innerHTML = "";

    tasks.forEach((task) => {
      const fragment = ui.taskTemplate.content.cloneNode(true);
      const item = fragment.querySelector(".task-item");
      const toggle = fragment.querySelector(".task-toggle");
      const title = fragment.querySelector(".task-title");
      const meta = fragment.querySelector(".task-meta");
      const notes = fragment.querySelector(".task-notes");
      const editBtn = fragment.querySelector(".btn-edit");
      const deleteBtn = fragment.querySelector(".btn-delete");

      item.dataset.id = task.id;
      title.textContent = task.title;
      notes.textContent = task.notes;
      toggle.checked = task.completed;
      meta.textContent = `Priority: ${task.priority.toUpperCase()} | Due: ${formatDate(task.due)}`;

      if (task.completed) {
        item.classList.add("is-completed");
      }

      toggle.addEventListener("change", () => {
        updateTask(task.id, { completed: toggle.checked });
        announceStatus(toggle.checked ? "Task marked complete." : "Task marked active.");
      });

      editBtn.addEventListener("click", () => {
        openEditDialog(task.id);
      });

      deleteBtn.addEventListener("click", () => {
        if (!window.confirm("Delete this task permanently?")) {
          return;
        }
        state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
        persistTasks();
        render();
        announceStatus("Task deleted.");
      });

      ui.taskList.appendChild(fragment);
    });

    ui.emptyState.hidden = tasks.length > 0;
    renderStats();
  };

  const renderFilters = () => {
    ui.filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === state.filter);
    });
  };

  const render = () => {
    renderFilters();
    renderTasks();
  };

  const updateTask = (taskId, changes) => {
    state.tasks = state.tasks.map((task) => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        ...changes,
        updatedAt: Date.now()
      };
    });
    persistTasks();
    render();
  };

  const validateTaskInput = (title, due) => {
    if (!title) {
      return "Task title is required.";
    }

    if (title.length < 3) {
      return "Use at least 3 characters for the task title.";
    }

    if (due && !safeDateString(due)) {
      return "Due date is invalid.";
    }

    return "";
  };

  const openEditDialog = (taskId) => {
    const task = state.tasks.find((entry) => entry.id === taskId);
    if (!task) {
      announceStatus("Task could not be found for editing.");
      return;
    }

    state.editingTaskId = taskId;
    ui.editTitle.value = task.title;
    ui.editPriority.value = task.priority;
    ui.editDue.value = task.due;
    ui.editNotes.value = task.notes;
    ui.editError.textContent = "";

    if (typeof ui.editDialog.showModal === "function") {
      ui.editDialog.showModal();
    } else {
      announceStatus("Edit dialog is not supported in this browser.");
    }
  };

  const closeEditDialog = () => {
    if (ui.editDialog.open) {
      ui.editDialog.close();
    }
    state.editingTaskId = null;
    ui.editError.textContent = "";
  };

  const bindEvents = () => {
    ui.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = sanitizeText(ui.titleInput.value, 100);
      const notes = sanitizeText(ui.notesInput.value, 240);
      const priority = ["low", "medium", "high"].includes(ui.priorityInput.value) ? ui.priorityInput.value : "medium";
      const due = safeDateString(ui.dueInput.value);

      const validationMessage = validateTaskInput(title, due);
      if (validationMessage) {
        ui.formError.textContent = validationMessage;
        return;
      }

      ui.formError.textContent = "";
      state.tasks.unshift({
        id: makeId(),
        title,
        notes,
        priority,
        due,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      persistTasks();
      ui.form.reset();
      ui.priorityInput.value = "medium";
      render();
      announceStatus("Task added successfully.");
    });

    ui.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        render();
      });
    });

    ui.searchInput.addEventListener("input", () => {
      state.query = sanitizeText(ui.searchInput.value, 100);
      renderTasks();
    });

    ui.sortSelect.addEventListener("change", () => {
      state.sortBy = ui.sortSelect.value;
      renderTasks();
    });

    ui.clearCompletedBtn.addEventListener("click", () => {
      const completedCount = state.tasks.filter((task) => task.completed).length;
      if (completedCount === 0) return;

      const confirmed = window.confirm(`Remove ${completedCount} completed task(s)?`);
      if (!confirmed) return;

      state.tasks = state.tasks.filter((task) => !task.completed);
      persistTasks();
      render();
      announceStatus("Completed tasks removed.");
    });

    ui.cancelEdit.addEventListener("click", () => {
      closeEditDialog();
    });

    ui.editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!state.editingTaskId) return;

      const title = sanitizeText(ui.editTitle.value, 100);
      const notes = sanitizeText(ui.editNotes.value, 240);
      const priority = ["low", "medium", "high"].includes(ui.editPriority.value) ? ui.editPriority.value : "medium";
      const due = safeDateString(ui.editDue.value);

      const validationMessage = validateTaskInput(title, due);
      if (validationMessage) {
        ui.editError.textContent = validationMessage;
        return;
      }

      ui.editError.textContent = "";
      updateTask(state.editingTaskId, { title, notes, priority, due });
      closeEditDialog();
      announceStatus("Task updated.");
    });

    ui.editDialog.addEventListener("cancel", () => {
      closeEditDialog();
    });
  };

  loadTasks();
  bindEvents();
  render();
})();
