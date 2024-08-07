/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const sourceDir = '/home/dushusir/code/test/rainloop-webmail/rainloop/v/0.0.0/';
const targetDir = '/var/www/html/rainloop/rainloop/v/1.17.0/';

// 创建目标目录及其所有父目录（如果不存在）
function ensureDirExistence(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// 递归复制文件
function copyFilesRecursively(source, target) {
	const files = fs.readdirSync(source);

	files.forEach((file) => {
		const sourceFilePath = path.join(source, file);
		const targetFilePath = path.join(target, file);
		const stat = fs.statSync(sourceFilePath);

		if (stat.isDirectory()) {
			// 如果是目录，递归复制
			ensureDirExistence(targetFilePath);
			copyFilesRecursively(sourceFilePath, targetFilePath);
		} else {
			// 如果是文件，直接复制，遇到同名文件覆盖
			fs.copyFileSync(sourceFilePath, targetFilePath);
			console.log(`Copied file from ${sourceFilePath} to ${targetFilePath}`);
		}
	});
}

// 确保目标目录存在
ensureDirExistence(targetDir);

// 开始复制文件
copyFilesRecursively(sourceDir, targetDir);

console.log('All files copied successfully!');
