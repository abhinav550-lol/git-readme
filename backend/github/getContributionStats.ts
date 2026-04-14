import * as cheerio from "cheerio";
import appError from "../error/appError.js";
import client, { connectRedis } from "../cache/redisConnect.js";
import axios from "axios";

//Interface for contribution data
interface ContributionsInterface {
  rank: string; //C -> B -> A -> A+ -> S
  totalContributions: number;
  accountCreationDate: string;
  yearWiseContributions: { year: string; contributions: number }[];
  dayWiseContributions: { date: string; contributions: number }[];
  maxStreak: number;
}

async function getUserCreationDate(username: string): Promise<string> {
  //fetch the user data from github api and return the created_at field, in yyyy-mm-dd format
  try{
  const response = await axios.get(`https://api.github.com/users/${username}`, {
    headers: {
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    },
  });

  const data = await response.data;
  if (!data?.created_at) throw new appError(404, "User not found");
  
  const date = data.created_at.slice(0, 10); //yyyy-mm-dd format

  const regex = /(\d{4})-(\d{2})-(\d{2})/;
  const match = date.match(regex);
  if (!match) throw new appError(500, "Invalid date format");

  return date;
} catch (error) {
  console.error("Error fetching user creation date:", error);
  throw new appError(500, "Failed to fetch user creation date");
}
}


