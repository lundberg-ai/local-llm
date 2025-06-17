const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

// Model download configurations
const MODELS = {
	'magistral-small-2506.gguf': {
		url: 'https://huggingface.co/mistralai/Magistral-Small-2506_gguf/resolve/main/magistral-small-2506.Q4_K_M.gguf',
		description: 'Magistral Small 2506 - Mid-tier chat model (Mistral AI)',
		size: '~14GB'
	},
	'qwen3-embedding-4b.gguf': {
		url: 'https://huggingface.co/Qwen/Qwen3-Embedding-4B-GGUF/resolve/main/qwen3-embedding-4b.Q4_K_M.gguf',
		description: 'Qwen3 Embedding 4B - Lightweight model for laptops',
		size: '~2.3GB'
	},
	'gemma-3-1b-it-qat-q4_0.gguf': {
		url: 'https://huggingface.co/google/gemma-3-1b-it-qat-q4_0-gguf/resolve/main/gemma-3-1b-it-qat-q4_0.gguf',
		description: 'Gemma 3 1B IT - Ultra-light model for mobile devices (English only)',
		size: '~700MB'
	}
};

const MODELS_DIR = path.join(__dirname, '../models');

async function ensureModelsDirectory() {
	try {
		await access(MODELS_DIR);
	} catch {
		console.log('📁 Creating models directory...');
		await mkdir(MODELS_DIR, { recursive: true });
	}
}

function downloadFile(url, destinationPath, description) {
	return new Promise((resolve, reject) => {
		console.log(`📥 Downloading ${description}...`);
		console.log(`🔗 URL: ${url}`);

		const file = fs.createWriteStream(destinationPath);
		let downloadedBytes = 0;

		https.get(url, (response) => {
			if (response.statusCode === 302 || response.statusCode === 301) {
				// Handle redirects
				file.close();
				fs.unlinkSync(destinationPath);
				return downloadFile(response.headers.location, destinationPath, description)
					.then(resolve)
					.catch(reject);
			}

			if (response.statusCode !== 200) {
				file.close();
				fs.unlinkSync(destinationPath);
				return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
			}

			const totalBytes = parseInt(response.headers['content-length'], 10);

			response.on('data', (chunk) => {
				downloadedBytes += chunk.length;
				if (totalBytes) {
					const progress = ((downloadedBytes / totalBytes) * 100).toFixed(1);
					process.stdout.write(`\r📊 Progress: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(1)}MB / ${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
				}
			});

			response.pipe(file);

			file.on('finish', () => {
				file.close();
				console.log(`\n✅ Downloaded ${description} successfully!`);
				resolve();
			});

			file.on('error', (err) => {
				file.close();
				fs.unlinkSync(destinationPath);
				reject(err);
			});
		}).on('error', (err) => {
			file.close();
			fs.unlinkSync(destinationPath);
			reject(err);
		});
	});
}

async function checkExistingModel(filename, description) {
	const filePath = path.join(MODELS_DIR, filename);
	try {
		await access(filePath);
		const stats = fs.statSync(filePath);
		console.log(`✅ ${description} already exists (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
		return true;
	} catch {
		return false;
	}
}

async function downloadModel(filename, config) {
	const exists = await checkExistingModel(filename, config.description);
	if (exists) {
		return;
	}

	const destinationPath = path.join(MODELS_DIR, filename);

	try {
		await downloadFile(config.url, destinationPath, config.description);
	} catch (error) {
		console.error(`❌ Failed to download ${config.description}:`, error.message);

		// Clean up partial download
		try {
			fs.unlinkSync(destinationPath);
		} catch { }

		throw error;
	}
}

async function main() {
	console.log('🚀 Local LLM Models Setup');
	console.log('==========================\n');

	console.log('This script will download the following models:');
	Object.entries(MODELS).forEach(([filename, config]) => {
		console.log(`📦 ${config.description} (${config.size})`);
	});

	console.log('\n⚠️  Warning: This will download up to ~17GB of data total. Make sure you have sufficient disk space and internet bandwidth.');
	console.log('💡 Tip: You can download individual models by choosing specific ones during setup.\n');

	// Check if user wants to proceed
	const args = process.argv.slice(2);
	if (!args.includes('--yes') && !args.includes('-y')) {
		console.log('Run with --yes or -y to automatically proceed with downloads.\n');
		console.log('Manual download instructions:');
		console.log('============================');
		Object.entries(MODELS).forEach(([filename, config]) => {
			console.log(`\n${config.description}:`);
			console.log(`📂 Save as: ${path.join(MODELS_DIR, filename)}`);
			console.log(`🔗 Download from: ${config.url}`);
		});
		return;
	}

	try {
		await ensureModelsDirectory();

		console.log('Starting downloads...\n');

		for (const [filename, config] of Object.entries(MODELS)) {
			await downloadModel(filename, config);
			console.log(''); // Empty line between downloads
		}

		console.log('🎉 All models downloaded successfully!');
		console.log('\n💡 You can now start the backend server with: npm run dev');

	} catch (error) {
		console.error('\n❌ Setup failed:', error.message);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
