// src/pages/TodoApp.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TodoApp.css";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [habits, setHabits] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newHabit, setNewHabit] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        navigate("/login");
      } else {
        // Simulate loading data
        setTimeout(() => {
          setTodos([
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Build Todo App", completed: true },
            { id: 3, text: "Deploy to production", completed: false },
          ]);
          setHabits([
            {
              id: 1,
              name: "Drink water",
              streak: 3,
              lastCompleted: new Date(Date.now() - 86400000)
                .toISOString()
                .split("T")[0],
              history: {
                [new Date(Date.now() - 2 * 86400000)
                  .toISOString()
                  .split("T")[0]]: true,
                [new Date(Date.now() - 86400000)
                  .toISOString()
                  .split("T")[0]]: true,
                [new Date().toISOString().split("T")[0]]: true,
              },
            },
            {
              id: 2,
              name: "Exercise",
              streak: 0,
              lastCompleted: null,
              history: {},
            },
          ]);
          setIsLoading(false);
        }, 1000);
      }
    };
    checkAuth();
  }, [navigate]);

  // Todo functions
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo.trim(),
          completed: false,
        },
      ]);
      setNewTodo("");
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Habit functions
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (newHabit.trim()) {
      setHabits([
        ...habits,
        {
          id: Date.now(),
          name: newHabit.trim(),
          streak: 0,
          lastCompleted: null,
          history: {},
        },
      ]);
      setNewHabit("");
    }
  };

  const handleCompleteHabit = (id) => {
    const today = new Date().toISOString().split("T")[0];
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0];
          const isConsecutive = habit.lastCompleted === yesterday;

          return {
            ...habit,
            streak: isConsecutive ? habit.streak + 1 : 1,
            lastCompleted: today,
            history: {
              ...habit.history,
              [today]: true,
            },
          };
        }
        return habit;
      })
    );
  };

  const handleDeleteHabit = (id) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "active") return !todo.completed;
    return true;
  });

  const remainingCount = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="todo-app-container">
      <header className="todo-header">
        <div className="container">
          <h1>Taskbit</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="todo-main">
        <div className="container">
          <div className="tab-buttons">
            <button
              onClick={() => setActiveTab("todos")}
              className={activeTab === "todos" ? "active" : ""}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab("habits")}
              className={activeTab === "habits" ? "active" : ""}
            >
              Habits
            </button>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Loading your data...</div>
          ) : activeTab === "todos" ? (
            <>
              <form onSubmit={handleAddTodo} className="todo-form">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done?"
                  className="todo-input"
                />
                <button type="submit" className="add-button">
                  Add Task
                </button>
              </form>

              <div className="todo-filters">
                <button
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "active" : ""}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={filter === "active" ? "active" : ""}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={filter === "completed" ? "active" : ""}
                >
                  Completed
                </button>
              </div>

              <div className="todo-stats">
                {remainingCount} {remainingCount === 1 ? "task" : "tasks"} left
              </div>

              <ul className="todo-list">
                {filteredTodos.length === 0 ? (
                  <li className="empty-message">
                    {filter === "all"
                      ? "No tasks yet. Add one above!"
                      : filter === "completed"
                      ? "No completed tasks"
                      : "No active tasks"}
                  </li>
                ) : (
                  filteredTodos.map((todo) => (
                    <li key={todo.id} className="todo-item">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id)}
                        className="todo-checkbox"
                      />
                      <span
                        className={`todo-text ${
                          todo.completed ? "completed" : ""
                        }`}
                      >
                        {todo.text}
                      </span>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="delete-button"
                      >
                        ×
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <>
              <form onSubmit={handleAddHabit} className="habit-form">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Add a new habit"
                  className="habit-input"
                />
                <button type="submit" className="add-button">
                  Add Habit
                </button>
              </form>

              <div className="habits-container">
                {habits.length === 0 ? (
                  <div className="empty-message">
                    No habits yet. Add one above!
                  </div>
                ) : (
                  <ul className="habits-list">
                    {habits.map((habit) => {
                      const today = new Date().toISOString().split("T")[0];
                      const isCompletedToday = habit.history[today];

                      return (
                        <li key={habit.id} className="habit-item">
                          <div className="habit-info">
                            <span className="habit-name">{habit.name}</span>
                            <span className="habit-streak">
                              🔥 {habit.streak} day streak
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              !isCompletedToday && handleCompleteHabit(habit.id)
                            }
                            className={`habit-complete-button ${
                              isCompletedToday ? "completed" : ""
                            }`}
                            disabled={isCompletedToday}
                          >
                            {isCompletedToday
                              ? "✓ Done today"
                              : "Complete today"}
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="delete-button"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TodoApp;
