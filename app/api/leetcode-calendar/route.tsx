import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { username, year } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Invalid username provided" },
        { status: 400 }
      );
    }

    const url = "https://leetcode.com/graphql/";
    const query = `   
    query userProfileCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
            userCalendar(year: $year) {
                activeYears
                streak
                totalActiveDays
                dccBadges {
                    timestamp
                    badge {
                    name
                    icon
                    }
                }
                submissionCalendar
            }
        }
    }`;

    // Fetch data for the single username
    const response = await axios.post(url, {
      query,
      variables: { username, year },
    });

    // Extract relevant data
    const stats = response.data.data.matchedUser.userCalendar.submissionCalendar;

    // Return the result as JSON
    return NextResponse.json({
      username,
      stats,
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
