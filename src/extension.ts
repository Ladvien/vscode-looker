import * as vscode from 'vscode';
import * as fs from 'fs';
import * as glob from 'glob';
import Axios from 'axios';
import { ParseWorkspaceLookmlFiles } from './workspace-tools/parse-lookml';
import { LookerServices, LookerApiCredentials, LookerCredentialKeys } from './looker-api/looker-services';

export function activate(context: vscode.ExtensionContext) {
	
	let looker = new LookerServices();
	var fields;
	
	ParseWorkspaceLookmlFiles.getFieldNames(vscode.workspace.rootPath || '').then((result) =>{
		fields = result;
		// TODO: Add fields to intellisense.
		// TODO: "Peek to"
	});
	
	vscode.window.showInformationMessage('Welcome good Looker!');
	
	// Retrieve API credentials, if stored.
	looker.getLookerAPICredentials().then((result: any) => {
		vscode.window.showInformationMessage(result['success']);
	}).catch((reason) => {
		vscode.window.showErrorMessage(reason['error']);
	});

	// Commands
	let savePassword = vscode.commands.registerCommand('looker.savePassword', async () => {
		const apiCredentials: LookerApiCredentials = { 
														'lookerId': '',
														'lookerSecret': '',
														'lookerServerUrl': '',
														'lookerServerPort': ''
													};
		await getApiCredentialFromUser(LookerCredentialKeys.accountKey).then((result) => {
			apiCredentials.lookerId = result;
		});
		await getApiCredentialFromUser(LookerCredentialKeys.secretKey).then((result) => {
			apiCredentials.lookerSecret = result;
		});
		await getApiCredentialFromUser(LookerCredentialKeys.lookerUrlKey).then((result) => {
			apiCredentials.lookerServerUrl = result;
		});
		await getApiCredentialFromUser(LookerCredentialKeys.lookerServerPortKey).then((result) => {
			apiCredentials.lookerServerPort = result;
		});
		looker.saveApiCredentials(apiCredentials).then((result) => {
			vscode.window.showInformationMessage(Object(result)['success']);
		}).catch((reason) => {
			vscode.window.showErrorMessage(Object(reason)['error']);
		});
	});

	// TODO: Move to separate class.
	let apiLogin = vscode.commands.registerCommand('looker.apiLogin', async () => {
		// const config = {
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	params: {
		// 		'client_id': lookerId, 
		// 		'client_secret': lookerSecret				
		// 	}
		// };
		// const data = {
		// 	'client_id': lookerId, 
		// 	'client_secret': lookerSecret
		// };
		// let url = `${lookerServerUrl}:${lookerServerPort}/api/3.1/login`;
		// Axios.post(url, undefined, config).then((response) => {
		// 	lookerAccessToken = response['data']['access_token'];
		// 	vscode.window.showInformationMessage('Login succesful.');
		// }).catch((reason) => {
		// 	vscode.window.showErrorMessage('Unable to login to Looker API.');
		// });
	});

	context.subscriptions.push(savePassword, apiLogin);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getApiCredentialFromUser(credentialType: string) {
	return new Promise<String>(async (resolve, reject) => {
		let options: vscode.InputBoxOptions = {
			'prompt': `Please enter your Looker API ${credentialType}`,
			'password': true,
			'placeHolder': `Looker API ${credentialType}...`,
			'ignoreFocusOut': true
		};
	
		await vscode.window.showInputBox(options).then(async value => {
			resolve(value);
		});
	});
}