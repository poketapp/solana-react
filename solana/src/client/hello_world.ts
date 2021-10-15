/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
	Keypair,
	Connection,
	PublicKey,
	LAMPORTS_PER_SOL,
	SystemProgram,
	TransactionInstruction,
	Transaction,
	sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import * as BufferLayout from '@solana/buffer-layout';

import { getPayer, getRpcUrl, createKeypairFromFile, toBuffer } from './utils';

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

/**
 * Hello world's program id
 */
let programId: PublicKey;

/**
 * The public key of the account we are saying hello to
 */
let taskPubkey: PublicKey;

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'helloworld.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'helloworld-keypair.json');

/* 
 * The state of task managed by the program
 */
export class Task {
	name = 'Test task';
	lat = '123';
	lng = '124';
	points = "100";
	desc = 'this is a long description';
	completedBy = '00000000000000000000000000000000000000000000';


	constructor(fields: { name: string, lat: string, lng: string, points: string, desc: string, completedBy: string }) {
		if (fields) {
			this.name = fields.name;
			this.lat = fields.lat;
			this.lng = fields.lng;
			this.points = fields.points;
			this.desc = fields.desc;
			this.completedBy = fields.completedBy;
		}
	}

}

/**
 * Borsh schema definition for greeting accounts
 */
const TaskSchema = new Map([
	[Task, { kind: 'struct', fields: [['name', 'String'], ['lat', 'String'], ['lng', 'String'], ['points', 'String'], ['desc', 'String'], ['completedBy', 'String']] }],
]);

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
	const rpcUrl = await getRpcUrl();
	connection = new Connection(rpcUrl, 'confirmed');
	const version = await connection.getVersion();
	console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
	let fees = 0;

	let TASK_SIZE = 0;
	if (!payer) {
		const { feeCalculator } = await connection.getRecentBlockhash();

		// Calculate the cost to fund the greeter account
		fees += await connection.getMinimumBalanceForRentExemption(TASK_SIZE);

		// Calculate the cost of sending transactions
		fees += feeCalculator.lamportsPerSignature * 100; // wag

		payer = await getPayer();
	}

	let lamports = await connection.getBalance(payer.publicKey);
	if (lamports < fees) {
		// If current balance is not enough to pay for fees, request an airdrop
		const sig = await connection.requestAirdrop(
			payer.publicKey,
			fees - lamports,
		);
		await connection.confirmTransaction(sig);
		lamports = await connection.getBalance(payer.publicKey);
	}

	console.log(
		'Using account',
		payer.publicKey.toBase58(),
		'containing',
		lamports / LAMPORTS_PER_SOL,
		'SOL to pay for fees',
	);
}

/**
 * Check if the BPF program has been deployed
 */
export async function checkProgram(name: string, lat: string, lng: string, points: string, desc: string): Promise<void> {
	// Read program id from keypair file
	try {
		const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
		programId = programKeypair.publicKey;
	} catch (err) {
		const errMsg = (err as Error).message;
		throw new Error(
			`Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``,
		);
	}

	// Check if the program has been deployed
	const programInfo = await connection.getAccountInfo(programId);
	if (programInfo === null) {
		if (fs.existsSync(PROGRAM_SO_PATH)) {
			throw new Error(
				'Program needs to be deployed with `solana program deploy dist/program/helloworld.so`',
			);
		} else {
			throw new Error('Program needs to be built and deployed');
		}
	} else if (!programInfo.executable) {
		throw new Error(`Program is not executable`);
	}
	console.log(`Using program ${programId.toBase58()}`);


	// Derive the address (public key) of a task account from the program so that it's easy to find later. 
	let SEED = ""; //[name, lat, lng].join("");

	taskPubkey = await PublicKey.createWithSeed(
		payer.publicKey,
		SEED,
		programId,
	);


	let TASK_SIZE = borsh.serialize(TaskSchema, new Task({ name: name, lat: lat, lng: lng, points: points, desc: desc, completedBy: '00000000000000000000000000000000000000000000' })).length;

	// Check if the task account has already been created
	const taskAccount = await connection.getAccountInfo(taskPubkey);
	if (taskAccount === null) {
		console.log(
			'Creating task',
			taskPubkey.toBase58(),
			'with details: ',
			SEED
		);
		const lamports = await connection.getMinimumBalanceForRentExemption(
			TASK_SIZE,
		);


		const transaction = new Transaction().add(
			SystemProgram.createAccountWithSeed({
				fromPubkey: payer.publicKey,
				basePubkey: payer.publicKey,
				seed: SEED,
				newAccountPubkey: taskPubkey,
				lamports,
				space: TASK_SIZE,
				programId,
			}),
		);
		await sendAndConfirmTransaction(connection, transaction, [payer]);
	}
}

/*
 * Create task
 */

export async function createTask(name: string, lat: string, lng: string, points: string, desc: string): Promise<void> {

	let TASK = borsh.serialize(TaskSchema, new Task({ name: name, lat: lat, lng: lng, points: points, desc: desc, completedBy: '00000000000000000000000000000000000000000000' }));

	const instructionData = Buffer.alloc(TASK.length);

	instructionData.fill(TASK);

	const instruction = new TransactionInstruction({
		keys: [{ pubkey: taskPubkey, isSigner: false, isWritable: true }],
		programId,
		data: instructionData,
	});
	await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [payer]);
}


/*
 * Complete Task
 */
export async function completeTask(name: string, lat: string, lng: string, points: string, desc: string, completedBy: string): Promise<void> {

	let addr = completedBy || payer.publicKey.toBase58();
	let TASK = borsh.serialize(TaskSchema, new Task({ name: name, lat: lat, lng: lng, points: points, desc: desc, completedBy: addr }));

	const instructionData = Buffer.alloc(TASK.length);

	instructionData.fill(TASK);

	const instruction = new TransactionInstruction({
		keys: [{ pubkey: taskPubkey, isSigner: false, isWritable: true }],
		programId,
		data: instructionData,
	});
	await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [payer]);
}


/**
 * Get the task from on-chain
 */
export async function readTask(): Promise<Task> {
	const taskInfo = await connection.getAccountInfo(taskPubkey);
	if (taskInfo === null) {
		throw 'Error: cannot find the task account';
	}
	console.log('task is');
	console.log(taskInfo.data.length);
	const task = borsh.deserializeUnchecked(TaskSchema, Task, taskInfo.data);
	console.log(taskPubkey.toBase58(), 'is', task);
	return task;
}
