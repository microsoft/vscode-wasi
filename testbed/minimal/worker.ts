/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as fs from 'fs';
import * as path from 'path';
import { parentPort  } from 'worker_threads';

import { ClientConnection, Requests } from 'vscode-sync-rpc/node';
import { ApiClient } from 'vscode-sync-api-client';
import { WASI } from 'vscode-wasi/node';


if (parentPort === null) {
	process.exit();
}

const connection = new ClientConnection<Requests>(parentPort);
connection.serviceReady().then(async () => {
	const name = 'WASI Minimal Example';
	const apiClient = new ApiClient(connection);
	const wasi = WASI.create(name, apiClient, { argv: ['Dirk', 'Bäumer'], env: { HOME: '/home/dbaeumer' } });
	const wasmFile = path.join(__dirname, '../rust/target/wasm32-wasi/debug/minimal.wasm');
	const binary = fs.readFileSync(wasmFile);
	const { instance } = await WebAssembly.instantiate(binary, {
		wasi_snapshot_preview1: wasi
	});
	wasi.initialize((instance.exports.memory as WebAssembly.Memory).buffer);
	(instance.exports.main as Function)();

}).catch(console.error);