// routes/index.js
const axios = require('axios');
const cron = require('node-cron');
const express = require('express');
const router = express.Router();
const libKakaoWork = require('../libs/kakaoWork');
const db = require('../libs/db/on_memory');

router.get('/', async (req, res, next) => {
  // 유저 목록 검색
  const users = await libKakaoWork.getUserList();
  console.log("Object.keys(Users):");
  console.log(Object.keys(users));
  // 응답값은 자유
  res.json({
    // users,
    // conversations,
    // messages,
  });
});

router.post('/request', async (req, res, next) => {
  const { message, value } = req.body;
  
  res.json({});
});

router.post('/callback', async (req, res, next) => {
  const { message, actions, action_time, value } = req.body;
  
  res.json( { result: true });
});

// 지정된 시간 알림 예시
// router.get('/alarm', async (req, res, next) => {
//   // 유저 목록 검색
//   const date = new Date();
//   const h = date.getHours();
//   const cons = db.getCons(h);

// 	if (cons != null) {
//     const messages = await Promise.all([
//       cons.forEach((con_id, dump, setObject) =>
//         libKakaoWork.sendMessage({
//           conversationId: con_id,
//           text: '오늘 뭐입지?',
//           blocks: [
//             {
//               type: 'header',
//               text: '<날짜> 은 뭐입지',
//               style: 'yellow',
//             },
//             {
//               type : "image_link",
//               url : "https://swm-chatbot-ovnwx9-6ee.run.goorm.io/resources/today_cloth1.png"
//             },
//             {
//               type : "image_link",
//               url : "https://swm-chatbot-ovnwx9-6ee.run.goorm.io/resources/today_cloth2.png"
//             },
//             {
//               type: 'text',
//               text: '이거 입어라',
//               markdown: true,
//             },
//             {
//               type: 'button',
//               action_type: 'call_modal',
//               value: '',
//               text: '딴거 줘',
//               style: 'default',
//             },
//             {
//               type: 'button',
//               action_type: 'call_modal',
//               value: '시간 설정하기',
//               text: '알림 시간 바꾸기',
//               style: 'default',
//             },
//           ],
//         })
//       ),
//     ]);
// 	}
//   // 응답값은 자유
//   res.json({
//       // users,
//       // conversations,
//       // messages,
//   });
// });

module.exports = router;