async function getUserContributions(username: string) {
	// Redis Cache Check
	if (!client.isOpen) await connectRedis();
	const key = `github_contributions_${username}`;
	
	const cachedData = await client.get(key);
	if (cachedData) {
		return JSON.parse(cachedData);
	}

  //Calculation of contribution data
  const currDate = new Date().toISOString().slice(0, 10); //yyyy-mm-dd format
  const userCreationDate = await getUserCreationDate(username);
  const baseUrl = `https://github.com/users/${username}/contributions`;

  const contributionsData: ContributionsInterface = {
    rank: "C", //C -> B -> A -> A+ -> S
    totalContributions: 0,
    accountCreationDate: userCreationDate,
    yearWiseContributions: [],
    dayWiseContributions: [],
    maxStreak: 0,
};

// Set to track seen dates — avoids O(n²) duplicate check
  const seenDates = new Set<string>();
  
  let from = userCreationDate;
  let reachedPresent = false;
  
  //Sleep between requests to avoid rate limit
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //Gives year end date, if the current date is not reached, else gives the current date
  function getTo(date: string): string {
	  const [yearStr] = date.split("-");
	  const year = Number(yearStr);
	  const yearEnd = `${year}-12-31`;
	  
	  const parseYMD = (value: string): Date => {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    };

    return parseYMD(currDate) < parseYMD(yearEnd) ? currDate : yearEnd;
}

  //Gives next year start date, if the current date is not reached, else gives the current date
  function getFrom(date: string): string {
	  if (date >= currDate) {
      reachedPresent = true;
      return currDate;
    }

    const [yearStr] = date.split("-");
    const nextYear = Number(yearStr) + 1;
    const nextYearStart = `${nextYear}-01-01`;

    // If next year start goes past current date, we've reached the present
    if (nextYearStart > currDate) {
      reachedPresent = true;
      return currDate;
    }

    return nextYearStart;
  }

  //Num given in 2,000,220 format, convert it to number
  function getNum(str: string): number {
	  return Number(str.replace(/,/g, ""));
  }

  //Fetch the contributions HTML from GitHub
  async function getGithubContributionsHTML(
    url: string,
  ): Promise<{ data: string }> {
    let response;
    try {
      response = await axios.get(url, { headers: { Accept: "text/html" } });
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      throw new appError(500, "Failed to fetch contributions data");
    }

    return response;
  }
  
  //Scrape the response and return extracted data
  function scrapeContributions(htmlResponse: string): {
    year: string;
    contributions: number;
    days: { date: string; contributions: number }[];
} {
    const $ = cheerio.load(htmlResponse);
	
    const yearId = "#js-contribution-activity-description"; //h2 tag + this id for year contribution
    const yearData = $(yearId).text().trim().split(" ");
	
    const yearContributions = getNum(yearData[0]);
    const year = yearData[yearData.length - 1];
	
    /*
    1. Day wise contribution by fetching all dayClasses
    2. Get the data-date (day gotten)
    3. Get the id (contribution-day-component-0-15)
    4. Search for tooltip with for attribute same as id, get the text and extract the number from it (2 contributions on Jan 1, 2020)
    5. If parseInt of first word is NaN, then 0 else the Number

    Final:
    [
      {"date" : "date" , "contributions" : num extracted from tooltip}
    ]
    */
    const days: { date: string; contributions: number }[] = [];
    const dayClass = ".ContributionCalendar-day";

    $(dayClass).each((i, elem) => {
      const dataDate = $(elem).attr("data-date");
      const id = $(elem).attr("id");

      if (dataDate && id) {
        const tooltip = $(`tool-tip[for="${id}"]`);
        const contributions =
          getNum(tooltip.text().trim().split(" ")[0]) || 0;

        days.push({ date: dataDate, contributions });
      }
    });

    return { year, contributions: yearContributions, days };
  }

  //Compute Max Streak From Computed Data
  function computeMaxStreak(
    dayWiseContributions: { date: string; contributions: number }[],
  ): number {
    let currentStreak = 0;
    let maxStreak = 0;

    for (const day of dayWiseContributions) {
      if (day.contributions > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  function computeRank(contributionsData: ContributionsInterface): string {
    /*
    C: Total Contributions < 50
    B: 50 <= Total Contributions < 100 || Max Streak < 5
    A: 100 <= Total Contributions < 2000 || 5 <= Max Streak < 20
    A+: Total Contributions >= 2000 || Max Streak >= 20
    S: Total Contributions >= 10000 || Max Streak >= 365
    */

    const { totalContributions, maxStreak } = contributionsData;

    if (totalContributions >= 10000 || maxStreak >= 365) {
      return "S";
    }

    if (totalContributions >= 2000 || maxStreak >= 30) {
      return "A+";
    }

    if (totalContributions >= 100 || maxStreak >= 10) {
      return "A";
    }

    if (totalContributions >= 50) {
      return "B";
    }

    return "C";
  }

  //Parsing per year data and day wise data, until we reach the present date
  
  let maxLoops = 50; //Preventing INFINITE LOOP in case of any bug, as there should not be more than 50 years of contributions data realistically
  while (!reachedPresent && maxLoops > 0) {
	maxLoops--;
	const to = getTo(from);
    const url = `${baseUrl}?from=${from}&to=${to}`;

    try {
      const response = await getGithubContributionsHTML(url);
      const html = response.data;

      // Scrape and collect data
      const { year, contributions, days } = scrapeContributions(html);

      contributionsData.yearWiseContributions.push({ year, contributions });

      // Add days, skipping duplicates using Set for O(1) lookup
      for (const day of days) {
        if (!seenDates.has(day.date)) {
          seenDates.add(day.date);
          contributionsData.dayWiseContributions.push(day);
        }
      }

      from = getFrom(to);

      // Only sleep if there's a next request to make
      if (!reachedPresent) await sleep(1500);
    } catch (err) {
      console.error(`Error fetching data for ${from} to ${to}:`, err);
      throw new appError(500, "Failed to fetch contributions data");
    }
  }

  //Organizing and Computing From Data

  // 1. Sort
  contributionsData.yearWiseContributions.sort(
    (a, b) => Number(a.year) - Number(b.year),
  );
  contributionsData.dayWiseContributions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // 2. Compute total FIRST (rank depends on it)
  contributionsData.totalContributions =
    contributionsData.yearWiseContributions.reduce(
      (acc, curr) => acc + curr.contributions,
      0,
    );

  // 3. Compute streak
  contributionsData.maxStreak = computeMaxStreak(
    contributionsData.dayWiseContributions,
  );

  // 4. Compute rank LAST (depends on total + streak)
  contributionsData.rank = computeRank(contributionsData);

  // 5. Cache for 1 hour
  await client.set(key, JSON.stringify(contributionsData), { EX: 60 * 60 });

  return contributionsData;
}

async function test() {
	const user_date = await getUserCreationDate("abhinav550-lol");
	const contributions = await getUserContributions("abhinav550-lol");
	console.log(user_date);
	console.log(contributions);
}

export default getUserContributions;