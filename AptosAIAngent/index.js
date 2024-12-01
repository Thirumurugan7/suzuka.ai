const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

// Function to remove the .aptos folder if it exists
async function deleteAptosFolder() {
    try {
        const aptosDir = path.join(__dirname, 'module', '.aptos');
        if (fs.existsSync(aptosDir)) {
            console.log('.aptos folder found, deleting it...');
            await fs.promises.rm(aptosDir, { recursive: true, force: true });
            console.log('.aptos folder deleted successfully.');
        } else {
            console.log('.aptos folder not found, skipping deletion.');
        }
    } catch (error) {
        console.error('Error deleting .aptos folder:', error);
        throw error;
    }
}

// Function to remove the address from move.toml if it exists
async function deleteMoveTomlAddress() {
    try {
        const moveTomlPath = path.join(__dirname, 'module', 'move.toml');
        if (fs.existsSync(moveTomlPath)) {
            let content = await fs.promises.readFile(moveTomlPath, 'utf8');
            if (content.includes('addr = ')) {
                console.log('move.toml contains an address, removing it...');
                content = content.replace(/addr = '[a-fA-F0-9]+'/g, 'addr = \'\'');
                await fs.promises.writeFile(moveTomlPath, content);
                console.log('Address removed from move.toml successfully.');
            } else {
                console.log('move.toml does not contain an address, skipping deletion.');
            }
        } else {
            console.log('move.toml file not found, skipping deletion.');
        }
    } catch (error) {
        console.error('Error deleting address from move.toml:', error);
        throw error;
    }
}

