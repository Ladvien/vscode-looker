import * as vscode from 'vscode';
import { Keytar } from './utils/keytar';
import { httpsRequest } from './utils/httpRequest';
import { RequestOptions } from 'http';

var lookerId = '';
var lookerSecret = '';
var lookerServerUrl = '';

// TODO: Move constants to package.json.
const serviceKey = 'Looker';
const accountKey = 'Id';
const secretKey = 'Secret';
const lookerUrlKey = 'Looker Server URL';

export function activate(context: vscode.ExtensionContext) {

	var apiReady = false;

	vscode.window.showInformationMessage('Welcome good Looker!');
	console.log(lookerServerUrl);

	const options = {
		hostname: 'encrypted.google.com',
		port: 443,
		path: '/',
		method: 'GET'
	};
	
	// httpsRequest()


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
	});

	context.subscriptions.push(savePassword);
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
			resolve({'success': 'Found Looker API credentials in keychain.'});
		}
	});
		
}

// this method is called when your extension is deactivated
export function deactivate() {}
