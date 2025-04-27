import React, { useMemo, useState } from "react";

export default function ActivityHeatmap({ matches }) {
  // State to toggle between win rate and match count display
  const [showWinRate, setShowWinRate] = useState(false);

  // Generate data for the last 60 days
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Create array of the last 60 days
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date,
        dateString: date.toISOString().split("T")[0],
        dayOfWeek: date.getDay(),
        dayName: dayNames[date.getDay()],
        month: date.toLocaleString("default", { month: "short" }),
        matches: 0,
        wins: 0,
        winRate: 0,
      });
    }

    // Count matches and calculate win rate for each day
    days.forEach((day) => {
      const dayMatches = matches.filter(
        (match) => match.date === day.dateString
      );
      day.matches = dayMatches.length;
      day.wins = dayMatches.filter((match) => match.result === "win").length;
      day.winRate = day.matches > 0 ? (day.wins / day.matches) * 100 : 0;
    });

    // Group by weeks (organize in columns)
    const weeks = [];
    for (let i = 0; i < Math.ceil(days.length / 7); i++) {
      weeks.push(days.slice(i * 7, (i + 1) * 7));
    }

    return { days, weeks };
  }, [matches]);

  // Get unique month labels for the x-axis
  const monthLabels = useMemo(() => {
    // Create an array of week indices and their corresponding month
    const weekMonths = heatmapData.weeks.map((week, index) => {
      // Use the first day of each week to determine the month
      const month = week[0]?.month || "";
      return { index, month };
    });

    // Group consecutive weeks with the same month
    const monthRanges = [];
    let currentMonth = null;
    let startIndex = 0;

    weekMonths.forEach((item, index) => {
      if (item.month !== currentMonth) {
        if (currentMonth !== null) {
          monthRanges.push({
            month: currentMonth,
            startIndex,
            endIndex: index - 1,
            span: index - startIndex,
          });
        }
        currentMonth = item.month;
        startIndex = index;
      }

      // Handle the last month
      if (index === weekMonths.length - 1) {
        monthRanges.push({
          month: currentMonth,
          startIndex,
          endIndex: index,
          span: index - startIndex + 1,
        });
      }
    });

    return monthRanges;
  }, [heatmapData.weeks]);

  // Determine color based on match count or win rate
  const getColorClass = (day) => {
    if (!day || day.matches === 0) return "day-cell-empty";

    if (showWinRate) {
      // Win rate coloring
      if (day.winRate < 20) return "win-rate-0";
      if (day.winRate < 40) return "win-rate-25";
      if (day.winRate < 60) return "win-rate-50";
      if (day.winRate < 80) return "win-rate-75";
      return "win-rate-100";
    } else {
      // Match count coloring
      if (day.matches === 1) return "day-cell-level-1";
      if (day.matches === 2) return "day-cell-level-2";
      if (day.matches === 3) return "day-cell-level-3";
      return "day-cell-level-4";
    }
  };

  // Toggle display mode
  const toggleDisplayMode = () => {
    setShowWinRate(!showWinRate);
  };

  return (
    <div className="card activity-heatmap">
      <div className="activity-heatmap-header">
        <h2>Activité des 60 derniers jours</h2>

        {/* Toggle Button */}
        <button className="toggle-button" onClick={toggleDisplayMode}>
          Afficher: {showWinRate ? "Taux de Victoire" : "Nombre de Matchs"}
        </button>
      </div>

      <div className="heatmap-container">
        {/* Day labels */}
        <div className="day-labels">
          <div style={{ height: "24px" }}></div>{" "}
          {/* Empty space for month labels */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="day-label">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="weeks-container">
          {/* Month labels */}
          <div className="month-labels">
            {monthLabels.map((monthInfo) => (
              <div
                key={`${monthInfo.month}-${monthInfo.startIndex}`}
                className="month-label"
                style={{
                  gridColumnStart: monthInfo.startIndex + 1,
                  gridColumnEnd: monthInfo.endIndex + 2,
                }}
              >
                {monthInfo.month}
              </div>
            ))}
          </div>

          {/* Weekly columns */}
          <div className="weeks-grid">
            {heatmapData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="week-column">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.find((d) => d.dayOfWeek === dayOfWeek);
                  return (
                    <div
                      key={`${weekIndex}-${dayOfWeek}`}
                      className={`day-cell ${getColorClass(day)}`}
                      title={
                        day && day.matches > 0
                          ? `${day.dateString}: ${day.matches} match${
                              day.matches > 1 ? "es" : ""
                            } (${day.winRate.toFixed(0)}% de victoires)`
                          : ""
                      }
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend - changes based on display mode */}
      {showWinRate ? (
        <div className="win-rate-legend">
          <span className="legend-label">WR%</span>
          <div className="legend-colors">
            <span className="legend-color win-rate-0"></span>
            <span className="legend-color win-rate-25"></span>
            <span className="legend-color win-rate-50"></span>
            <span className="legend-color win-rate-75"></span>
            <span className="legend-color win-rate-100"></span>
          </div>
          <div className="legend-values">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      ) : (
        <div className="match-count-legend">
          <span className="legend-label">Matchs</span>
          <div className="legend-colors">
            <span className="legend-color day-cell-level-1"></span>
            <span className="legend-color day-cell-level-2"></span>
            <span className="legend-color day-cell-level-3"></span>
            <span className="legend-color day-cell-level-4"></span>
          </div>
          <div className="legend-values">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4+</span>
          </div>
        </div>
      )}
    </div>
  );
}
