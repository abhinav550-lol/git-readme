import axios from "axios";
import appError from "../error/appError.js";
import { getPublicRepos } from "./githubUtils.js";


interface LanguagesInterface {
  total_languages: number;
  total_size: number;
  languages: Record<string, [number, string]>; //LANG_NAME , {size : number, percentage : number}
}

export {LanguagesInterface};



/** Retrieves language statistics for a given GitHub username */
async function getLanguageStats(username : string) : Promise<LanguagesInterface> {
	const languageStats: LanguagesInterface = {
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

	return languageStats;
}

export {getLanguageStats};
