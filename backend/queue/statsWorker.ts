import { Worker } from 'bullmq';
import { connection } from './queueRedisConnect.js';
import { getLanguageStats, LanguagesInterface } from '../github/getLanguageStats.js';
import User from '../models/UserModel.js';
import appError from '../error/appError.js';
import getUserContributions from '../github/getContributionStats.js';
import { redisClient } from '../cache/redisConnect.js';
import { console } from 'inspector/promises';

const workerFunctions = {
	getContributionStats: async (username: string , githubId: string) => {
		const contributionsData = await getUserContributions(username);
		const user  = await User.findByGithubId(githubId);
		
		if(!user){
			console.warn(`User with GitHub ID ${githubId} not found in database. Cannot update contribution stats.`);
			throw new appError(404, "User not found in database. (Contribution stats update failed)");
		}

		//Changes made in MONGODB
		user.userGithubData.contributionsStats = {
			data : contributionsData,
			updatedAt : new Date()
		} 

		await user.save();

		//Change in redis cache
		const key = `contribution_stats:${username}`;
		const cachedData = await redisClient.get(key);
		if(cachedData){
			await redisClient.del(key); 

			await redisClient.set(key, JSON.stringify(contributionsData), {
				EX: 60 * 3 * 60 //3 hours
			});

			console.log(`Redis cache updated for contribution stats of user ${username}`);
		} else {
			console.log(`No existing Redis cache for contribution stats of user ${username}. Cache set with fresh data.`);
		}
		
		console.log(`Contribution stats updated for user ${username} (GitHub ID: ${githubId})`);

	},
	getLanguageStats: async (username: string , githubId: string) => {
		const languageStats : LanguagesInterface = await getLanguageStats(username);
		//Changes made in MONGODB
		const user  = await User.findByGithubId(githubId);
		
		if(!user){
			console.warn(`User with GitHub ID ${githubId} not found in database. Cannot update language stats.`);
			throw new appError(404, "User not found in database. (Language stats update failed)");
		}

		user.userGithubData.languagesStats = {
			data : languageStats,
			updatedAt : new Date()
		} 

		await user.save();
	
		//Changes in redis cache
		const key = `language_stats:${username}`;
		const cachedData = await redisClient.get(key);
		if(cachedData){
			await redisClient.del(key); 

			await redisClient.set(key, JSON.stringify(languageStats), {
				EX: 60 * 3 * 60 //3 hours
			});

			console.log(`Redis cache updated for language stats of user ${username}`);
		} else {
			console.log(`No existing Redis cache for language stats of user ${username}. Cache set with fresh data.`);
		}

		console.log(`Language stats updated for user ${username} (GitHub ID: ${githubId})`);
	}
};	

const statsWorker = new Worker(
  'statsQueue', 
  async (job) => {
    console.log(`Processing job ${job.id}:`, job.data);
	switch(job.name){
		case "get-contribution-stats":
			await workerFunctions.getContributionStats(job.data.username , job.data.githubId);
			break;
		case "get-language-stats":
			await workerFunctions.getLanguageStats(job.data.username , job.data.githubId);	
			break;
		default:
			console.warn(`Unknown job type: ${job.name}`);
			break;
	}
   
    return { success: true }; // stored as job.returnvalue
  },
  {
    connection,
    concurrency: 4, 
  }
);

statsWorker.on('completed', (job) => console.log(`✅ Job ${job.id} done`));
statsWorker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err));