// Function to run interactive aptos init
async function initAptos() {
    return new Promise((resolve, reject) => {
        const modulePath = path.join(__dirname, 'module');
        const init = spawn('aptos', ['init', '--network', 'devnet'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            cwd: modulePath
        });

        let output = '';

        // Keep stdin open
        init.stdin.setDefaultEncoding('utf-8');

        init.stdout.on('data', (data) => {
            const dataStr = data.toString();
            output += dataStr;
            console.log('stdout:', dataStr);

            // Handle private key prompt
            if (dataStr.includes('Enter your private key')) {
                console.log('Sending empty line for key generation...');
                init.stdin.write('\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }
            
            // Handle API submission prompt
            if (dataStr.includes('Submit network identifier')) {
                console.log('Sending yes for API submission...');
                init.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }

            // Handle the prompt to overwrite the existing config
            if (dataStr.includes('do you want to overwrite the existing config')) {
                console.log('Sending yes to overwrite the config...');
                init.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }
        });

        init.stderr.on('data', (data) => {
            const dataStr = data.toString();
            console.log(`stderr: ${dataStr}`);
            
            if (dataStr.includes('Enter your private key')) {
                console.log('Sending empty line for key generation (stderr)...');
                init.stdin.write('\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }
            
            if (dataStr.includes('Submit network identifier')) {
                console.log('Sending yes for API submission (stderr)...');
                init.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }

            if (dataStr.includes('do you want to overwrite the existing config')) {
                console.log('Sending yes to overwrite the config (stderr)...');
                init.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }
        });

        init.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Aptos init failed with code ${code}`));
            }
        });

        init.on('error', (error) => {
            console.error('Process error:', error);
            reject(error);
        });

        setTimeout(() => {
            init.kill();
            reject(new Error('Process timed out after 30 seconds'));
        }, 30000);
    });
}

// Function to execute shell commands
function execCommand(command) {
    return new Promise((resolve, reject) => {
        const modulePath = path.join(__dirname, 'module');
        const proc = spawn(command, [], {
            shell: true,
            stdio: 'pipe',
            cwd: modulePath
        });

        let output = '';

        proc.stdout.on('data', (data) => {
            const dataStr = data.toString();
            output += dataStr;
            console.log('stdout:', dataStr);

            // Handle package publishing prompt
            if (dataStr.includes('Do you want to submit a package')) {
                console.log('Sending yes for package publishing...');
                proc.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }

            // Handle gas cost confirmation prompt
            if (dataStr.includes('Do you want to submit a transaction')) {
                console.log('Sending yes for transaction submission...');
                proc.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }
        });

        proc.stderr.on('data', (data) => {
            const dataStr = data.toString();
            console.log(`stderr: ${dataStr}`);
            
            // Handle package publishing prompt in stderr
            if (dataStr.includes('Do you want to submit a package')) {
                console.log('Sending yes for package publishing (stderr)...');
                proc.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }

            // Handle gas cost confirmation prompt in stderr
            if (dataStr.includes('Do you want to submit a transaction')) {
                console.log('Sending yes for transaction submission (stderr)...');
                proc.stdin.write('yes\n', (err) => {
                    if (err) console.error('Error writing to stdin:', err);
                });
            }
        });

        proc.on('close', (code) => {
            console.log(`Command exited with code ${code}`);
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        proc.on('error', (error) => {
            console.error('Command error:', error);
            reject(error);
        });

        // Keep stdin open for interactive prompts
        proc.stdin.setDefaultEncoding('utf-8');

        setTimeout(() => {
            proc.kill();
            reject(new Error('Command timed out after 30 seconds'));
        }, 30000);
    });
}

// Function to update move.toml with account address
async function updateMoveToml(address) {
    try {
        const moveTomlPath = path.join(__dirname, 'module', 'move.toml');
        let content = await fs.promises.readFile(moveTomlPath, 'utf8');

        // Check if the address is already present in move.toml
        if (content.includes(`addr = '${address}'`)) {
            console.log('move.toml already contains the address, skipping update.');
            return;
        }

        // Replace the placeholder address if it exists
        content = content.replace(/addr = ''/, `addr = '${address}'`);
        await fs.promises.writeFile(moveTomlPath, content);
        console.log('move.toml updated successfully');
    } catch (error) {
        console.error('Error updating move.toml:', error);
        throw error;
    }
}

// Function to get account address from .aptos/config.yaml
async function getAccountAddress() {
    try {
        const configPath = path.join(__dirname, 'module', '.aptos', 'config.yaml');
        const config = await fs.promises.readFile(configPath, 'utf8');
        const addressMatch = config.match(/account: ([a-fA-F0-9]+)/);
        if (addressMatch && addressMatch[1]) {
            return addressMatch[1];
        }
        throw new Error('Account address not found in config');
    } catch (error) {
        console.error('Error reading account address:', error);
        if (error.code === 'ENOENT') {
            // Check if the .aptos folder already exists
            const aptosDir = path.join(__dirname, 'module', '.aptos');
            if (fs.existsSync(aptosDir)) {
                console.log('.aptos folder already exists, skipping Aptos initialization.');
            } else {
                throw new Error(`Config file not found at ${configPath}. Make sure .aptos/config.yaml exists in the module directory.`);
            }
        }
        throw error;
    }
}

// Endpoint to trigger deployment
app.post('/deploy', async (req, res) => {
    try {
        // Remove the .aptos folder if it exists
        await deleteAptosFolder();

        // Remove the address from move.toml if it exists
        await deleteMoveTomlAddress();

        // Initialize Aptos with devnet
        console.log('Initializing Aptos...');
        await initAptos();
        
        // Longer delay to ensure file system updates are complete
        console.log('Waiting for config file to be written...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the account address from .aptos/config.yaml
        const address = await getAccountAddress();
        console.log('Account address:', address);
        
        // Update move.toml with the account address, but skip if the address is already present
        await updateMoveToml(address);
        
        // Publish the contract
        console.log('Publishing contract...');
        const publishOutput = await execCommand('aptos move publish');
        
        res.json({
            success: true,
            address,
            publishOutput
        });
    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/location', (req, res) => {
    res.json({
        currentFile: __filename,
        currentDir: __dirname,
        workingDir: process.cwd()
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});