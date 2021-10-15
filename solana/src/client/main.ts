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
	await completeTask('Pothole', '43.65604614887085', '-79.38016603758616', '100', 'Near Yonge & Dundas', completedBy);

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
	await checkProgram('Pothole', '43.65604614887085', '-79.38016603758616', '100', 'Near Yonge & Dundas');

	// // console.log('Creating Task');
	// await createTask('Mapping Potholes', '43.649235671', '-79.3840750083', '100', 'This is a test task for the Solana Hackathon');

	console.log('Reading Task');
	const task = await readTask();
	return task;
}