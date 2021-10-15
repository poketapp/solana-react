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
	await completeTask('Solana Task', '43.64923567146637', '-79.38407500836685', '250', 'Fill up pothole at lat/long 78.1, 77.0!', completedBy);

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
	await checkProgram('Mapping Potholes', '43.64923567146637', '-79.38407500836685', '250', 'This is a test task for the Solana Hackathon');

	// console.log('Creating Task');
	await createTask('Mapping Potholes', '43.64923567146637', '-79.38407500836685', '250', 'This is a test task for the Solana Hackathon');

	console.log('Reading Task');
	const task = await readTask();
	return task;
}
// main().then(
// 	() => process.exit(),
// 	err => {
// 		console.error(err);
// 		process.exit(-1);
// 	},
// );
