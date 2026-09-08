const app = require('./app');

const port = Number(process.env.PORT) || 5050;
const server = app.listen(port, (error) => {
  if (error) {
    console.error(`SafeMum API failed to listen on port ${port}: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`SafeMum API listening on port ${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received; closing HTTP server.`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
