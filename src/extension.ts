// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


function getIndexOfNewCursorPosition(editor: vscode.TextEditor): Array<number> {
	const selection = editor.selection;
	const functionName = editor.document.getText(selection);

	const lineCount = editor.document.lineCount;

	for (let i=0; i < lineCount; i++) {
		const lineInfo = editor.document.lineAt(i);
		const lineText = lineInfo.text;

		if (!lineText.includes('def ') || lineInfo.isEmptyOrWhitespace) {
			continue;
		}

		const startOfArguments = lineText.split('(').at(-1);
		if (!startOfArguments) {
			continue;
		}
		const listOfArguments = startOfArguments.split(')')[0].split(',');
		const filtredList = listOfArguments.filter(item => item.trim().split('=')[0].split(':')[0] === functionName);
		if (filtredList.length > 0) {
			continue;
		}

		const indexOfFunctionStart = lineText.indexOf(functionName);
		if (indexOfFunctionStart > 0) {
			return [i, indexOfFunctionStart];
		}
	}
	return [-1, -1];
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pytest-fixture-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pytest-fixture-helper.moveToFixture', async () => {
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

		const [newLinePosition, newCursorPosition] = getIndexOfNewCursorPosition(editor);

		if (newLinePosition !== -1 || newCursorPosition !== -1) {
			const newPosition = new vscode.Position(newLinePosition, newCursorPosition);
			const newRange = new vscode.Range(newPosition, newPosition);
			editor.selection =  new vscode.Selection(
				newPosition, 
				newPosition
			);
			editor.revealRange(newRange);
		}

		const filePath = editor.document.fileName;
		
		const folderPath = vscode.workspace.workspaceFolders[0].uri
			.toString()
			.split(':')[1];
		
		let success = await vscode.commands.executeCommand('vscode.openFolder', filePath.split('/').pop().join('/'));
		vscode.window.showInformationMessage('Path is ' + vscode.workspace.workspaceFolders);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
