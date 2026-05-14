import { Worker } from 'bullmq';
import { connection } from './queueRedisConnect.js';

const workerFunctions = {
	getContributionStats: async (username: string) => {

	},
	getLanguageStats: async (username: string) => {

	}
};	

const statsWorker = new Worker(
  'statsQueue', 
  async (job) => {
    console.log(`Processing job ${job.id}:`, job.data);
	switch(job.name){
		case "get-contribution-stats":
			await workerFunctions.getContributionStats(job.data.username);
			break;
		case "get-language-stats":
			await workerFunctions.getLanguageStats(job.data.username);	
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