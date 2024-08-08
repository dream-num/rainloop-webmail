/* eslint-disable no-console */
const fs = require('fs');
const path = require('path'); // Add this line to import the 'path' module
const { config } = require('./config');
const copyFileSync = (source, target) => {
	var targetFile = target;

	// If target is a directory, a new file with the same name will be created
	if (fs.existsSync(target)) {
		if (fs.lstatSync(target).isDirectory()) {
			targetFile = path.join(target, path.basename(source));
		}
	}

	fs.writeFileSync(targetFile, fs.readFileSync(source));
};
copyFileSync('univer/univer.css', config.paths.staticCSS + 'univer.css');
copyFileSync('univer/collaboration-client.css', config.paths.staticCSS + 'collaboration-client.css');

copyFileSync('univer/collaboration-client.js', config.paths.staticJS + 'collaboration-client.js');
copyFileSync('univer/collaboration.js', config.paths.staticJS + 'collaboration.js');
copyFileSync('univer/create-univer.js', config.paths.staticJS + 'create-univer.js');
copyFileSync('univer/en-US.js', config.paths.staticJS + 'en-US.js');
copyFileSync('univer/lodash.js', config.paths.staticJS + 'lodash.js');
copyFileSync('univer/univer.full.umd.js', config.paths.staticJS + 'univer.full.umd.js');
copyFileSync('univer/exchange-client.js', config.paths.staticJS + 'exchange-client.js');

// ANSI 转义码，用于绿色文本
const greenText = '\x1b[32m%s\x1b[0m';
console.log(greenText, 'All Univer files copied successfully!');
