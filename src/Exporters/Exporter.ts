import * as fs from 'fs-extra';

export class Exporter {
	out: number;
	
	constructor() {

	}

	writeFile(file: string) {
		this.out = fs.openSync(file, 'w');
	}

	closeFile() {
		fs.closeSync(this.out);
	}

	p(line: string = '', indent: number = 0) {
		let tabs = '';
		for (let i = 0; i < indent; ++i) tabs += '\t';
		let data = Buffer.from(tabs + line + '\n');
		fs.writeSync(this.out, data, 0, data.length, null);
	}

	copyFile(from: string, to: string) {
		fs.copySync(from, to, { overwrite: true });
	}

	copyDirectory(from: string, to: string) {
		fs.copySync(from, to, { overwrite: true });
	}

	createDirectory(dir: string) {
		fs.ensureDirSync(dir);
	}
}
