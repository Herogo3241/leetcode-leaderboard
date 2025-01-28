import React, { useState } from 'react';
import { Card } from './card';

interface SubmissionData {
  username: string;
  stats: string;
}

interface HeatmapProps {

    stats: string;
  
  
}

const SubmissionHeatmap = ({ stats }: HeatmapProps) => {
    const [selectedYear, setSelectedYear] = useState('2025');
    const years = ['2025', '2024', '2023', '2022', '2021'];

  // Parse the stats string into an object
  const submissions = JSON.parse(stats);

  // Helper function to get cell color based on submission count
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-gray-400';
    if (count === 1) return 'bg-green-400';
    if (count === 2) return 'bg-green-500';
    if (count === 3) return 'bg-green-600';
    return 'bg-green-700';
  };

  // Generate dates for the selected year
  const generateDatesForYear = (year: string) => {
    const dates = [];
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const timestamp = Math.floor(d.getTime() / 1000).toString();
      dates.push({
        date: new Date(d),
        count: submissions[timestamp] || 0
      });
    }
    return dates;
  };

  // Group dates by week for the heatmap
  const groupDatesByWeek = (dates: Array<{ date: Date; count: number }>) => {
    const weeks: Array<Array<{ date: Date; count: number }>> = [];
    let currentWeek: Array<{ date: Date; count: number }> = [];

    dates.forEach((dateObj) => {
      if (dateObj.date.getDay() === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(dateObj);
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = groupDatesByWeek(generateDatesForYear(selectedYear));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Format date for tooltip
  const formatDateForTooltip = (date: Date, count: number) => {
    return `${date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}: ${count} submission${count !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold flex items-center gap-4">
          <span>Submission Activity</span>

        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-2 ml-3">
          <div className="w-5" /> {/* Spacing for day labels */}
          {/* {monthNames.map((month) => (
            <div key={month} className="flex-1 text-xs text-gray-500">
              {month}
            </div>
          ))} */}
        </div>

        {/* Day labels and heatmap grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-around mr-2 text-xs text-gray-500">
            {/* <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span> */}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1 flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-4 h-4 rounded-sm ${getCellColor(day.count)} transition-colors duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-blue-400`}
                    title={formatDateForTooltip(day.date, day.count)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-4 text-xs text-gray-600 gap-2">
          <span>Less</span>
          <div className="w-3 h-3 bg-gray-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 rounded-sm" />
          <div className="w-3 h-3 bg-green-700 rounded-sm" />
          <span>More</span>
        </div>
      </div>
    </Card>
  );
};

export default SubmissionHeatmap;