import { useState, useEffect } from "react";
import api from "../api/axios.jsx";
import "./TodoApp.css";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import { v4 as uuidv4 } from "uuid";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [habits, setHabits] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newHabit, setNewHabit] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "todos";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [localDataLoaded, setLocalDataLoaded] = useState(false);

  // Load guest data from localStorage
  const loadGuestData = () => {
    const guestTodos = JSON.parse(localStorage.getItem("guestTodos")) || [];
    const guestHabits = JSON.parse(localStorage.getItem("guestHabits")) || [];
    setTodos(guestTodos);
    setHabits(guestHabits);
    setLocalDataLoaded(true);
    console.log("Loaded guest data:", {
      todos: guestTodos.length,
      habits: guestHabits.length,
    });
  };

  // Save guest data to localStorage
  const saveGuestData = () => {
    if (!user) {
      // Only save to localStorage when in guest mode
      localStorage.setItem("guestTodos", JSON.stringify(todos));
      localStorage.setItem("guestHabits", JSON.stringify(habits));
      console.log("Saved guest data to localStorage");
    }
  };

  // Check if user is logged in and load data
  useEffect(() => {
    const checkUserAndLoadData = async () => {
      // Always start with guest data for immediate UI
      loadGuestData();

      // Check if user is stored in localStorage (simple logged-in check)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log("User found in localStorage:", userData.name);

          // Try to fetch user's backend data
          try {
            const [todoRes, habitRes] = await Promise.all([
              api.get("/todos", { withCredentials: true }),
              api.get("/habits", { withCredentials: true }),
            ]);

            // Use backend data if available
            setTodos(todoRes.data);
            setHabits(habitRes.data);
            console.log("Loaded backend data for authenticated user");
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            // If backend fails, keep guest data
          }
        } catch (error) {
          console.error("Invalid user data in localStorage:", error);
          localStorage.removeItem("user");
        }
      } else {
        // Stay in guest mode
        setUser(null);
        console.log("Running in guest mode");
      }

      setIsLoading(false);
    };

    checkUserAndLoadData();
  }, []);

  // Save guest data when it changes (only in guest mode)
  useEffect(() => {
    if (localDataLoaded && !user) {
      saveGuestData();
    }
  }, [todos, habits, localDataLoaded, user]);

  // Guest mode todo functions
  const handleAddTodoGuest = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const newTodoItem = {
      _id: uuidv4(),
      title: newTodo.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodoItem]);
    setNewTodo("");
  };

  // Authenticated mode todo functions
  const handleAddTodoAuth = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todoData = {
        title: newTodo.trim(),
        isCompleted: false,
        user: user.id,
      };

      const response = await api.post("/todos", todoData, {
        withCredentials: true,
      });

      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Combined add todo function
  const handleAddTodo = user ? handleAddTodoAuth : handleAddTodoGuest;

  const handleToggleTodo = async (id) => {
    if (!user) {
      // Guest mode
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        )
      );
      return;
    }

    // Authenticated mode
    const originalTodos = [...todos];
    try {
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        )
      );

      let response;
      try {
        response = await api.patch(
          `/todos/${id}`,
          { isCompleted: !originalTodos.find((t) => t._id === id).isCompleted },
          { withCredentials: true }
        );
      } catch (error) {
        // Fallback to patching by sending the entire todo object
        console.warn("Patch by ID failed, falling back to full update:", error);
        response = await api.patch(
          "/todos",
          {
            id: id,
            isCompleted: !originalTodos.find((t) => t._id === id).isCompleted,
          },
          { withCredentials: true }
        );
      }

      if (!response.data || response.data._id !== id) {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Toggle failed:", error.response?.data || error.message);
      setTodos(originalTodos);
      alert("Failed to update status");
    }
  };

  const handleDeleteTodo = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this todo?"
    );
    if (!confirmDelete) return;

    if (!user) {
      // Guest mode
      setTodos(todos.filter((todo) => todo._id !== id));
      return;
    }

    // Authenticated mode
    try {
      await api.delete("/todos", {
        data: { id },
        withCredentials: true,
      });
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Guest mode habit functions
  const handleAddHabitGuest = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const newHabitItem = {
      _id: uuidv4(),
      title: newHabit.trim(),
      streak: 0,
      lastCompleted: null,
      history: {},
      createdAt: new Date().toISOString(),
    };

    setHabits([...habits, newHabitItem]);
    setNewHabit("");
  };

  // Authenticated mode habit functions
  const handleAddHabitAuth = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const habitData = {
        title: newHabit.trim(),
        streak: 0,
        user: user.id,
        lastCompleted: null,
        history: {},
      };
      const response = await api.post("/habits", habitData, {
        withCredentials: true,
      });
      setHabits([...habits, response.data]);
      setNewHabit("");
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  // Combined add habit function
  const handleAddHabit = user ? handleAddHabitAuth : handleAddHabitGuest;

  const handleCompleteHabit = async (id) => {
    const today = new Date().toISOString().split("T")[0];

    if (!user) {
      // Guest mode
      setHabits(
        habits.map((habit) => {
          if (habit._id === id) {
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
      return;
    }

    // Authenticated mode
    try {
      await api.patch("/habits", { id, today }, { withCredentials: true });

      setHabits(
        habits.map((habit) => {
          if (habit._id === id) {
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
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleDeleteHabit = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this habit?"
    );
    if (!confirmDelete) return;

    if (!user) {
      // Guest mode
      setHabits(habits.filter((habit) => habit._id !== id));
      return;
    }

    // Authenticated mode
    try {
      await api.delete("/habits", {
        data: { id },
        withCredentials: true,
      });
      setHabits(habits.filter((habit) => habit._id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.isCompleted;
    if (filter === "active") return !todo.isCompleted;
    return true;
  });

  const remainingCount = todos.filter((todo) => !todo.isCompleted).length;

  // In TodoApp.jsx, add this function after your existing functions:

  const refreshUserState = async () => {
    console.log("Refreshing user state...");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("Setting user data:", userData);
        setUser(userData);

        // Update the header immediately to show logged-in state
        console.log("User refreshed:", userData.name);

        // Fetch user's backend data
        try {
          console.log("Fetching backend data for user:", userData.id);
          const [todoRes, habitRes] = await Promise.all([
            api.get("/todos", { withCredentials: true }),
            api.get("/habits", { withCredentials: true }),
          ]);

          console.log("Backend todos:", todoRes.data);
          console.log("Backend habits:", habitRes.data);

          // Use backend data, or fall back to empty arrays if no data
          setTodos(todoRes.data || []);
          setHabits(habitRes.data || []);
          console.log("Loaded backend data after login");
        } catch (error) {
          console.error("Failed to fetch user data after login:", error);

          // If backend fails, start with empty arrays for authenticated user
          console.log(
            "Backend failed, starting with empty data for authenticated user"
          );
          setTodos([]);
          setHabits([]);
        }
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      console.log("No user found in localStorage, staying in guest mode");
      setUser(null);
    }
  };

  // Update the useEffect to listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log("Storage change detected:", e.key, e.newValue);
      if (e.key === "user") {
        refreshUserState();
      }
    };

    // Also listen for custom events (for same-tab changes)
    const handleUserLogin = () => {
      console.log("User login event received");
      refreshUserState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLogin", handleUserLogin);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, []);

  return (
    <div className="todo-app-container">
      <header className="todo-header">
        <div className="container">
          <h1 className="icon-name">
            Taskbit {!user && <span className="guest-badge">(Guest Mode)</span>}
          </h1>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="profile-icon profile-toggle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              fill="#4f46e5"
              className="bi bi-person-circle"
              viewBox="0 0 16 16"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path
                fillRule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="todo-main">
        <div className="container">
          <div className="tab-buttons">
            <button
              onClick={() => {
                setActiveTab("todos");
                localStorage.setItem("activeTab", "todos");
              }}
              className={activeTab === "todos" ? "active" : ""}
            >
              Todos
            </button>
            <button
              onClick={() => {
                setActiveTab("habits");
                localStorage.setItem("activeTab", "habits");
              }}
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
                    <li key={todo._id} className="todo-item">
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={() => handleToggleTodo(todo._id)}
                        className="todo-checkbox"
                      />
                      <span
                        className={`todo-text ${
                          todo.isCompleted ? "completed" : ""
                        }`}
                      >
                        {todo.title}
                      </span>
                      <button
                        onClick={() => handleDeleteTodo(todo._id)}
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
                      const isCompletedToday =
                        habit.history && habit.history[today];

                      return (
                        <li key={habit._id} className="habit-item">
                          <div className="habit-info">
                            <span className="habit-name">{habit.title}</span>
                            <span className="habit-streak">
                              🔥 {habit.streak} day streak
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              !isCompletedToday &&
                              handleCompleteHabit(habit._id)
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
                            onClick={() => handleDeleteHabit(habit._id)}
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

      <Sidebar
        openSidebar={sidebarOpen}
        setOpenSidebar={setSidebarOpen}
        user={user}
        setUser={setUser}
      />
    </div>
  );
};

export default TodoApp;
