import * as fs from 'fs';
import * as glob from 'glob';

export interface LookmlField {
	name: String;
	type: String;
	viewName: String;
	fileName: String;
	lineNumber: Number;
}

export interface LookmlView {
	name: String;
	fields: LookmlField[];
	fileName: String;
	lineNumber: Number;
}

export interface LookmlExplore {
	name: String;
	fields: LookmlField[];
	fileName: String;
	lineNumber: Number;
}

export enum LookmlParentType {
	unknown,
	view,
	explore
}


// TODO: Add view: label parsing resulting in field names returned like "customer.id"
// rather than "id".

export class LookML {

	public views: LookmlView[] = [];
	public explores: LookmlExplore[] = [];

    public constructor() {}
    public parseWorkspaceLookmlFiles(workspacePath: String) {
		let self = this;
        return new Promise((resolve, reject) => {
            const options = {};
            glob(`${workspacePath}/**/*.view.lkml`, options, function (err: any, files: any) {
                self.findAllFieldNamesInWorkspace(files).then(result => {
					// Debugging output.
					// fs.writeFile("./view.json", JSON.stringify(self.views, undefined, 4), {mode: 0o777, flag: 'w+' }, (err) => {
					// 	if (err) {
					// 		console.error(err);
					// 		return;
					// 	}
					// 	console.log("File has been created");
					// });
                    resolve(); // TODO: Return number found to let user know if succesful.
                });
                // TODO: Should errors be handled? Maybe Unix.
              });            
        });
	}

	private async findAllFieldNamesInWorkspace(filePaths: string[]) {
		let self = this;
		return new Promise(async function(resolve, reject) {
			for (const filePath of filePaths) {
				await self.readFile(filePath);
			}
			resolve();
		});	
	}
	
	private readFile(filePath: string) {
		let self = this;
		return new Promise(async function(resolve, reject) {
			fs.readFile(filePath, 
				'utf-8',
				await function read(err, data) {
					if (err) {
						throw err;
					}
					let lines = data.split('\n');

					// TODO: Switch view name
					// TODO: Use interface objects
					// TODO: Check for explores and joins.
					// TODO: Add dimension_groups and subs

					var filename = filePath.replace(/^.*[\\\/]/, '');
					let parentType: LookmlParentType = LookmlParentType.unknown;

					let view: LookmlView = {
						'name': 'unknown',
						'fields': [],
						'fileName': '',
						'lineNumber': 0,
					};
					let explore: LookmlExplore = {
						'name': 'unknown',
						'fields': [],
						'fileName': '',
						'lineNumber': 0,
					};
					
					for (var i in lines) {
						// If commented field, skip it.
						let line = lines[i].trim();
						if (line[0] === '#' || (line[0] === '/' && line[1] === '/')) { continue ;}
						
						// Determine if save to explores or views.
						if (line.includes('view:')) {
							parentType = LookmlParentType.view;
							view = {
								'name': self.extractName(line),
								'fields': [],
								'fileName': filename,
								'lineNumber': Number(i)
							};
							continue;
						} else if (line.includes('explore:')) {
							explore = {
								'name': self.extractName(line),
								'fields': [],
								'fileName': filename,
								'lineNumber': Number(i)
							};		
							parentType = LookmlParentType.explore;
							continue;
						}
						if (line.includes('measure:') || line.includes('dimension:') || line.includes('filter:') 
						 || line.includes('parameter:') || line.includes('join:')) {
							let lookmlField: LookmlField = {
								'name': self.extractName(line),
								'type': self.extractType(line),
								'lineNumber': Number(i),
								'viewName': view.name,
								'fileName': filename
							};
							switch (parentType) {
								case LookmlParentType.explore:
									explore.fields.push(lookmlField);
									break;
								case LookmlParentType.view:
									view.fields.push(lookmlField);
									break;
								case LookmlParentType.unknown:
									console.log('CRAP! LookmlParentType is "unknown."');
									break;
								default:
									break;
							}
						}
					} // End lines loop
					if (view.name !== 'unknown') {
						self.views.push(view);
					}
					if (explore.name !== 'unknown') {
						self.explores.push(explore);
					}
					resolve();
				});
		});
	}

	private extractName(line: string) {
		var fieldName = line.substring(line.indexOf(':') + 1, line.indexOf('{') - 1).trim();
		fieldName = fieldName.replace('[^a-zA-Z0-9_]g','');
		return fieldName;
	}
	private extractType(line: string) {
		var type = line.split(':')[0];
		type = type.replace('[^a-zA-Z0-9_]g','').trim();
		return type;
	}
}

