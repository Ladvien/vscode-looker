
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Keytar } from './utils/keytar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let keytar = Keytar.tryCreate();
	console.log(keytar);

	console.log('Congratulations, your extension "looker" is now active!');


	let disposable = vscode.commands.registerCommand('looker.sayHello', () => {
		vscode.window.showInformationMessage('asdasd World!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
