"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "./components/button";
import {CardContent, CardHeader, CardTitle } from "./components/card";
import UserDetailsModal from "./components/modal";

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
  interface Submission {
    username: string;
    stats: string;
  }
  
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-10">
          <CardHeader>
            <CardTitle className="text-3xl">Leaderboard</CardTitle>
          </CardHeader>
        </h1>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {rankedUsers.length > 0 && (
        <CardContent>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <th className="border p-4">Rank</th>
                <th className="border p-4">Username</th>
                <th className="border p-4">Total Solved</th>
                <th className="border p-4">Easy</th>
                <th className="border p-4">Medium</th>
                <th className="border p-4">Hard</th>
                <th className="border p-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {rankedUsers.map((user) => (
                <tr
                  key={user.username}
                  className="hover:bg-gray-800 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="border p-4 text-center">
                    <span
                      className={`font-bold inline-block w-8 h-8 rounded-full leading-8 ${
                        user.rank === 1
                          ? "bg-yellow-400 text-white"
                          : user.rank === 2
                          ? "bg-gray-300 text-white"
                          : user.rank === 3
                          ? "bg-amber-600 text-white"
                          : ""
                      }`}
                    >
                      {user.rank}
                    </span>
                  </td>
                  <td className="border p-4">{user.username}</td>
                  <td className="border p-4 text-center">{user.totalSolved}</td>
                  <td className="border p-4 text-center text-green-600">
                    {user.easy}
                  </td>
                  <td className="border p-4 text-center text-yellow-600">
                    {user.medium}
                  </td>
                  <td className="border p-4 text-center text-red-600">
                    {user.hard}
                  </td>
                  <td className="border p-4 text-center font-bold">
                    {user.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-gray-600">
            Score calculation: Easy (×1) + Medium (×2) + Hard (×3)
          </p>
        </CardContent>
      )}

      <UserDetailsModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}