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
copyFileSync('dev/univer.css', config.paths.staticCSS + 'univer.css');
copyFileSync('dev/collaboration-client.css', config.paths.staticCSS + 'collaboration-client.css');

copyFileSync('dev/collaboration-client.js', config.paths.staticJS + 'collaboration-client.js');
copyFileSync('dev/collaboration.js', config.paths.staticJS + 'collaboration.js');
copyFileSync('dev/create-univer.js', config.paths.staticJS + 'create-univer.js');
copyFileSync('dev/en-US.js', config.paths.staticJS + 'en-US.js');
copyFileSync('dev/lodash.js', config.paths.staticJS + 'lodash.js');
copyFileSync('dev/univer.full.umd.js', config.paths.staticJS + 'univer.full.umd.js');
