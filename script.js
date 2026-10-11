let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentView = "inbox";

const emptyState = document.getElementById("emptyState");
const clearCompleted = document.getElementById("clearCompleted");
const taskCount = document.getElementById("taskCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const filterAll = document.getElementById("filterAll");
const filterActive = document.getElementById("filterActive");
const filterCompleted = document.getElementById("filterCompleted");

const searchInput = document.getElementById("searchInput");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

let currentFilter = "all";

// Add a task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskText = taskInput.value.trim();

  if (taskText === "") {
    return;
  }

  const task = {
    id: Date.now() + Math.random(),
    text: taskText,
    completed: false,
    priority: taskPriority.value,
    dueDate: taskDueDate.value,
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskPriority.value = "medium";
  taskDueDate.value = "";
  taskForm.classList.remove("open");
});

// Save tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display tasks
function renderTasks() {
  taskList.innerHTML = "";

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  taskCount.textContent = tasks.length + " tasks";
  activeCount.textContent = activeTasks.length;
  completedCount.textContent = completedTasks.length;

  const searchText = searchInput.value.toLowerCase();
  let visibleTaskCount = 0;

  tasks
    .filter(function (task) {
      const matchesSearch = task.text.toLowerCase().includes(searchText);

      const today = new Date().toLocaleDateString("en-CA");

      const matchesFilter =
        (currentFilter === "all" ||
          (currentFilter === "active" && !task.completed) ||
          (currentFilter === "completed" && task.completed)) &&
        (currentView === "inbox" ||
          (currentView === "today" && task.dueDate === today) ||
          (currentView === "upcoming" && task.dueDate > today));

      return matchesSearch && matchesFilter;
    })
    .forEach(function (task) {
      visibleTaskCount++;

      const taskItem = document.createElement("li");
      taskItem.className = "list-group-item d-flex align-items-center gap-2";

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input";
      checkbox.checked = task.completed;

      // Task text
      const taskLabel = document.createElement("span");
      taskLabel.textContent = task.text;

      if (task.completed) {
        taskLabel.classList.add(
          "text-decoration-line-through",
          "text-secondary",
        );
      }

      // Priority and due date

      const taskDetails = document.createElement("small");
      taskDetails.className = "text-secondary";

      const priorityLabel = document.createElement("span");
      priorityLabel.className = "priority-label priority-" + task.priority;

      priorityLabel.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

      taskDetails.appendChild(priorityLabel);

      if (task.dueDate) {
        taskDetails.appendChild(
          document.createTextNode(" • Due: " + task.dueDate),
        );
      }

      // Group task text and details
      const taskContent = document.createElement("div");
      taskContent.className = "d-flex flex-column";

      taskContent.appendChild(taskLabel);
      taskContent.appendChild(taskDetails);

      // Save completion status
      checkbox.addEventListener("change", function () {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      // Edit button

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "btn btn-sm btn-outline-danger";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", function () {
        tasks = tasks.filter(function (item) {
          return item.id !== task.id;
        });

        saveTasks();
        renderTasks();
      });

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "btn btn-sm btn-outline-secondary ms-auto";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", function () {
        const updatedText = prompt("Edit your task:", task.text);

        if (updatedText === null) {
          return;
        }

        const cleanedText = updatedText.trim();

        if (cleanedText === "") {
          return;
        }

        task.text = cleanedText;
        saveTasks();
        renderTasks();
      });

      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskContent);
      taskItem.appendChild(editButton);
      taskItem.appendChild(deleteButton);
      taskList.appendChild(taskItem);
    });

  // Empty state
  if (visibleTaskCount === 0) {
    emptyState.textContent =
      tasks.length === 0
        ? "No tasks yet. Add your first task to get started!"
        : "No matching tasks found.";

    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}

// Search
searchInput.addEventListener("input", renderTasks);

// Filters
filterAll.addEventListener("click", function () {
  currentFilter = "all";
  renderTasks();
});

filterActive.addEventListener("click", function () {
  currentFilter = "active";
  renderTasks();
});

filterCompleted.addEventListener("click", function () {
  currentFilter = "completed";
  renderTasks();
});

// Clear completed tasks
clearCompleted.addEventListener("click", function () {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

// Initial display
renderTasks();

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", function () {
  sidebar.classList.toggle("collapsed");

  const isCollapsed = sidebar.classList.contains("collapsed");

  sidebarToggle.setAttribute(
    "aria-label",
    isCollapsed ? "Expand sidebar" : "Collapse sidebar",
  );

  sidebarToggle.setAttribute(
    "title",
    isCollapsed ? "Expand sidebar" : "Collapse sidebar",
  );
});

const openAddTask = document.getElementById("openAddTask");

openAddTask.addEventListener("click", function () {
  taskForm.classList.toggle("open");

  if (taskForm.classList.contains("open")) {
    taskInput.focus();
  }
});

const openSearch = document.getElementById("openSearch");
const workspaceSearch = document.getElementById("workspaceSearch");

function focusSearch() {
  sidebar.classList.remove("collapsed");
  searchInput.focus();
}

openSearch.addEventListener("click", focusSearch);
workspaceSearch.addEventListener("click", focusSearch);

const navInbox = document.getElementById("navInbox");
const navToday = document.getElementById("navToday");
const navUpcoming = document.getElementById("navUpcoming");
const pageTitle = document.getElementById("pageTitle");

function setView(view, title) {
  currentView = view;
  pageTitle.textContent = title;

  document.querySelectorAll(".nav-item").forEach(function (button) {
    button.classList.remove("active");
  });

  const activeButton = {
    inbox: navInbox,
    today: navToday,
    upcoming: navUpcoming,
  }[view];

  activeButton.classList.add("active");
  renderTasks();
}

navInbox.addEventListener("click", function () {
  setView("inbox", "Inbox");
});

navToday.addEventListener("click", function () {
  setView("today", "Today");
});

navUpcoming.addEventListener("click", function () {
  setView("upcoming", "Upcoming");
});

const cancelTask = document.getElementById("cancelTask");

cancelTask.addEventListener("click", function () {
  taskForm.reset();
  taskForm.classList.remove("open");
});
