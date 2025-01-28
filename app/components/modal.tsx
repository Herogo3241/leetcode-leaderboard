"use client";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import axios from "axios";
import SubmissionHeatmap from "./heatmap";
import { Flame } from "lucide-react";

interface RankedUser {
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  score: number;
  rank: number;
}

interface SubmissionCalendar {
  username: string;
  stats: string;
}

interface UserDetailsModalProps {
  user: RankedUser | null;
  onClose: () => void;
}

const ProblemDistributionChart = ({
  easy,
  medium,
  hard
}: {
  easy: number;
  medium: number;
  hard: number;
}) => {
  const total = easy + medium + hard;
  const data = [
    {
      name: "Easy",
      value: easy,
      color: "#22c55e",
      percentage: ((easy / total) * 100).toFixed(1)
    },
    {
      name: "Medium",
      value: medium,
      color: "#eab308",
      percentage: ((medium / total) * 100).toFixed(1)
    },
    {
      name: "Hard",
      value: hard,
      color: "#ef4444",
      percentage: ((hard / total) * 100).toFixed(1)
    }
  ];

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const difficulty = payload[0].payload.name;
      const bgColorClass = {
        Easy: "bg-green-50 border-green-200",
        Medium: "bg-yellow-50 border-yellow-200",
        Hard: "bg-red-50 border-red-200"
      }[difficulty as "Easy" | "Medium" | "Hard"];

      const textColorClass = {
        Easy: "text-green-600",
        Medium: "text-yellow-600",
        Hard: "text-red-600"
      }[difficulty as "Easy" | "Medium" | "Hard"];

      return (
        <div className={`p-2 rounded-lg shadow-lg border ${bgColorClass}`}>
          <p className={`font-medium ${textColorClass}`}>
            {difficulty}: {payload[0].payload.value} (
            {payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            className="bg-black"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(
              value:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    unknown,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactPortal
                    | React.ReactElement<
                        unknown,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined
            ) => <span className="text-sm font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

function calculateCurrentStreak(stats: string): number {
  // Parse the stats JSON string into an object
  const parsedStats: Record<string, number> = JSON.parse(stats);

  // Convert the keys (timestamps) into Date objects and sort them in descending order
  const sortedDates = Object.keys(parsedStats)
    .map((timestamp) => new Date(Number(timestamp) * 1000)) // Convert Unix timestamp to milliseconds
    .sort((a, b) => b.getTime() - a.getTime()); // Descending order

  // Initialize streak count and check for consecutive dates
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignore time for streak calculation

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const previousDate = i === 0 ? today : sortedDates[i - 1];

    // Calculate the difference in days
    const diffDays =
      (previousDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    // If the difference is 1 (consecutive day) or 0 (same day), increment streak
    if (diffDays <= 1) {
      currentStreak++;
    } else {
      // Break if there is a gap in the streak
      break;
    }
  }

  return currentStreak;
}

const UserDetailsModal = ({ user, onClose }: UserDetailsModalProps) => {
  if (!user) return null;

  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionCalendar | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post("/api/leetcode-calendar", {
          username: user.username,
          year: new Date().getFullYear().toString(),
        });
  
        if (response.data) {
          setSubmissions(response.data);
        } else {
          console.error("Empty response data");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchData();
    }
  }, [user]);
  


  

  const currentStreak = submissions ? calculateCurrentStreak(submissions.stats) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center overflow-y-auto p-4 transition-all duration-300" onClick={onClose}>
      <Card className="max-w-2xl w-full rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out">
        <div onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {user.username.toUpperCase()}
              </CardTitle>
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-xl">
                <Flame className="w-5 h-5" />
                <span className="font-bold">{currentStreak} day streak!</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Problem Distribution Chart */}
            <div>
              <h3 className="text-md font-semibold mb-2">Problem Distribution</h3>
              <ProblemDistributionChart
                easy={user.easy}
                medium={user.medium}
                hard={user.hard}
              />
            </div>

            {/* Submission Heatmap */}
            {submissions && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold">Activity</h3>
                  <div className="text-sm text-gray-500">
                    Keep the streak alive! 🔥
                  </div>
                </div>
                <SubmissionHeatmap 
                  stats={submissions.stats}
                />
              </div>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full py-2 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white"
            >
              Close
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

export default UserDetailsModal;
