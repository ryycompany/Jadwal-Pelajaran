function initTodoList() {
  const todoInput = document.getElementById('todo-input');
  const addTodoBtn = document.getElementById('add-todo-btn');
  const todoList = document.getElementById('todo-list');
  
  // 🚨 Cegah error kalau ada elemen yang tidak ditemukan
  if (!todoInput || !addTodoBtn || !todoList) {
    console.warn('Todo List: Elemen input atau list tidak ditemukan. Inisialisasi dibatalkan.');
    return;
  }
  
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  
  function renderTodos() {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'todo-item';
      emptyMessage.textContent = 'Tidak ada tugas. Tambahkan tugas baru!';
      todoList.appendChild(emptyMessage);
      return;
    }
    
    todos.forEach((todo, index) => {
      const todoItem = document.createElement('div');
      todoItem.className = 'todo-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => {
        toggleTodoComplete(index);
      });
      
      const todoText = document.createElement('span');
      todoText.className = 'todo-text';
      todoText.textContent = todo.text;
      if (todo.completed) {
        todoText.classList.add('completed');
      }
      
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'todo-delete';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.addEventListener('click', () => {
        deleteTodo(index);
      });
      
      todoItem.appendChild(checkbox);
      todoItem.appendChild(todoText);
      todoItem.appendChild(deleteBtn);
      
      todoList.appendChild(todoItem);
    });
  }
  
  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    todos.unshift({
      text,
      completed: false,
      createdAt: new Date().toISOString()
    });
    
    saveTodos();
    todoInput.value = '';
    renderTodos();
  }
  
  function toggleTodoComplete(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
  }
  
  function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
  }
  
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
  
  addTodoBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
  
  renderTodos();
}