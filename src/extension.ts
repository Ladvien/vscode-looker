import * as vscode from 'vscode';
import { Keytar } from './utils/keytar';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "looker" is now active!');

	let savePassword = vscode.commands.registerCommand('looker.savePassword', async () => {

		// TODO: Move constants to package.json.
		await storeCredentials('Looker', 'Id').then((value: any) =>{
			if (value['success']) {
				vscode.window.showInformationMessage(value['success']);
			} else {
				vscode.window.showErrorMessage(value['error']);
			}
		});
		await storeCredentials('Looker', 'Secret').then((value: any) => {
			if (value['success']) {
				vscode.window.showInformationMessage(value['success']);
			} else {
				vscode.window.showErrorMessage(value['error']);
			}
		});
	});

	context.subscriptions.push(savePassword
						  );
}

function storeCredentials(servcice: string, credentialType: string) {
	return new Promise(function(resolve, reject) {
		let keytar = Keytar.tryCreate();

		let options: vscode.InputBoxOptions = {
			'prompt': `Please enter your Looker API ${credentialType}`,
			'password': true,
			'placeHolder': `Looker API ${credentialType}...`
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

// this method is called when your extension is deactivated
export function deactivate() {}
