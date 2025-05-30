import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAuth } from "../api/auth.jsx";
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
  const [user, setUser] = useState(null); // null = guest, object = logged in
  const [localDataLoaded, setLocalDataLoaded] = useState(false);

  const navigate = useNavigate();

  // Load guest data from localStorage
  const loadGuestData = () => {
    const guestTodos = JSON.parse(localStorage.getItem("guestTodos")) || [];
    const guestHabits = JSON.parse(localStorage.getItem("guestHabits")) || [];
    setTodos(guestTodos);
    setHabits(guestHabits);
    setLocalDataLoaded(true);
  };

  // Save guest data to localStorage
  const saveGuestData = () => {
    localStorage.setItem("guestTodos", JSON.stringify(todos));
    localStorage.setItem("guestHabits", JSON.stringify(habits));
  };

  // Check authentication status
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // First load guest data for immediate UI
      loadGuestData();

      try {
        const authResult = await verifyAuth();

        if (authResult?.isAuthenticated === false || !authResult) {
          // Stay in guest mode
          setUser(null);
          console.log("Running in guest mode");
        } else {
          // Switch to authenticated mode
          setUser(authResult);
          try {
            const [todoRes, habitRes] = await Promise.all([
              api.get("/todos", { withCredentials: true }),
              api.get("/habits", { withCredentials: true }),
            ]);
            setTodos(todoRes.data);
            setHabits(habitRes.data);
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            // Stay with guest data if fetch fails
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        // Stay in guest mode
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, []);

  // Save guest data when it changes
  useEffect(() => {
    if (localDataLoaded && !user) {
      saveGuestData();
    }
  }, [todos, habits, localDataLoaded, user]);

  // Todo functions
  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!newTodo.trim()) return; // Don't proceed if empty
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      // Create the todo object
      const todoData = {
        _id: uuidv4(), // Generate a unique ID
        title: newTodo.trim(),
        isCompleted: false,
        user: user.id,
        // Add any other required fields from your backend
      };

      // Make POST request to your backend API
      const response = await api.post("/todos", todoData, {
        withCredentials: true,
      });

      // If successful, update the frontend state with the response data
      setTodos([
        ...todos,
        response.data, // Assuming your backend returns the created todo
      ]);

      setNewTodo(""); // Clear the input field
    } catch (error) {
      console.error("Error adding todo:", error);
      // Handle error (show error message to user, etc.)
    }
  };
  const handleToggleTodo = async (id) => {
    const originalTodos = [...todos];

    try {
      // Optimistic update
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        )
      );

      // Try both endpoint styles
      let response;
      try {
        // RESTful style
        response = await api.patch(
          `/todos/${id}`,
          { isCompleted: !originalTodos.find((t) => t._id === id).isCompleted },
          { withCredentials: true }
        );
      } catch (error) {
        console.error(
          "RESTful style failed, trying body parameter style:",
          error
        );
        // Fallback to body parameter style
        response = await api.patch(
          "/todos",
          {
            id: id,
            isCompleted: !originalTodos.find((t) => t._id === id).isCompleted,
          },
          { withCredentials: true }
        );
      }

      // Verify response
      if (!response.data || response.data._id !== id) {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Toggle failed:", error.response?.data || error.message);
      setTodos(originalTodos);

      alert(
        error.response?.data?.error === "Item not found"
          ? "Todo not found"
          : "Failed to update status"
      );
    }
  };

  const handleDeleteTodo = async (id) => {
    // Pop-up confirmation before deletion
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this todo?"
    );
    if (confirmDelete) {
      try {
        // OPTION 1: Standard RESTful approach (ID in URL)
        await api.delete("/todos", {
          data: { id },
          withCredentials: true,
        });

        // Update UI after successful deletion
        setTodos(todos.filter((todo) => todo._id !== id));
      } catch (error) {
        console.error("Error deleting todo:", error);
        // Handle error (show error message to user, etc.)
      }
    } else {
      return; // Exit if user cancels deletion
    }
  };

  // Habit functions
  const handleAddHabit = async (e) => {
    e.preventDefault();

    if (!newHabit.trim()) return; // Don't proceed if empty
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      // Create the habit object
      const habitData = {
        _id: uuidv4(), // Generate a unique ID
        title: newHabit.trim(),
        streak: 0,
        user: user.id,
        lastCompleted: null,
        history: {},
      };
      const response = await api.post("/habits", habitData, {
        withCredentials: true,
      });
      // Update the state with the new habit
      setHabits([...habits, response.data]);
      setNewHabit("");
    } catch (error) {
      console.error("Error adding habit:", error);
      // Handle error (show error message to user, etc.)
    }
  };

  const handleCompleteHabit = (id) => {
    const today = new Date().toISOString().split("T")[0];

    api
      .patch("/habits", { id, today }, { withCredentials: true })
      .then((response) => {
        console.log("Habit completed successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error completing habit:", error);
        // Handle error (show error message to user, etc.)
      });

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
  };

  const handleDeleteHabit = (id) => {
    // Pop-up confirmation before deletion
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this habit?"
    );
    if (confirmDelete) {
      setHabits(habits.filter((habit) => habit.id !== id));

      api
        .delete("/habits", {
          data: { id },
          withCredentials: true,
        })
        .then((response) => {
          console.log("Habit deleted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error deleting habit:", error);
          // Handle error (show error message to user, etc.)
        })
        .finally(() => {
          setHabits(habits.filter((habit) => habit._id !== id));
          console.log("Habit deleted successfully");
        });
    }
  };

  const handleGoToLandingpage = () => {
    navigate("/");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.isCompleted;
    if (filter === "active") return !todo.isCompleted;
    return true;
  });

  const remainingCount = todos.filter((todo) => !todo.isCompleted).length;

  return (
    <div className="todo-app-container">
      <header className="todo-header">
        <div className="container">
          <h1 onClick={handleGoToLandingpage} className="icon-name">
            Taskbit
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
                      const isCompletedToday = habit.history[today];

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

      <Sidebar openSidebar={sidebarOpen} setOpenSidebar={setSidebarOpen} />
    </div>
  );
};

export default TodoApp;
