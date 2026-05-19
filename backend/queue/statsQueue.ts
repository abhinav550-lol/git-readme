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
	removeOnFail: true,
}

await statsQueue.clean(0, 1000, "failed");
console.log("Cleaned failed jobs from the queue");	

export async function addJobs(taskType : string, username : string , githubId : string){
	console.log(`Adding job to queue: ${taskType} for user ${username} (GitHub ID: ${githubId})`);
	await statsQueue.add(taskType , {username, githubId} , {...options, jobId : `${taskType}-${username}`});
}

export async function doesJobExist(taskType : string, username : string) : Promise<boolean>{
	const jobId = `${taskType}-${username}`;
	const job = await statsQueue.getJob(jobId);

	console.log(job)
	return !!job;
}

export async function getJob(taskType : string, username : string){
	const jobId = `${taskType}-${username}`;
	const job = await statsQueue.getJob(jobId);
	return job;
}