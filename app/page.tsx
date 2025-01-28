"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "./components/button";
import {Card, CardContent, CardHeader, CardTitle } from "./components/card";
import UserDetailsModal from "./components/modal";
import { ChevronRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

interface Stats {
  difficulty: string;
  count: number;
  submissions: number;
}

interface UserData {
  username: string;
  stats: Stats[];
}

interface RankedUser {
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  score: number;
  rank: number;
}


export default function Home() {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [selectedUser, setSelectedUser] = useState<RankedUser | null>(null);
  
  

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/Login");
      } else {
        fetchAllLeetcodeUsernames();
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push("/Login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchAllLeetcodeUsernames = async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("leetcode_username");

    if (error) {
      setError("Failed to fetch LeetCode usernames.");
      return;
    }

    if (data) {
      const usernames = data.map((user) => user.leetcode_username);
      fetchLeaderboardData(usernames);
    }
  };

  const fetchLeaderboardData = async (usernames: string[]) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/leetcode", {
        usernames
      });
      setData(response.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  

 

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const rankedUsers = useMemo((): RankedUser[] => {
    const users = data.map((user) => {
      const stats = {
        easy: 0,
        medium: 0,
        hard: 0
      };

      user.stats.forEach((stat) => {
        stats[stat.difficulty.toLowerCase() as keyof typeof stats] = stat.count;
      });

      const score = stats.easy + stats.medium * 2 + stats.hard * 3;
      const totalSolved = stats.easy + stats.medium + stats.hard;

      return {
        username: user.username,
        totalSolved,
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
        score,
        rank: 0
      };
    });

    return users
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }, [data]);

  if (!session) {
    return null;
  }

  const getRankStyles = (rank: number) => {
    const baseStyles = "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-black";
    switch (rank) {
      case 1:
        return `${baseStyles} bg-gradient-to-r from-yellow-400 to-yellow-300  shadow-lg`;
      case 2:
        return `${baseStyles} bg-gradient-to-r from-gray-400 to-gray-300 `;
      case 3:
        return `${baseStyles} bg-gradient-to-r from-amber-700 to-amber-600`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-700`;
    }
  };

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case 'easy': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'hard': return 'text-red-500';
      default: return '';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 mt-10">
        <CardHeader className="p-0">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Leaderboard
          </CardTitle>
        </CardHeader>
        <Button 
          onClick={handleSignOut} 
          variant="outline"
          className="hover:bg-gray-100 transition-colors mb-8 hover:text-black"
        >
          Sign Out
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {rankedUsers.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <th className="p-4 text-white font-medium">Rank</th>
                    <th className="p-4 text-white font-medium text-left">Username</th>
                    <th className="p-4 text-white font-medium">Total Solved</th>
                    <th className="p-4 text-white font-medium">Easy</th>
                    <th className="p-4 text-white font-medium">Medium</th>
                    <th className="p-4 text-white font-medium">Hard</th>
                    <th className="p-4 text-white font-medium">Score</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rankedUsers.map((user) => (
                    <tr
                      key={user.username}
                      onClick={() => setSelectedUser(user)}
                      className="border-b border-gray-100 hover:bg-gray-600 cursor-pointer transition-all duration-200 group"
                    >
                      <td className="p-4 pl-8 text-center">
                        <div className={getRankStyles(user.rank)}>
                          {user.rank}
                        </div>
                      </td>
                      <td className="p-4 font-medium group-hover:text-white transition-colors">
                        {user.username}
                      </td>
                      <td className="p-4 text-center font-medium">
                        {user.totalSolved}
                      </td>
                      <td className={`p-4 text-center ${getDifficultyColor('easy')}`}>
                        {user.easy}
                      </td>
                      <td className={`p-4 text-center ${getDifficultyColor('medium')}`}>
                        {user.medium}
                      </td>
                      <td className={`p-4 text-center ${getDifficultyColor('hard')}`}>
                        {user.hard}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          {user.score}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <ChevronRight className="w-6 h-6 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all duration-200" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t ">
              <p className="text-sm text-gray-600">
                Score calculation: Easy (×1) + Medium (×2) + Hard (×3)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
       <UserDetailsModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};
