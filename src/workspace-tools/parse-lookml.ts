import * as fs from 'fs';
import * as glob from 'glob';

// TODO: Add view: label parsing resulting in field names returned like "customer.id"
// rather than "id".

export class ParseWorkspaceLookmlFiles {
    private constructor() {}

    public static getFieldNames(workspacePath: String) {
        return new Promise((resolve, reject) => {
            const options = {};
            glob(`${workspacePath}/**/*.view.lkml`, options, function (err: any, files: any) {
                findAllFieldNamesInWorkspace(files).then(result => {
                    resolve(result);
                });
                // TODO: Should errors be handled? Maybe Unix.
              });            
        });
    }
}

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