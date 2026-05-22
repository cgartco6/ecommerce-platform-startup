const app = require('./app');
const cron = require('node-cron');
const payoutService = require('./services/payoutService');

const PORT = process.env.PORT || 5000;

// Schedule weekly payout every Wednesday at 00:00
cron.schedule('0 0 * * 3', async () => {
  console.log('Running weekly payout...');
  await payoutService.processWeeklyPayout();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
