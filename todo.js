const backendUrl = "http://localhost:5000";

async function renderTodoList() {
  try {
    const response = await fetch(`${backendUrl}/api/todos`);
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    const todos = await response.json();
    let todoListHTML = "";

    todos.forEach((todo) => {
      const { name, dueDate, _id } = todo;
      const html = `
        <div>${name}</div>
        <div>${dueDate}</div>
        <button onclick="deleteTodo('${_id}')" class="delete-todo-button item-${_id}">Delete</button>
      `;
      todoListHTML += html;
    });

    document.querySelector(".js-todo-list").innerHTML = todoListHTML;
  } catch (error) {
    console.error("Error rendering todo list:", error);
  }
}

async function addTodo() {
  const inputElement = document.querySelector(".js-name-input");
  const name = inputElement.value;

  const dateInputElement = document.querySelector(".js-due-date-input");
  const dueDate = dateInputElement.value;

  try {
    const response = await fetch(`${backendUrl}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, dueDate }),
    });

    if (!response.ok) {
      throw new Error("Failed to add todo");
    }

    inputElement.value = "";
    renderTodoList();
  } catch (error) {
    console.error("Error adding todo:", error);
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`${backendUrl}/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }

    renderTodoList();
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTodoList();
});
