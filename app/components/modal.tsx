import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";


interface RankedUser {
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  score: number;
  rank: number;
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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const difficulty = payload[0].payload.name;
      const bgColorClass = {
        'Easy': 'bg-green-50 border-green-200',
        'Medium': 'bg-yellow-50 border-yellow-200',
        'Hard': 'bg-red-50 border-red-200'
      }[difficulty as 'Easy' | 'Medium' | 'Hard'];

      const textColorClass = {
        'Easy': 'text-green-600',
        'Medium': 'text-yellow-600',
        'Hard': 'text-red-600'
      }[difficulty as 'Easy' | 'Medium' | 'Hard'];

      return (
        <div className={`p-2 rounded-lg shadow-lg border ${bgColorClass}`}>
          <p className={`font-medium ${textColorClass}`}>
            {difficulty}: {payload[0].payload.value} ({payload[0].payload.percentage}%)
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
                | undefined,
            ) => <span className="text-sm font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const UserDetailsModal = ({ user, onClose }: UserDetailsModalProps) => {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center overflow-y-auto p-4 transition-all duration-300"
      onClick={onClose}
    >
      <Card className="max-w-2xl w-full rounded-3xl shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out">
        <div onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">{user.username.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left section */}
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  <span className="text-gray-600">Total Solved:</span>{" "}
                  {user.totalSolved}
                </p>
                <p className="text-lg font-semibold">
                  <span className="text-gray-600">Score:</span> {user.score}
                </p>
              </div>

              {/* Right section */}
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">
                  <span className="text-gray-600">Easy:</span> {user.easy}
                </p>
                <p className="text-lg font-semibold text-yellow-600">
                  <span className="text-gray-600">Medium:</span> {user.medium}
                </p>
                <p className="text-lg font-semibold text-red-600">
                  <span className="text-gray-600">Hard:</span> {user.hard}
                </p>
              </div>
            </div>

            {/* Problem Distribution Chart */}
            <div>
              <h3 className="text-lg font-semibold">
                Problem Distribution
              </h3>
              <ProblemDistributionChart
                easy={user.easy}
                medium={user.medium}
                hard={user.hard}
              />
            </div>

            <div className="border-gray-300">
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-6 w-full py-3 text-xl font-semibold rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default UserDetailsModal;
