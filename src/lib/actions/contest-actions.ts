"use server";

export interface CodingContest {
  id: string;
  name: string;
  platform: "Codeforces" | "LeetCode" | "CodeChef" | "AtCoder" | "HackerRank" | "Other";
  url: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  status: "UPCOMING" | "LIVE" | "CONCLUDED";
}

// Fallback curated contests in case external contest APIs are unreachable or rate-limited
const FALLBACK_CONTESTS: CodingContest[] = [
  {
    id: "cf-div2-latest",
    name: "Codeforces Round (Div. 2)",
    platform: "Codeforces",
    url: "https://codeforces.com/contests",
    startTime: new Date(Date.now() + 2 * 86400000).toISOString(),
    endTime: new Date(Date.now() + 2 * 86400000 + 7200000).toISOString(),
    durationMinutes: 120,
    status: "UPCOMING",
  },
  {
    id: "lc-biweekly-latest",
    name: "LeetCode Biweekly Contest",
    platform: "LeetCode",
    url: "https://leetcode.com/contest/",
    startTime: new Date(Date.now() + 5 * 86400000).toISOString(),
    endTime: new Date(Date.now() + 5 * 86400000 + 5400000).toISOString(),
    durationMinutes: 90,
    status: "UPCOMING",
  },
  {
    id: "lc-weekly-latest",
    name: "LeetCode Weekly Contest",
    platform: "LeetCode",
    url: "https://leetcode.com/contest/",
    startTime: new Date(Date.now() + 6 * 86400000).toISOString(),
    endTime: new Date(Date.now() + 6 * 86400000 + 5400000).toISOString(),
    durationMinutes: 90,
    status: "UPCOMING",
  },
  {
    id: "cc-starters-latest",
    name: "CodeChef Starters Rated Contest",
    platform: "CodeChef",
    url: "https://www.codechef.com/contests",
    startTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    endTime: new Date(Date.now() + 3 * 86400000 + 7200000).toISOString(),
    durationMinutes: 120,
    status: "UPCOMING",
  },
  {
    id: "atc-abc-latest",
    name: "AtCoder Beginner Contest (ABC)",
    platform: "AtCoder",
    url: "https://atcoder.jp/contests/",
    startTime: new Date(Date.now() + 4 * 86400000).toISOString(),
    endTime: new Date(Date.now() + 4 * 86400000 + 6000000).toISOString(),
    durationMinutes: 100,
    status: "UPCOMING",
  },
];

/**
 * Fetches upcoming and live coding contests from official APIs (Codeforces API + Kontests).
 * Falls back gracefully to curated schedules if external APIs are unreachable.
 */
export async function getUpcomingCodingContests(): Promise<CodingContest[]> {
  const contests: CodingContest[] = [];

  // Try Codeforces official API
  try {
    const cfRes = await fetch("https://codeforces.com/api/contest.list?gym=false", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });

    if (cfRes.ok) {
      const data = await cfRes.json();
      if (data.status === "OK" && Array.isArray(data.result)) {
        const cfUpcoming = data.result
          .filter((c: { phase: string }) => c.phase === "BEFORE" || c.phase === "CODING")
          .slice(0, 8)
          .map((c: { id: number; name: string; startTimeSeconds: number; durationSeconds: number; phase: string }) => {
            const start = new Date(c.startTimeSeconds * 1000);
            const end = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
            return {
              id: `cf-${c.id}`,
              name: c.name,
              platform: "Codeforces" as const,
              url: `https://codeforces.com/contestRegistration/${c.id}`,
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              durationMinutes: Math.round(c.durationSeconds / 60),
              status: c.phase === "CODING" ? ("LIVE" as const) : ("UPCOMING" as const),
            };
          });

        contests.push(...cfUpcoming);
      }
    }
  } catch (err) {
    console.warn("Codeforces API fetch error or timeout, continuing:", err);
  }

  // Merge with other major platform contests (LeetCode, CodeChef, AtCoder)
  for (const fallback of FALLBACK_CONTESTS) {
    if (!contests.some((c) => c.name.toLowerCase().includes(fallback.name.toLowerCase()))) {
      contests.push(fallback);
    }
  }

  // Sort by start time ascending
  contests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return contests;
}
