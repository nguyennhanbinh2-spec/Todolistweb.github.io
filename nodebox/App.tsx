import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface GraphData {
  date: string;
  done_count: number;
}

const ToDoApp: React.FC = () => {
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [loginUsername, setLoginUsername] = useState('');
  const [weekTasks, setWeekTasks] = useState<Task[][]>(() => {
    const storedTasks = localStorage.getItem('weekTasks');
    return storedTasks ? JSON.parse(storedTasks) : Array(7).fill([]);
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [doneTaskCounts, setDoneTaskCounts] = useState<number[]>(Array(7).fill(0));
  const [graphData, setGraphData] = useState<GraphData[]>(() => {
    const storedGraphData = localStorage.getItem('graphData');
    return storedGraphData ? JSON.parse(storedGraphData) : [];
  });
  const [newGraphDate, setNewGraphDate] = useState('');
  const [editGraphIndex, setEditGraphIndex] = useState<number | null>(null);
  const [editingGraphDate, setEditingGraphDate] = useState('');

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);

  useEffect(() => {
    localStorage.setItem('weekTasks', JSON.stringify(weekTasks));
    updateDoneTaskCounts();
  }, [weekTasks]);

  useEffect(() => {
    localStorage.setItem('graphData', JSON.stringify(graphData));
  }, [graphData]);

  const handleLogin = () => {
    if (loginUsername.trim() !== '') {
      setUsername(loginUsername.trim());
    }
  };

  const handleLogout = () => {
    setUsername(null);
  };

  const addTask = () => {
    if (newTaskText.trim() !== '') {
      const newTasks = [...weekTasks];
      if (newTasks[selectedDayIndex].length < 20) {
        newTasks[selectedDayIndex] = [
          ...newTasks[selectedDayIndex],
          { id: Date.now(), text: newTaskText, completed: false },
        ];
        setWeekTasks(newTasks);
        setNewTaskText('');
      } else {
        alert('Maximum 20 tasks per day allowed.');
      }
    }
  };

  const toggleTaskCompletion = (taskId: number) => {
    const newTasks = [...weekTasks];
    newTasks[selectedDayIndex] = newTasks[selectedDayIndex].map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setWeekTasks(newTasks);
  };

  const updateDoneTaskCounts = () => {
    const newDoneTaskCounts = weekTasks.map((dayTasks) =>
      dayTasks.filter((task) => task.completed).length
    );
    setDoneTaskCounts(newDoneTaskCounts);
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const addGraphData = () => {
    if (newGraphDate.trim() !== '') {
      setGraphData([...graphData, { date: newGraphDate, done_count: doneTaskCounts[selectedDayIndex] }]);
      setNewGraphDate('');
    }
  };

  const startEditGraphData = (index: number) => {
    setEditGraphIndex(index);
    setEditingGraphDate(graphData[index].date);
  };

  const saveEditGraphData = () => {
    if (editGraphIndex !== null && editingGraphDate.trim() !== '') {
      const newGraphData = [...graphData];
      newGraphData[editGraphIndex] = { ...newGraphData[editGraphIndex], date: editingGraphDate };
      setGraphData(newGraphData);
      setEditGraphIndex(null);
      setEditingGraphDate('');
    }
  };

  const cancelEditGraphData = () => {
    setEditGraphIndex(null);
    setEditingGraphDate('');
  };

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          className="border border-gray-300 rounded-md p-2 mb-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">To-Do List</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout ({username})
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Select Day</h2>
        <div className="flex space-x-2">
          {daysOfWeek.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`py-2 px-4 rounded-md ${
                selectedDayIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } focus:outline-none`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Add Task</h2>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter task"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mr-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTask}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Tasks for {daysOfWeek[selectedDayIndex]}</h2>
        <ul>
          {weekTasks[selectedDayIndex].map((task) => (
            <li key={task.id} className="flex items-center py-2 border-b border-gray-200">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="mr-2 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                {task.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Progress Graph</h2>
        <div className="mb-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={graphData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="done_count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Add/Edit Graph Data</h3>
          <div className="flex items-center mb-2">
            {editGraphIndex === null ? (
              <>
                <input
                  type="text"
                  placeholder="Enter date for graph data"
                  value={newGraphDate}
                  onChange={(e) => setNewGraphDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 mr-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addGraphData}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Data
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Edit date"
                  value={editingGraphDate}
                  onChange={(e) => setEditingGraphDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 mr-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveEditGraphData}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditGraphData}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <ul>
            {graphData.map((data, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>
                  {data.date}: {data.done_count}
                </span>
                <button
                  onClick={() => startEditGraphData(index)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ToDoApp;