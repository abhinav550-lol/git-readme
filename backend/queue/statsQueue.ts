import { Queue } from 'bullmq';
import { connection } from './queueRedisConnect.js';

/***
 * This handles fetching language and contribution stats for user in background
 * job_types : "get-contribution-stats" , "get-language-stats"
 */
export const statsQueue = new Queue('statsQueue', { connection });

const options = {
	attempts: 3,
	backoff: { type: 'exponential' as const, delay: 1000 },
	delay: 1000,     
	removeOnComplete: true,
}

export async function addJobs(taskType : string, username : string ){
	await statsQueue.add(taskType , {username} , {...options, jobId : `${taskType}-${username}`});
}
