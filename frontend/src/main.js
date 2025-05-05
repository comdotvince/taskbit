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
    console.log(todo._id);
    todoList.insertAdjacentHTML(
      "beforeend",
      `
      <div class="todo-item todo-grid" data-id="${cleanedId}">
        <div>${todo.title}</div>
        <div>${formattedDate}</div>
        <button class="delete-todo-button">Delete</button>
      </div>
      `
    );
  });

  // Add event listeners to all delete buttons
  document.querySelectorAll(".delete-todo-button").forEach((button) => {
    button.addEventListener("click", deleteTodo);
  });
}

// Add new todo (now properly connected to backend)
async function addTodo() {
  const nameInput = document.querySelector(".js-name-input");
  const dueDateInput = document.querySelector(".js-due-date-input");

  const title = nameInput.value;
  const dueDate = dueDateInput.value;

  if (!title) {
    alert("Please enter a todo name");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/todos/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, dueDate }),
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
    const response = await fetch(`${API_URL}/api/todos/delete/${id}`, {
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
