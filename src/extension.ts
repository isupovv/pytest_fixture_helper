// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pytest-fixture-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pytest-fixture-helper.moveToFixture', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showErrorMessage('Please open a project folder first');
		}
	
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
	
		const language = editor.document.languageId;
		if (language !== 'python') {
			return;
		}
		
		const selection = editor.selection;
		const text = editor.document.getText(selection);
		vscode.window.showInformationMessage(text);

		const lineCount = editor.document.lineCount;

		for (let i=0; i < lineCount; i++) {
			const line = editor.document.lineAt(i);
			if (line.text.includes(`def ${text}`)) {
				let range = editor.document.lineAt(i).range;
				editor.selection =  new vscode.Selection(range.start, range.end);
				editor.revealRange(range);
			}
		}
	
		const folderPath = vscode.workspace.workspaceFolders[0].uri
			.toString()
			.split(':')[1];
		
		vscode.window.showInformationMessage('Path is ' + folderPath);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
