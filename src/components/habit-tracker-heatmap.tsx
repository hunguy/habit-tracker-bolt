import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const HabitTrackerApp = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabitName, setNewHabitName] = useState('');

  // Generate random color for each habit
  const generateRandomColor = () => {
    const colors = [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#10b981', // emerald
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#06b6d4', // sky
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get all dates in the selected year
  const getDatesInYear = (year) => {
    const dates = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }
    return dates;
  };

  // Get week data for heatmap (like react-heat-map)
  const getWeekData = (year) => {
    const weeks = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Find the first Sunday of the year or before
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());
    
    let currentDate = new Date(firstSunday);
    
    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        week.push({
          date: date,
          dateString: date.toISOString().split('T')[0],
          isCurrentYear: date.getFullYear() === year
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  // Add new habit
  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now(),
        name: newHabitName.trim(),
        color: generateRandomColor(),
        completedDates: new Set()
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
    }
  };

  // Delete habit
  const deleteHabit = (habitId) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  // Toggle date completion for a habit
  const toggleDate = (habitId, dateString) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletedDates = new Set(habit.completedDates);
        if (newCompletedDates.has(dateString)) {
          newCompletedDates.delete(dateString);
        } else {
          newCompletedDates.add(dateString);
        }
        return { ...habit, completedDates: newCompletedDates };
      }
      return habit;
    }));
  };

  // Start editing habit name
  const startEditing = (habitId, currentName) => {
    setEditingHabit({ id: habitId, name: currentName });
  };

  // Save edited habit name
  const saveEdit = () => {
    if (editingHabit.name.trim()) {
      setHabits(habits.map(habit => 
        habit.id === editingHabit.id 
          ? { ...habit, name: editingHabit.name.trim() }
          : habit
      ));
    }
    setEditingHabit(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingHabit(null);
  };

  // Get completion percentage for a habit
  const getCompletionPercentage = (habit) => {
    const currentYearDates = getDatesInYear(selectedYear);
    const completedDays = currentYearDates.filter(date => 
      habit.completedDates.has(date.toISOString().split('T')[0])
    ).length;
    return Math.round((completedDays / currentYearDates.length) * 100);
  };

  // Get month labels for the heatmap
  const getMonthLabels = (weeks) => {
    const monthLabels = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0].date;
      if (firstDayOfWeek.getDate() <= 7 && firstDayOfWeek.getFullYear() === selectedYear) {
        monthLabels.push({
          month: monthNames[firstDayOfWeek.getMonth()],
          weekIndex: weekIndex
        });
      }
    });
    
    return monthLabels;
  };

  // Render heatmap for a single habit (react-heat-map style)
  const renderHeatmap = (habit) => {
    const weeks = getWeekData(selectedYear);
    const monthLabels = getMonthLabels(weeks);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {editingHabit && editingHabit.id === habit.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingHabit.name}
                  onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                  className="px-2 py-1 border rounded text-lg font-semibold"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="p-1 text-green-600 hover:text-green-800"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
                <button
                  onClick={() => startEditing(habit.id, habit.name)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Edit2 size={16} />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {getCompletionPercentage(habit)}% completed
            </span>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex items-start gap-1 min-w-fit">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              <div className="h-4"></div> {/* Spacer for month labels */}
              {dayLabels.map((day, index) => (
                <div
                  key={day}
                  className={`text-xs text-gray-500 h-3 flex items-center ${
                    index % 2 === 0 ? '' : 'opacity-0'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex flex-col">
              {/* Month labels */}
              <div className="flex gap-1 mb-1 h-4">
                {weeks.map((week, weekIndex) => {
                  const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex);
                  return (
                    <div
                      key={weekIndex}
                      className="text-xs text-gray-500 w-3 flex items-center justify-center"
                      style={{ fontSize: '11px' }}
                    >
                      {monthLabel ? monthLabel.month : ''}
                    </div>
                  );
                })}
              </div>
              
              {/* Week columns */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      const isCompleted = habit.completedDates.has(day.dateString);
                      const isToday = day.dateString === new Date().toISOString().split('T')[0];
                      const isCurrentYear = day.isCurrentYear;
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm transition-all duration-200 ${
                            isCurrentYear 
                              ? 'cursor-pointer hover:ring-2 hover:ring-gray-400' 
                              : 'cursor-default'
                          } ${isToday ? 'ring-2 ring-gray-800' : ''}`}
                          style={{
                            backgroundColor: isCurrentYear 
                              ? (isCompleted ? habit.color : '#ebedf0')
                              : '#fafbfc'
                          }}
                          onClick={() => isCurrentYear && toggleDate(habit.id, day.dateString)}
                          title={`${day.date.toLocaleDateString()} - ${
                            isCurrentYear 
                              ? (isCompleted ? 'Completed' : 'Not completed')
                              : 'Outside current year'
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <div 
                className="w-3 h-3 rounded-sm opacity-30" 
                style={{ backgroundColor: habit.color }}
              ></div>
              <div 
                className="w-3 h-3 rounded-sm opacity-60" 
                style={{ backgroundColor: habit.color }}
              ></div>
              <div 
                className="w-3 h-3 rounded-sm opacity-80" 
                style={{ backgroundColor: habit.color }}
              ></div>
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: habit.color }}
              ></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter habit name..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            />
            <button
              onClick={addHabit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Habit
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No habits added yet.</p>
              <p className="text-gray-400 text-sm mt-2">Click the "Add Habit" button to get started!</p>
            </div>
          ) : (
            habits.map(habit => (
              <div key={habit.id}>
                {renderHeatmap(habit)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerApp;