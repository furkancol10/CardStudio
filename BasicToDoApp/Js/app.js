const addButton = document.getElementById("todo-add-button");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-items");

console.log("Buton:", addButton);
console.log("Input:", input);
console.log("Liste:", list);

let todos = [];
function saveTodosToLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodosFromLocalStorage() {
    const stored = localStorage.getItem("todos");
    if (stored) {
        todos = JSON.parse(stored);

        list.innerHTML = "";

        todos.forEach(function (todo) {
            const li = createToDoItemElement(todo);
            list.appendChild(li);
        })
    }
}

function createToDoItemElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;

    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            li.classList.add("completed");
        } else {
            li.classList.remove("completed");
        }

        const id = Number(li.dataset.id);
        const item = todos.find(t => t.id === id);
        if (item) {
            item.completed = checkbox.checked;
            saveTodosToLocalStorage();
        }
    });

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "todo-delete-button";
    deleteButton.textContent = "Sil";

    deleteButton.addEventListener("click", function () {
        li.remove();

        const id = Number(li.dataset.id);
        todos = todos.filter(t => t.id !== id);
        saveTodosToLocalStorage();
    })

    if (todo.completed) {
        li.classList.add("completed");
    }

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);

    return li;
}

function addToDoFromInput() {
    const text = input.value.trim();

    if (text === "") {
        console.log("Boş görev eklenemez.");
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    saveTodosToLocalStorage();

    const li = createToDoItemElement(todo);
    list.appendChild(li);

    input.value = "";
    input.focus();
}

addButton.addEventListener("click", addToDoFromInput);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addToDoFromInput();
    }
});

loadTodosFromLocalStorage();