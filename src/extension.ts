import * as vscode from 'vscode';
import * as fs from 'fs';
import * as glob from 'glob';
import { LookML } from './workspace-tools/parse-lookml';
import { LookerServices, LookerApiCredentials, LookerCredentialKeys } from './looker-api/looker-services';

export function activate(context: vscode.ExtensionContext) {
	
	vscode.window.showInformationMessage('Welcome good Looker!');
	
	let looker = new LookerServices();
	let lookml = new LookML();
	
	lookml.parseWorkspaceLookmlFiles(vscode.workspace.rootPath || '').then((result) =>{
		// TODO: Add view name
		// TODO: Line number.
		// TODO: Add fields to intellisense.
		// TODO: Peek / Goto
		// TODO: Check result.
	});

	const lookmlProvider = vscode.languages.registerCompletionItemProvider('lookml',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			
			let lineOfInterest = document.lineAt(position);
			let candidateString = lineOfInterest.text.substring(position.character - 2, position.character);
			if (candidateString === '${') {
				let completionItems: vscode.CompletionItem[] = [];
				for (let viewName of lookml.views.map(({ name }) => name)) {
					completionItems.push(new vscode.CompletionItem(String(viewName), vscode.CompletionItemKind.Field));
				}
				return completionItems;
			} else {
				return [];
			}
		}
	},
	'{');


	
	
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

	context.subscriptions.push(savePassword, apiLogin, lookmlProvider);
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