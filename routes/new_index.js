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
  // 각 유저에게 채팅방 생성
  const conversations = await Promise.all(
    users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
  );
  // 화면 1(메세지)
  const messages = await Promise.all([
    conversations.map((conversation) =>
      libKakaoWork.sendMessage({
        conversationId: conversation.id,
        text: '[오늘 뭐입지?] 서비스 이용 안내',
        blocks: [
          {
            type: 'header',
            text: '오늘 뭐 입지?',
            style: 'blue',
          },
		      {
            type : "image_link",
            url : "https://swm-chatbot-ovnwx9-6ee.run.goorm.io/resources/introduction_logo2.jpeg"
          },
          {
            type: 'text',
            text: '안녕하세요! 저희는 <> 챗봇입니다. <>기능이 있습니다. <> 해서 <> 를 해보세요',
            markdown: true,
          },
          {
            type: 'button',
            action_type: 'call_modal',
            value: '시간 설정하기',
            text: '시간 설정하기',
            style: 'default',
          },
        ],
      })
    ),
  ]);

  cron.schedule('*/4 * * * * *', () => {
    axios.get("https://swm-chatbot-ovnwx9-6ee.run.goorm.io/test_alarm");
  }, {
    timezone: "Asia/Seoul"
  }).start();

  // 응답값은 자유
  res.json({
    users,
    conversations,
    messages,
  });
});

router.post('/request', async (req, res, next) => {
  const { message, value } = req.body;
  switch (value) {
    case '시간 설정하기':
      var options = new Array();
      for (var h=0; h<24; h++) {
        var time = '';
				if (h < 10) time += '0 '+h+' : 0 0';
				else { h = String(h); time += h[0]+' '+h[1]+' : 0 0'; }
        options.push({ text: time, value: '매 일 '+time });
      }
      return res.json({
        view: {
          title: '시간 설정',
          accept: '확인',
          decline: '취소',
          value: '시간 설정 결과',
          blocks: [
            {
              type: 'label',
              text: '알림받고 싶은 시간대를 정해주세요',
              markdown: true,
            },
            {
              type: 'select',
              name: 'setting_time',
              required: true,
              options: options,
              placeholder: '선택',
            },
          ],
        },
      });
      break;
    default:
  }
  res.json({});
});

router.post('/callback', async (req, res, next) => {
  const { message, actions, action_time, value } = req.body;
  switch (value) {
    case '시간 설정 결과':
      await libKakaoWork.sendMessage({
        conversationId: message.conversation_id,
        text: '알림 시간대 설정 완료',
        blocks: [
		      {
            type: 'header',
            text: '알림 시간대 설정 완료!',
            style: 'blue',
          },
          {
            type: 'text',
            text: '알림 시간대가 설정되었습니다.',
            markdown: true,
          },
          {
            type: 'text',
            text: '*설정 시간대*',
            markdown: true,
          },
          {
            type: 'description',
            term: '결과',
            content: {
              type: 'text',
              text: actions.setting_time,
              markdown: false,
            },
            accent: true,
          },
          {
            type: 'button',
            action_type: 'call_modal',
            value: '시간 설정하기',
            text: '다시 시간 설정하기',
            style: 'default',
          },
        ],
      });
      var st = actions.setting_time;
      var h = st[4] > '0'? st[4]+st[6]: st[6];
      h = Number(h);
      db.addUser(message.user_id, h);
			console.log("add "+message.user_id+" "+db.getUser(message.user_id));
    break;
    default:
  }
	
  res.json( { result: true });
});

// 지정된 시간 알림 예시
router.get('/test_alarm', async (req, res, next) => {
  // 유저 목록 검색
  const users = await libKakaoWork.getUserList();
  const date = new Date();
  const h = date.getHours();
  // 각 유저에게 채팅방 생성
  const conversations = await Promise.all(
    users.map((user) => 
      libKakaoWork.openConversations({ userId: user.id })
    )
  );
  // 화면 1(메세지)
  const messages = await Promise.all([
    conversations.map((conversation) =>
      libKakaoWork.sendMessage({
        conversationId: conversation.id,
        text: '오늘 뭐입지?',
        blocks: [
          {
            type: 'header',
            text: '<날짜> 은 뭐입지',
            style: 'yellow',
          },
		      {
            type : "image_link",
            url : "https://swm-chatbot-ovnwx9-6ee.run.goorm.io/resources/today_cloth1.png"
          },
		      {
            type : "image_link",
            url : "https://swm-chatbot-ovnwx9-6ee.run.goorm.io/resources/today_cloth2.png"
          },
          {
            type: 'text',
            text: '이거 입어라',
            markdown: true,
          },
          {
            type: 'button',
            action_type: 'call_modal',
            value: '',
            text: '딴거 줘',
            style: 'default',
          },
		      {
            type: 'button',
            action_type: 'call_modal',
            value: '시간 설정하기',
            text: '알림 시간 바꾸기',
            style: 'default',
          },
        ],
      })
    ),
  ]);

  // 응답값은 자유
  res.json({
      users,
      conversations,
      messages,
  });
});

module.exports = router;