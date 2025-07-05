import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Edit2, Check, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "../App";

interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: Set<string>;
}

interface EditingHabit {
  id: string;
  name: string;
}

interface DayData {
  date: Date;
  dateString: string;
  isCurrentYear: boolean;
}

interface MonthLabel {
  month: string;
  weekIndex: number;
}

const HabitTrackerApp = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load habits from Supabase
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const { data: habitsData, error } = await supabase
          .from("habits")
          .select("*");

        if (error) throw error;

        const { data: entriesData, error: entriesError } = await supabase
          .from("habit_entries")
          .select("*");

        if (entriesError) throw entriesError;

        const habitsWithEntries = habitsData.map((habit) => {
          const completedDates = new Set(
            entriesData
              .filter((entry) => entry.habit_id === habit.id && entry.completed)
              .map((entry) => entry.date)
          );
          return {
            ...habit,
            color: habit.color || generateRandomColor(),
            completedDates,
          };
        });

        setHabits(habitsWithEntries);
      } catch (error) {
        console.error("Error loading habits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, []);
  const [editingHabit, setEditingHabit] = useState<EditingHabit | null>(null);
  const [newHabitName, setNewHabitName] = useState("");

  // Generate random color for each habit
  const generateRandomColor = () => {
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#22c55e", // green
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#10b981", // emerald
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#06b6d4", // sky
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get all dates in the selected year
  const getDatesInYear = (year: number): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date));
    }
    return dates;
  };

  // Get week data for heatmap (like react-heat-map)
  const getWeekData = (year: number): DayData[][] => {
    const weeks: DayData[][] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Find the first Sunday of the year or before
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    let currentDate = new Date(firstSunday);

    while (currentDate <= endDate) {
      const week: DayData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        week.push({
          date: date,
          dateString: date.toISOString().split("T")[0],
          isCurrentYear: date.getFullYear() === year,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  // Add new habit
  const addHabit = async () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: newHabitName.trim(),
        color: generateRandomColor(),
        completedDates: new Set<string>(),
      };

      try {
        const { error } = await supabase.from("habits").insert({
          id: newHabit.id,
          name: newHabit.name,
          color: newHabit.color,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        setHabits([...habits, newHabit]);
        setNewHabitName("");
      } catch (error) {
        console.error("Error adding habit:", error);
      }
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    try {
      // First delete all entries for this habit
      const { error: entriesError } = await supabase
        .from("habit_entries")
        .delete()
        .eq("habit_id", habitId);

      if (entriesError) throw entriesError;

      // Then delete the habit itself
      const { error: habitError } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (habitError) throw habitError;

      // Update local state
      setHabits(habits.filter((habit) => habit.id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // Toggle date completion for a habit
  const toggleDate = async (habitId: string, dateString: string) => {
    console.log("toggleDate called", { habitId, dateString });
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) {
      console.log("Habit not found");
      return;
    }

    const isCompleted = habit.completedDates.has(dateString);
    console.log("Current state:", { isCompleted });

    try {
      if (isCompleted) {
        console.log("Removing completion");
        const { data, error } = await supabase
          .from("habit_entries")
          .delete()
          .eq("habit_id", habitId)
          .eq("date", dateString);

        console.log("Delete result:", { data, error });
        if (error) throw error;
      } else {
        console.log("Adding completion");
        const { data, error } = await supabase.from("habit_entries").insert({
          habit_id: habitId,
          date: dateString,
          completed: true,
        });

        console.log("Insert result:", { data, error });
        if (error) throw error;
      }

      const updatedHabits = habits.map((habit) => {
        if (habit.id === habitId) {
          const newCompletedDates = new Set(habit.completedDates);
          if (isCompleted) {
            newCompletedDates.delete(dateString);
          } else {
            newCompletedDates.add(dateString);
          }
          return { ...habit, completedDates: newCompletedDates };
        }
        return habit;
      });

      console.log("Updated habits:", updatedHabits);
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  };

  // Start editing habit name
  const startEditing = (habitId: string, currentName: string) => {
    setEditingHabit({ id: habitId, name: currentName });
  };

  // Save edited habit name
  const saveEdit = async () => {
    if (editingHabit && editingHabit.name.trim()) {
      try {
        const { error } = await supabase
          .from("habits")
          .update({ name: editingHabit.name.trim() })
          .eq("id", editingHabit.id);

        if (error) throw error;

        setHabits(
          habits.map((habit) =>
            habit.id === editingHabit.id
              ? { ...habit, name: editingHabit.name.trim() }
              : habit
          )
        );
      } catch (error) {
        console.error("Error updating habit name:", error);
      }
    }
    setEditingHabit(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingHabit(null);
  };

  // Get completion percentage for a habit
  const getCompletionPercentage = (habit: Habit): number => {
    const currentYearDates = getDatesInYear(selectedYear);
    const completedDays = currentYearDates.filter((date) =>
      habit.completedDates.has(date.toISOString().split("T")[0])
    ).length;
    return Math.round((completedDays / currentYearDates.length) * 100);
  };

  // Get month labels for the heatmap
  const getMonthLabels = (weeks: DayData[][]): MonthLabel[] => {
    const monthLabels: MonthLabel[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    weeks.forEach((week: DayData[], weekIndex: number) => {
      const firstDayOfWeek = week[0].date;
      if (
        firstDayOfWeek.getDate() <= 7 &&
        firstDayOfWeek.getFullYear() === selectedYear
      ) {
        monthLabels.push({
          month: monthNames[firstDayOfWeek.getMonth()],
          weekIndex: weekIndex,
        });
      }
    });

    return monthLabels;
  };

  // Render heatmap for a single habit (react-heat-map style)
  const renderHeatmap = (habit: Habit) => {
    const weeks = getWeekData(selectedYear);
    const monthLabels = getMonthLabels(weeks);
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {editingHabit && editingHabit.id === habit.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editingHabit.name}
                    onChange={(e) =>
                      setEditingHabit({ ...editingHabit, name: e.target.value })
                    }
                    className="text-lg font-semibold"
                    autoFocus
                  />
                  <Button
                    onClick={saveEdit}
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{habit.name}</h3>
                  <Button
                    onClick={() => startEditing(habit.id, habit.name)}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit2 size={16} />
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {getCompletionPercentage(habit)}% completed
              </Badge>
              <Button
                onClick={() => deleteHabit(habit.id)}
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <div className="flex items-start gap-1 min-w-fit overflow-x-visible">
              {/* Day labels */}
              <div className="flex flex-col gap-1 mr-2">
                <div className="h-4"></div> {/* Spacer for month labels */}
                {dayLabels.map((day, index) => (
                  <div
                    key={day}
                    className={`text-xs text-muted-foreground h-3 flex items-center ${
                      index % 2 === 0 ? "" : "opacity-0"
                    }`}
                    style={{ fontSize: "11px" }}
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
                    const monthLabel = monthLabels.find(
                      (m) => m.weekIndex === weekIndex
                    );
                    return (
                      <div
                        key={weekIndex}
                        className="text-xs text-muted-foreground w-3 flex items-center justify-center"
                        style={{ fontSize: "11px" }}
                      >
                        {monthLabel ? monthLabel.month : ""}
                      </div>
                    );
                  })}
                </div>

                {/* Week columns */}
                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => {
                        const isCompleted = habit.completedDates.has(
                          day.dateString
                        );
                        const isToday =
                          day.dateString ===
                          new Date().toISOString().split("T")[0];
                        const isCurrentYear = day.isCurrentYear;

                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`w-3 h-3 rounded-sm transition-all duration-200 ${
                              isCurrentYear
                                ? "cursor-pointer hover:ring-2 hover:ring-gray-400"
                                : "cursor-default"
                            } ${isToday ? "ring-2" : ""}`}
                            style={{
                              backgroundColor: isCurrentYear
                                ? isCompleted
                                  ? habit.color
                                  : theme === "dark"
                                  ? "rgb(50, 50, 50)"
                                  : "#ebedf0"
                                : theme === "dark"
                                ? "rgb(20, 20, 20)"
                                : "#fafbfc",
                              ...(isToday
                                ? { "--tw-ring-color": habit.color }
                                : {}),
                            }}
                            onClick={() =>
                              isCurrentYear &&
                              toggleDate(habit.id, day.dateString)
                            }
                            title={`${day.date.toLocaleDateString()} - ${
                              isCurrentYear
                                ? isCompleted
                                  ? "Completed"
                                  : "Not completed"
                                : "Outside current year"
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
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full px-2 sm:px-4 mx-auto">
        <Card className="mb-4 sm:mb-8 bg-gray-50 dark:bg-neutral-900 w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Habit Tracker</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="h-9 w-9 p-0"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
                <div className="flex items-center gap-2">
                  {/* <label className="text-sm font-medium">Year:</label> */}
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter habit name..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
              />
              <Button onClick={addHabit}>
                <Plus className="mr-2 h-4 w-4" />
                Add Habit
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No habits added yet.</p>
              <p className="text-gray-400 text-sm mt-2">
                Click the "Add Habit" button to get started!
              </p>
            </div>
          ) : (
            habits.map((habit) => (
              <div key={habit.id}>{renderHeatmap(habit)}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerApp;
