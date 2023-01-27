// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


function getIndexOfNewCursorPosition(
	textDocument: vscode.TextDocument,
	functionName: string
): Array<number> {
	const lineCount: number = textDocument.lineCount;

	for (let i=0; i < lineCount; i++) {
		const lineInfo: vscode.TextLine = textDocument.lineAt(i);
		const lineText: string = lineInfo.text;

		if (!lineText.includes('def ') || lineInfo.isEmptyOrWhitespace) {
			continue;
		}

		const startOfArguments: string | undefined = lineText.split('(').at(-1);
		if (!startOfArguments) {
			continue;
		}

		const listOfArguments: string[] = startOfArguments.split(')')[0].split(',');
		const filtredList: Array<string> = listOfArguments
			.filter(
				item => item
					.trim()
					.split('=')[0]
					.split(':')[0] === functionName
				);

		if (filtredList.length > 0) {
			continue;
		}

		const indexOfFunctionStart: number = lineText.indexOf(functionName);
		if (indexOfFunctionStart > 0) {
			return [i, indexOfFunctionStart];
		}
	}
	return [-1, -1];
}


function moveCursorToNewPosition (
	editor: vscode.TextEditor,
	linePosition: number,
	cursorPosition: number
):void {
	const newPosition: vscode.Position = new vscode.Position(linePosition, cursorPosition);
	const newRange: vscode.Range = new vscode.Range(newPosition, newPosition);
	editor.selection =  new vscode.Selection(
		newPosition, 
		newPosition
	);
	editor.revealRange(newRange);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pytest-fixture-helper.moveToFixture', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showErrorMessage('Please open a project folder first');
		}
	
		const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
	
		const language: string = editor.document.languageId;
		if (language !== 'python') {
			return;
		}

		const functionName: string = editor.document.getText(editor.selection);
		const lineWithFunctionName: string = editor.document.lineAt(editor.selection.start.line).text;
		const isDunctionDeclarated: string = lineWithFunctionName.split(' ')[0].trim();
		const functionArgumentsDirty: string[] = lineWithFunctionName.split('(')[1].split(')')[0].split(',');
		const functionArgumentsClean: string[] = functionArgumentsDirty.map(
			(item: string): string => item.split('=')[0].split(':')[0].trim()
		);

		if (!functionArgumentsClean.includes(functionName) && !isDunctionDeclarated) {
			return;
		}

		let [
			newLinePosition,
			newCursorPosition
		]: number[] = getIndexOfNewCursorPosition(editor.document, functionName);

		if (newLinePosition !== -1 || newCursorPosition !== -1) {
			moveCursorToNewPosition(editor, newLinePosition, newCursorPosition);
			return;
		}

		const filePath: string = editor.document.fileName;
		if (!filePath) {
			return;
		}
		
		const rootFolder = vscode.workspace.workspaceFolders[0].uri
			.toString()
			.split(':')[1]
			.split('/')
			.at(-1);
		const newFilePathList: string[] = filePath.split('/');

		while (rootFolder !== newFilePathList.at(-1)) {
			newFilePathList.splice(-1);
			const newFilePath: string = newFilePathList.join('/') + '/conftest.py';

			try {
				const doc: vscode.TextDocument = await vscode.workspace.openTextDocument(newFilePath);
				[newLinePosition, newCursorPosition] = getIndexOfNewCursorPosition(doc, functionName);

				if (newLinePosition !== -1 || newCursorPosition !== -1) {
					await vscode.window.showTextDocument(doc);
					const newEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
					
					if (!newEditor) {
						return;
					}
					
					moveCursorToNewPosition(newEditor, newLinePosition, newCursorPosition);
					return;
				}
			} catch (e) {
				continue;
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
