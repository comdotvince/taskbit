const item = JSON.parse(localStorage.getItem("todoList")) || [];

const todoList = item;

renderTodoList();

console.log(item);

function renderTodoList() {
  let todoListHTML = "";

  item.forEach(function (todoObject, index) {
    const { name, dueDate, id } = todoObject;
    const html = `
      <div>${name}</div>
      <div>${dueDate}</div>
      <button onclick="
      todoList.splice(${index}, 1);
      renderTodoList();
      deleteItemStorage(${id});
      "class="delete-todo-button item-${id}" >Delete</button> 
    `;
    todoListHTML += html;
  });
  document.querySelector(".js-todo-list").innerHTML = todoListHTML;
}

function getTodo() {
  const inputElement = document.querySelector(".js-name-input");
  const name = inputElement.value;
  return [inputElement, name];
}

function addTodo() {
  const [inputElement, name] = getTodo();
  const dateInputElement = document.querySelector(".js-due-date-input");
  const dueDate = dateInputElement.value;

  const itemID = item.length;

  item.push({
    //name: name,
    //dueDate: dueDate,
    id: itemID,
    name,
    dueDate,
  });

  saveToStorage(item);

  inputElement.value = "";

  renderTodoList();
}

function deleteItemStorage(id) {
  let newItems = [];

  item.forEach(function (todo) {
    newItems.push(todo);
  });

  saveToStorage(newItems);
  console.log(newItems);
}

function saveToStorage(todoList) {
  localStorage.setItem("todoList", JSON.stringify(todoList));
}

document
  .getElementById("js-todo-input")
  .addEventListener("keypress", function (event) {
    const [inputElement, name] = getTodo();

    if (event.key === "Enter" && name != "") {
      addTodo();
    }
  });
