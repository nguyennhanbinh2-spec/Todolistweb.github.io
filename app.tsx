import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const ToDoApp: React.FC = () => {
  // --- helper: create 3 default tasks per day ---
  const createDefaultWeekTasks = (): Task[][] =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const base = Date.now() + dayIndex * 1000;
      return [
        { id: base + 1, text: "Task", completed: false },
        { id: base + 2, text: "Task", completed: false },
        { id: base + 3, text: "Task", completed: false },
      ];
    });

  // --- username (persist) ---
  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem("username");
    } catch {
      return null;
    }
  });
  const [loginUsername, setLoginUsername] = useState("");

  // --- weekTasks: if localStorage exists, use it; else create defaults (3 tasks/day) ---
  const [weekTasks, setWeekTasks] = useState<Task[][]>(() => {
    try {
      const raw = localStorage.getItem("weekTasks");
      return raw ? JSON.parse(raw) : createDefaultWeekTasks();
    } catch {
      return createDefaultWeekTasks();
    }
  });

  // selectedDayIndex: used to add tasks / show task list; default 0
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [newTaskText, setNewTaskText] = useState("");
  // hoveredDayIndex: when user hovers a day card -> adjust graph highlight and show Done summary
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // --- edit state for customizing task text ---
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  // persist username
  useEffect(() => {
    try {
      if (username) localStorage.setItem("username", username);
      else localStorage.removeItem("username");
    } catch {
      // ignore storage errors
    }
  }, [username]);

  // persist weekTasks (original logic preserved)
  useEffect(() => {
    try {
      localStorage.setItem("weekTasks", JSON.stringify(weekTasks));
    } catch {
      // ignore
    }
  }, [weekTasks]);

  // Add a task to selectedDayIndex (logic preserved)
  const addTask = () => {
    if (newTaskText.trim() === "") return;
    const newTasks = [...weekTasks];
    if (newTasks[selectedDayIndex].length >= 20) {
      alert("Maximum 20 tasks per day allowed.");
      return;
    }
    newTasks[selectedDayIndex] = [
      ...newTasks[selectedDayIndex],
      { id: Date.now(), text: newTaskText, completed: false },
    ];
    setWeekTasks(newTasks);
    setNewTaskText("");
  };

  // Toggle completion (logic preserved)
  const toggleTaskCompletion = (dayIndex: number, taskId: number) => {
    const newTasks = [...weekTasks];
    newTasks[dayIndex] = newTasks[dayIndex].map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setWeekTasks(newTasks);
  };

  // Delete single task (kept as useful utility; doesn't change other logic)
  const deleteTask = (dayIndex: number, taskId: number) => {
    const newTasks = [...weekTasks];
    newTasks[dayIndex] = newTasks[dayIndex].filter((t) => t.id !== taskId);
    setWeekTasks(newTasks);
  };

  // Clear all tasks for a day (kept)
  const clearDayTasks = (dayIndex: number) => {
    if (!window.confirm("Clear all tasks for this day? This cannot be undone."))
      return;
    const newTasks = [...weekTasks];
    newTasks[dayIndex] = [];
    setWeekTasks(newTasks);
  };

  // Edit task text (customize)
  const startEditTask = (
    dayIndex: number,
    taskId: number,
    currentText: string
  ) => {
    setEditingTaskId(taskId);
    setEditingText(currentText);
    // keep selected day so user can see context
    setSelectedDayIndex(dayIndex);
  };

  const saveEditTask = (dayIndex: number, taskId: number) => {
    if (editingText.trim() === "") {
      alert("Task text cannot be empty.");
      return;
    }
    const newTasks = [...weekTasks];
    newTasks[dayIndex] = newTasks[dayIndex].map((t) =>
      t.id === taskId ? { ...t, text: editingText } : t
    );
    setWeekTasks(newTasks);
    setEditingTaskId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  // --- DAYS OF WEEK: user requested fixed Mon..Sun order ---
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // compute date strings for the 7-day window starting from today
  const weekDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toLocaleDateString(); // local format
    });
  }, []);

  // compute done counts per day from weekTasks (always derived; no separate graphData state)
  const doneCounts = useMemo(
    () => weekTasks.map((day) => day.filter((t) => t.completed).length),
    [weekTasks]
  );

  // Prepare recharts data (one point per day)
  const chartData = weekDates.map((dateStr, idx) => ({
    date: dateStr,
    done_count: doneCounts[idx] ?? 0,
    idx,
  }));

  // login / logout
  const handleLogin = () => {
    if (loginUsername.trim() !== "") {
      setUsername(loginUsername.trim());
      setLoginUsername("");
    }
  };
  const handleLogout = () => {
    setUsername(null);
  };

  // quick keyboard: Enter on new task
  const onNewTaskKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTask();
  };

  // UI styles - neon dark
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 10% 10%, rgba(0,150,255,0.06), transparent 8%), radial-gradient(circle at 90% 30%, rgba(255,0,150,0.05), transparent 10%), linear-gradient(180deg, #07070a 0%, #0c0d12 100%)",
    color: "#e9f2ff",
    padding: 24,
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  };

  const dayCardStyle: React.CSSProperties = {
    minWidth: 300,
    maxWidth: 300,
    padding: 14,
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.04)",
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
    color: "white",
  };

  const neonButtonStyle = (from = "#00f0ff", to = "#7bff9a") => ({
    background: `linear-gradient(90deg, ${from}, ${to})`,
    border: "none",
    color: "#052022",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  });

  if (!username) {
    return (
      <div style={pageStyle} className="flex items-center justify-center">
        <style>{`
          .neon-input::placeholder { color: rgba(255,255,255,0.4); }
        `}</style>
        <div
          style={{
            width: 520,
            padding: 22,
            borderRadius: 12,
            background: "rgba(10,12,18,0.6)",
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "0 12px 40px rgba(2,6,23,0.7)",
          }}
        >
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Login</h1>
          <p style={{ marginBottom: 14, color: "rgba(255,255,255,0.8)" }}>
            Enter a username to open your local weekly tasks (stored only in
            this browser).
          </p>
          <input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Username"
            className="neon-input"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.02)",
              color: "white",
              marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={handleLogin}
              style={neonButtonStyle("#7bff9a", "#00c3ff")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* horizontal scroll: hide scrollbar but still scroll */
        .days-row {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .days-row::-webkit-scrollbar { height: 8px; }
        .days-row::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 8px; }
        .day-card:hover { transform: translateY(-6px); transition: transform 160ms ease; }
        .task-line { transition: background 120ms; }
      `}</style>

      <div style={pageStyle}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
                Weekly To-Do
              </h1>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                Hover a day to see completed tasks; click a day to edit/add
                tasks.
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                }}
              >
                <strong style={{ marginRight: 8 }}>{username}</strong>
                <button
                  onClick={handleLogout}
                  style={{
                    ...neonButtonStyle("#ff7eb6", "#ff3cac"),
                    padding: "6px 10px",
                    fontSize: 13,
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* DAYS ROW (horizontal long) */}
          <div className="days-row" style={{ marginBottom: 18 }}>
            {weekDates.map((dateStr, idx) => {
              const tasks = weekTasks[idx] || [];
              const done = doneCounts[idx] ?? 0;
              return (
                <div
                  key={idx}
                  className="day-card"
                  style={{
                    ...dayCardStyle,
                    minWidth: 320,
                    border:
                      selectedDayIndex === idx
                        ? "1px solid rgba(123,255,154,0.35)"
                        : dayCardStyle.border,
                    boxShadow:
                      hoveredDayIndex === idx
                        ? "0 12px 40px rgba(0,195,255,0.08)"
                        : dayCardStyle.boxShadow,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                  onClick={() => setSelectedDayIndex(idx)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>
                        {daysOfWeek[idx]}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                      >
                        {dateStr}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      Done: <strong>{done}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {tasks.map((task) => (
                      <label
                        key={task.id}
                        className="task-line"
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          padding: "8px 10px",
                          borderRadius: 8,
                          marginBottom: 8,
                          background: task.completed
                            ? "linear-gradient(90deg, rgba(123,255,154,0.06), rgba(0,195,255,0.04))"
                            : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            // preserve logic: toggle at dayIndex level
                            toggleTaskCompletion(idx, task.id);
                          }}
                          style={{ width: 18, height: 18 }}
                          onClick={(ev) => ev.stopPropagation()}
                        />
                        <div
                          style={{
                            color: task.completed
                              ? "rgba(255,255,255,0.7)"
                              : "white",
                            textDecoration: task.completed
                              ? "line-through"
                              : "none",
                            flex: 1,
                            fontSize: 14,
                          }}
                        >
                          {task.text}
                        </div>

                        {/* edit in-place (opens edit controls in the selected-day area for clarity) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditTask(idx, task.id, task.text);
                          }}
                          title="Edit task"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 6,
                            fontSize: 14,
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          ✏️
                        </button>

                        {/* delete button kept as helper */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(idx, task.id);
                          }}
                          title="Delete task"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 6,
                            fontSize: 14,
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          🗑
                        </button>
                      </label>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayIndex(idx);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.04)",
                        background: "transparent",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Open
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // quick add a placeholder task (keeps original addTask logic separate)
                        const text = "Task";
                        const newTasks = [...weekTasks];
                        if (newTasks[idx].length >= 20) {
                          alert("Maximum 20 tasks per day allowed.");
                          return;
                        }
                        newTasks[idx] = [
                          ...newTasks[idx],
                          { id: Date.now(), text, completed: false },
                        ];
                        setWeekTasks(newTasks);
                      }}
                      style={{
                        ...neonButtonStyle("#00c3ff", "#7bff9a"),
                        padding: "8px 12px",
                        fontSize: 13,
                      }}
                    >
                      Add item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TASK LIST + ADD box for selected day */}
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  Tasks for {daysOfWeek[selectedDayIndex]} —{" "}
                  {weekDates[selectedDayIndex]}
                </h3>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  {doneCounts[selectedDayIndex]}/
                  {weekTasks[selectedDayIndex].length} done
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={onNewTaskKey}
                  placeholder="Enter task"
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.04)",
                    background: "rgba(255,255,255,0.01)",
                    color: "white",
                    minWidth: 260,
                  }}
                />
                <button
                  onClick={addTask}
                  style={neonButtonStyle("#7bff9a", "#00c3ff")}
                >
                  Add
                </button>

                {/* Clear day kept */}
                <button
                  onClick={() => clearDayTasks(selectedDayIndex)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.04)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                  title="Clear all tasks for this day"
                >
                  Clear day
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {weekTasks[selectedDayIndex].map((t) => (
                  <li
                    key={t.id}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() =>
                        toggleTaskCompletion(selectedDayIndex, t.id)
                      }
                      style={{ width: 18, height: 18 }}
                    />

                    {/* If this task is being edited, show input + save/cancel */}
                    {editingTaskId === t.id ? (
                      <>
                        <input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            flex: 1,
                            padding: 8,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.01)",
                            color: "white",
                          }}
                        />
                        <button
                          onClick={() => saveEditTask(selectedDayIndex, t.id)}
                          style={{
                            ...neonButtonStyle("#7bff9a", "#00c3ff"),
                            padding: "6px 8px",
                            fontSize: 13,
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.04)",
                            background: "transparent",
                            color: "rgba(255,255,255,0.85)",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            flex: 1,
                            color: t.completed
                              ? "rgba(255,255,255,0.7)"
                              : "white",
                            textDecoration: t.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {t.text}
                        </div>

                        {/* Edit button */}
                        <button
                          onClick={() =>
                            startEditTask(selectedDayIndex, t.id, t.text)
                          }
                          title="Edit task"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 6,
                            fontSize: 14,
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          ✏️
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => deleteTask(selectedDayIndex, t.id)}
                          title="Delete task"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 6,
                            fontSize: 14,
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CHART: shows week; hovered day highlighted; if hovered, show Done:X to the right */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 18, left: -8, bottom: 8 }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.04)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      wrapperStyle={{ background: "#0b0d11", borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="done_count"
                      stroke="#00f0ff"
                      strokeWidth={3}
                      dot={(props) => {
                        const { cx, cy, payload } = props as any;
                        const idx = payload.idx;
                        const isHovered = hoveredDayIndex === idx;
                        const r = isHovered ? 8 : 4;
                        const fill = isHovered ? "#7bff9a" : "#00f0ff";
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill={fill}
                            stroke="rgba(255,255,255,0.06)"
                          />
                        );
                      }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Hover summary box */}
              <div style={{ minWidth: 160 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.35)",
                    color: "white",
                  }}
                >
                  {hoveredDayIndex === null ? (
                    <>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                      >
                        Week summary
                      </div>
                      <div
                        style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}
                      >
                        Total done: {doneCounts.reduce((a, b) => a + b, 0)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                      >
                        Day summary
                      </div>
                      <div
                        style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}
                      >
                        {daysOfWeek[hoveredDayIndex]} —{" "}
                        {weekDates[hoveredDayIndex]}
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          marginTop: 10,
                          color: "#7bff9a",
                        }}
                      >
                        Done: {doneCounts[hoveredDayIndex]}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        {weekTasks[hoveredDayIndex].length} tasks total
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              textAlign: "right",
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
            }}
          >
            Data stored locally in browser.
          </div>
        </div>
      </div>
    </>
  );
};

export default ToDoApp;
