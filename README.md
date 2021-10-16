# Solana Hackathon - MapTask Responder App

This project is one of two parts - this part reads "tasks" from the solana blockchain and completes them to receive rewards. The sister repo that creates tasks is at https://github.com/poketapp/solana-hackathon-2021.


The project comprises of:

* An on-chain program to record location-based task completion on the solana blockchain
* A mobile-friendly client to view location-based tasks and complete them and submit data back tot the blockchain
## Quick Start

The following dependencies are required to build and run this example, depending
on your OS, they may already be installed:

- Install node (v14 recommended)
- Install npm
- Install the latest Rust stable from https://rustup.rs/
- Install Solana v1.7.11 or later from
  https://docs.solana.com/cli/install-solana-cli-tools

If this is your first time using Rust, these [Installation
Notes](README-installation-notes.md) might be helpful.



### Configure CLI

> If you're on Windows, it is recommended to use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to run these commands

1. Set CLI config url to localhost cluster

```bash
solana config set --url localhost
```

2. Create CLI Keypair

If this is your first time using the Solana CLI, you will need to generate a new keypair:

```bash
solana-keygen new
```

### Start local Solana cluster

This example connects to a local Solana cluster by default.

Start a local Solana cluster:
```bash
solana-test-validator
```
> **Note**: You may need to do some [system tuning](https://docs.solana.com/running-validator/validator-start#system-tuning) (and restart your computer) to get the validator to run

Listen to transaction logs:
```bash
solana logs
```

### Install npm dependencies

```bash
yarn
```

### Build the on-chain program

```bash
npm run build:program-rust
```

### Deploy the on-chain program

```bash
solana program deploy dist/program/helloworld.so
```

### Run the JavaScript client
In the solana-react folder, run
```bash
yarn dev
```
