var cron = require('node-cron');

// ** hour range : 0-23 **
// function cron_start(start_hour){
//   cron.schedule('0 0 ${start_hour} * *', () => {
//     console.log('Running a job at 01:00 at America/Sao_Paulo timezone');
//     }, {
//       timezone: "Asia/Seoul"
//   }).start();
// }

exports.cron_start = async (start_hour) => {
	await cron.schedule('0 0 ${start_hour} * *', () => {
    console.log("cron_start() run");
	}, {
		timezone: "Asia/Seoul"
	}).start();
};

// destory cronjob to destory
// function cron_destroy(cron_to_destory){
//   cron_to_destory.destory();
// }

exports.cron_destroy = (cron) => {
  
};