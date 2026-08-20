(() => {
  const STORAGE_KEY = "todos.v1";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const itemsLeft = document.getElementById("items-left");
  const emptyState = document.getElementById("empty-state");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let todos = loadTodos();
  let currentFilter = "all";

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.unshift({ id: uid(), text: trimmed, completed: false });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function editTodo(id, newText) {
    const trimmed = newText.trim();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    todo.text = trimmed;
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function getFilteredTodos() {
    if (currentFilter === "active") return todos.filter((t) => !t.completed);
    if (currentFilter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  function render() {
    const filtered = getFilteredTodos();
    list.innerHTML = "";

    filtered.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", "完了にする");
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const label = document.createElement("span");
      label.className = "label";
      label.textContent = todo.text;
      label.contentEditable = "true";
      label.spellcheck = false;
      label.addEventListener("blur", () => editTodo(todo.id, label.textContent));
      label.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          label.blur();
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "&times;";
      deleteBtn.setAttribute("aria-label", "削除");
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.append(checkbox, label, deleteBtn);
      list.appendChild(li);
    });

    emptyState.hidden = filtered.length !== 0;

    const activeCount = todos.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${activeCount}件残り`;

    const hasCompleted = todos.some((t) => t.completed);
    clearCompletedBtn.hidden = !hasCompleted;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      render();
    });
  });

  render();
})();
