
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface UserStats {
  difficulty: string;
  count: number;
  submissions: number;
}

interface UserResponse {
  username: string;
  stats: UserStats[];
}

interface GraphQLResponse {
  data: {
    allQuestionsCount: {
      difficulty: string;
      count: number;
    }[];
    matchedUser: {
      submitStats: {
        acSubmissionNum: UserStats[];
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { usernames } = await request.json();

    if (!usernames || !Array.isArray(usernames)) {
      return NextResponse.json(
        { error: "Invalid usernames provided" },
        { status: 400 }
      );
    }

    const url = "https://leetcode.com/graphql/";
    const query = `
      query userSessionProgress($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const results: UserResponse[] = await Promise.all(
      usernames.map(async (username): Promise<UserResponse> => {
        const response = await axios.post<GraphQLResponse>(url, {
          query,
          variables: { username },
        });
        return {
          username,
          stats: response.data.data.matchedUser.submitStats.acSubmissionNum,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}