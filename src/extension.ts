import * as vscode from 'vscode';
import * as fs from 'fs';
import * as glob from 'glob';
import { Keytar } from './utils/keytar';
import Axios from 'axios';
import { resolve } from 'dns';

var lookerId = '';
var lookerSecret = '';
var lookerServerUrl = '';
var lookerServerPort = '';
var lookerAccessToken = '';

// TODO: Move constants to package.json.
const serviceKey = 'Looker';
const accountKey = 'Id';
const secretKey = 'Secret';
const lookerUrlKey = 'Looker Server URL';
const lookerServerPortKey = 'Looker Server Port';

export function activate(context: vscode.ExtensionContext) {
	
	var apiReady = false;
	
	const options = {};
	glob(`${vscode.workspace.rootPath}/**/*.view.lkml`, options, function (err: any, files: any) {
		findAllFieldNamesInWorkspace(files).then(result => {
			console.log(result);
		});
		// TODO: Should errors be handled? Maybe Unix.
  	});

	vscode.window.showInformationMessage('Welcome good Looker!');
	
	// Retrieve API credentials, if stored.
	getLookerAPICredentials().then((result: any) => {
		vscode.window.showInformationMessage(result['success']);
		apiReady = true;
	}).catch((reason) => {
		vscode.window.showErrorMessage(reason['error']);
	});

	// Commands
	let savePassword = vscode.commands.registerCommand('looker.savePassword', async () => {

		await storeCredentials(serviceKey, accountKey).then((value: any) =>{
			if (value['success']) {
				vscode.window.showInformationMessage(value['success']);
			}
		}).catch((reason) => {
			vscode.window.showErrorMessage(reason['error']);
		});
		await storeCredentials(serviceKey, secretKey).then((value: any) => {
			if (value['success']) {
				vscode.window.showInformationMessage(value['success']);
			}
		}).catch((reason) => {
			vscode.window.showErrorMessage(reason['error']);
		});
		await storeCredentials(serviceKey, lookerUrlKey).then((value: any) => {
			if (value['success']) {
				vscode.window.showInformationMessage(value['success']);
			}
		}).catch((reason) => {
			vscode.window.showErrorMessage(reason['error']);
		});
		await storeCredentials(serviceKey, lookerServerPortKey).then((value: any) => {
			if (value['success']) {
				vscode.window.showInformationMessage(value['success']);
			}
		}).catch((reason) => {
			vscode.window.showErrorMessage(reason['error']);
		});
		getLookerAPICredentials().then((result: any) => {
			vscode.window.showInformationMessage(result['success']);
			apiReady = true;
		}).catch((reason) => {
			vscode.window.showErrorMessage(reason['error']);
		});
	});

	// TODO: Move to separate class.
	let apiLogin = vscode.commands.registerCommand('looker.apiLogin', async () => {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			},
			params: {
				'client_id': lookerId, 
				'client_secret': lookerSecret				
			}
		};
		const data = {
			'client_id': lookerId, 
			'client_secret': lookerSecret
		};
		let url = `${lookerServerUrl}:${lookerServerPort}/api/3.1/login`;
		Axios.post(url, undefined, config).then((response) => {
			lookerAccessToken = response['data']['access_token'];
			vscode.window.showInformationMessage('Login succesful.');
		}).catch((reason) => {
			vscode.window.showErrorMessage('Unable to login to Looker API.');
		});
	});

	context.subscriptions.push(savePassword, apiLogin);
}

function storeCredentials(servcice: string, credentialType: string) {
	return new Promise(function(resolve, reject) {
		let keytar = Keytar.tryCreate();

		let options: vscode.InputBoxOptions = {
			'prompt': `Please enter your Looker API ${credentialType}`,
			'password': true,
			'placeHolder': `Looker API ${credentialType}...`,
			'ignoreFocusOut': true
		};

		vscode.window.showInputBox(options).then(async value => {
			if (keytar) {
				if (value) {
					await keytar.setPassword(servcice, credentialType, value);
					resolve({'success': `Looker ${credentialType} stored succesfully.`});
				} else {
					reject({'error': `Could not store ${credentialType}`});
				}
			} else {
				reject({'error': 'Keytar not found.  Unable to securely manage API credentials.'});
			}
		});
	});		
}

function getLookerAPICredentials() {
	return new Promise(async function(resolve, reject) {
		let keytar = Keytar.tryCreate();
		if (keytar){
			await keytar.getPassword(serviceKey, accountKey).then((result) => {
				lookerId = result || '';
				if (lookerId === '') {
					reject({'error': 'Unable to retrieve Looker API Id.'});
				}
			});
			await keytar.getPassword(serviceKey, secretKey).then((result) => {
				lookerSecret = result || '';
				if (lookerSecret === '') {
					reject({'error': 'Unable to retrieve Looker API Secret.'});
				}
			});
			await keytar.getPassword(serviceKey, lookerUrlKey).then((result) => {
				lookerServerUrl = result || '';
				if (lookerServerUrl === '') {
					reject({'error': 'Unable to retrieve Looker API Secret.'});
				}
			});
			await keytar.getPassword(serviceKey, lookerServerPortKey).then((result) => {
				lookerServerPort = result || '';
				if (lookerServerPort === '') {
					reject({'error': 'Unable to retrieve Looker API Secret.'});
				}
			});
			resolve({'success': 'Found Looker API credentials in keychain.'});
		}
	});
		
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function findAllFieldNamesInWorkspace(filePaths: string[]) {
	return new Promise(async function(resolve, reject) {
		var fields: String[] = [];
		for (const filePath of filePaths) {
			await readFile(filePath, fields);
		}
		resolve(fields);
	});	
}

function readFile(filePath: string, fields: String[]) {
	return new Promise(async function(resolve, reject) {
		
		fs.readFile(filePath, 
			'utf-8',
			await function read(err, data) {

				if (err) {
					throw err;
				}
				let lines = data.split('\n');
				for (const line of lines) {
					if (line.includes('measure:') || line.includes('dimension:') || line.includes('filter:') || line.includes('parameter:')) {
						var field = line.substring(line.indexOf(':') + 1, line.indexOf('{') - 1).trim();
						field = field.replace('[^a-zA-Z0-9_-]g','');
						fields.push(field);
					}
				}
				resolve(fields);
			});
	});
}