module.exports = {
    apps: [
      {
        name: 'aptos-a',
        script: './index.js',
        env: {
          PATH: process.env.PATH + ':/root/.local/bin',
        },
      },
    ],
  };
  