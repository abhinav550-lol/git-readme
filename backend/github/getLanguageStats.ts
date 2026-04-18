import axios from "axios";
import appError from "../error/appError.js";

import client, { connectRedis } from "../cache/redisConnect.js";
interface LanguageStats {
  total_languages: number;
  total_size: number;
  languages: Record<string, [number, string]>; //LANG_NAME , {size : number, percentage : number}
}



/** Get Public Repos  */
async function getPublicRepos(username: string) {
  const repos = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new appError(
        response.status,
        `Failed to fetch repositories for user ${username}`
      );
    }

    const data = await response.json();

    if (data.length === 0) break; // no more repos

    repos.push(...data);
    page++;
  }

  return repos;
}

/** Retrieves language statistics for a given GitHub username */
async function getLanguageStats(username : string) : Promise<LanguageStats> {
	if(!client.isOpen){
		await connectRedis();
	}

	//Check Cache first
	const cacheKey = `language_stats:${username}`;
	const cachedData = await client.get(cacheKey);
	if(cachedData){
		return JSON.parse(cachedData) as LanguageStats;
	}


	const languageStats: LanguageStats = {
		total_languages: 0,
		total_size : 0,
		languages: {},
	};

	//Get Public Repos of the user 
	try{
	const repos = await getPublicRepos(username);

	//Aggregate language data from each repository
	for(const repo of repos){
		const languagesURL = repo?.languages_url;
		if(!languagesURL)
			continue;
		
		const response = await axios.get(languagesURL , {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
		});

		const languages = response.data;
		for(const [lang, count] of Object.entries(languages)){
			if(typeof count === "number"){
				languageStats.total_size += count;

				if(lang in languageStats.languages){
					languageStats.languages[lang][0] += count;
				} else {
					languageStats.languages[lang] = [count, "0"];
				}
			}
		}	
	}

	//Set total languages count
	languageStats.total_languages = Object.keys(languageStats.languages).length;



	// Calculate percentages
	const totalSize = languageStats.total_size;
	for(const lang in languageStats.languages){
		const size = languageStats.languages[lang][0];
		const percentage = totalSize > 0 ? (size / totalSize) * 100 : 0;
		languageStats.languages[lang][1] = (percentage.toFixed(2) + "%");
	}
	}catch(err){

		console.log(err)
		if (axios.isAxiosError(err) && err.response) {
			throw new appError(err.response.status, `Failed to fetch language data`);
		}else {
			throw new appError(500, `An error occurred while fetching language data`);
		}
	}

	// SORT languages by size (descending)
	const sortedLanguages = Object.fromEntries(
	Object.entries(languageStats.languages)
		.sort((a, b) => b[1][0] - a[1][0]) // compare by size
	);

	// replace with sorted object
	languageStats.languages = sortedLanguages;

	//Set cache 
	await client.set(cacheKey, JSON.stringify(languageStats), {
		EX: 60 * 60, // Cache for 1 hour
	});
	
	return languageStats;
}


export {getLanguageStats , LanguageStats};
