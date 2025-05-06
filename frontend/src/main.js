const API_URL = import.meta.env.VITE_API_BASE_URL;
const todoList = document.querySelector(".js-todo-list");

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchTodos();
  document.querySelector(".add-todo-button").addEventListener("click", addTodo);
});

// Fetch todos from backend
async function fetchTodos() {
  try {
    const response = await fetch(`${API_URL}/api/todos`);
    if (!response.ok) throw new Error("Failed to fetch todos");

    const todos = await response.json();
    renderTodos(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    alert("Failed to load todos. Please try again.");
  }
}

// Render todos to the DOM
function renderTodos(todos) {
  todoList.innerHTML = ""; // Clear current todos

  todos.forEach((todo) => {
    const formattedDate = todo.dueDate.split("T")[0];
    const cleanedId = todo._id.replace(/\s+/g, ""); // Clean ID for HTML

    const isChecked = todo.isCompleted ? "checked" : "";

    todoList.insertAdjacentHTML(
      "beforeend",
      `
      <div class="todo-item todo-grid" data-id="${cleanedId}">
        <input type="checkbox" data-id="${cleanedId}" id="input-checkbox-${cleanedId}" ${isChecked} class="checkbox">
        <span class="todo-text nunito-todo-text" contenteditable="false" data-id="${cleanedId}">${todo.title}</span>
        <div class="todo-date">${formattedDate}</div>
        <button class="delete-todo-button">Delete</button>
      </div>
      `
    );

    const todoText = document.querySelector(
      `.todo-item[data-id="${cleanedId}"] .todo-text`
    );

    todoText.addEventListener("click", () => {
      todoText.setAttribute("contenteditable", "true");
      todoText.focus();
    });

    todoText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // prevent newline
        todoText.setAttribute("contenteditable", "false");
        updateTodo(cleanedId, { title: todoText.textContent });
      }
    });
  });

  // Add event listeners to all delete buttons
  document.querySelectorAll(".delete-todo-button").forEach((button) => {
    button.addEventListener("click", deleteTodo);
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches('input[type="checkbox"]')) {
      const id = event.target.dataset.id;
      const isCompleted = event.target.checked;

      console.log(
        `Checkbox with ID ${id} is ${isCompleted ? "checked" : "unchecked"}`
      );
      // Do your update logic here (e.g., update the todo status)
      updateTodo(id, { isCompleted: true });
      const element = document.querySelector(`[data-id="${id}"]`);
      if (isCompleted) {
        element.classList.add("line-through");
      } else {
        element.classList.remove("line-through");
      }
    }
  });
}

// Add new todo (now properly connected to backend)
async function addTodo() {
  const nameInput = document.querySelector(".js-name-input");
  const dueDateInput = document.querySelector(".js-due-date-input");

  const isCompleted = false;
  const title = nameInput.value;
  const dueDate = dueDateInput.value;

  if (!title) {
    alert("Please enter a todo name");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, dueDate, isCompleted }),
    });

    if (!response.ok) throw new Error("Failed to add todo");

    // Refresh the todo list from server
    await fetchTodos();

    // Clear inputs
    nameInput.value = "";
    dueDateInput.value = "";
  } catch (error) {
    console.error("Error adding todo:", error);
    alert("Failed to add todo. Please try again.");
  }
}

// Delete todo (now properly connected to backend)
async function deleteTodo(event) {
  const todoItem = event.target.closest(".todo-item");
  const id = todoItem.dataset.id;
  if (event.target.classList.contains("delete-todo-button")) {
    if (todoItem) {
      todoItem.remove(); // 💣 boom! Deleted.
      console.log(`Removed to-do with ID ${id}`);
    }
  } else {
    console.error("Delete button not found");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete todo");

    // Refresh the todo list from server
    await fetchTodos();
  } catch (error) {
    console.error("Error deleting todo:", error);
    alert("Failed to delete todo. Please try again.");
  }
}

async function updateTodo(id, updatedData) {
  try {
    const response = await fetch(`${API_URL}/api/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Failed to update todo");
  } catch (error) {
    console.error("Error updating todo:", error);
    alert("Update failed");
  }
}
