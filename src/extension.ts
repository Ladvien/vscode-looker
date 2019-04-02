
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Keytar } from './utils/keytar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let keytar = Keytar.tryCreate();

	console.log('Congratulations, your extension "looker" is now active!');

	let disposable = vscode.commands.registerCommand('looker.sayHello', async () => {
		if (keytar) {
			let pass = await keytar.getPassword('service_test', 'account_test');
			console.log(pass);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
