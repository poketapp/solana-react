/**
 * Hello world
 */

import {
	establishConnection,
	establishPayer,
	checkProgram,
	createTask,
	completeTask,
	readTask,
	Task,
} from './hello_world';

export async function fetchAndCompleteTask(body: { post?: any; completedBy?: any; }): Promise<Task> {
	console.log("Let's say hello to a Solana account...");

	console.log('Completing task');
	const { completedBy } = body
	await completeTask('Mapping Potholes', '43.649235671', '-79.3840750083', '250', 'Fill up pothole at the location!', completedBy);

	console.log('Reading Task');
	const task = await readTask();
	return task;
}

export async function fetchTask(): Promise<Task> {
	console.log("Let's say hello to a Solana account...");

	// Establish connection to the cluster
	await establishConnection();

	// Determine who pays for the fees
	await establishPayer();


	// Check if the program has been deployed
	await checkProgram('Mapping Potholes', '43.649235671', '-79.3840750083', '250', 'Fill up pothole at the location!');

	// // console.log('Creating Task');
	// await createTask('Mapping Potholes', '43.649235671', '-79.3840750083', '250', 'This is a test task for the Solana Hackathon');

	console.log('Reading Task');
	const task = await readTask();
	return task;
}