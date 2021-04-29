// routes/index.js
const axios = require('axios');
const cron = require('node-cron');
const express = require('express');
const router = express.Router();
const libKakaoWork = require('../libs/kakaoWork');
const db = require('../libs/db/on_memory');

router.get('/', async (req, res, next) => {
  var cur = null;
  do { // 해당 스페이스의 모든 인원들에게 접근하도록 loop
    const data = await libKakaoWork.getUserList(cur);
    const users = data.users;
    cur = data.cursor;
    // 가져온 ~10명에 대해서 각각 채팅방 생성
    const conversations = await Promise.all(
      users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
    );
    // 생성한 채팅방에 메세지 전송
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
              text: '안녕하세요!\n 저희는 기온에 따라 적절한 의상을 추천해드리는 챗봇입니다. 매일 알람 받을 시간을 설정해서 오늘의 착장을 완성해보세요!',
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
  } while (cur != null);

  cron.schedule('*/4 * * * * *', () => {
    axios.get("https://swm-chatbot-ovnwx9-6ee.run.goorm.io/alarm");
  }, {
    timezone: "Asia/Seoul"
  }).start();

  // 응답값은 자유
  res.json({
    // users,
    // conversations,
    // messages,
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
              text: '알림받고 싶은 시간대를 설정해주세요.',
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
        text: '알림 설정 완료!',
        blocks: [
		      {
            type: 'header',
            text: '알림 설정 완료!',
            style: 'blue',
          },
          {
            type: 'text',
            text: '오늘의 착장 알림이 설정되었습니다.',
            markdown: true,
          },
          {
            type: 'divider',
          },
          {
            type: 'description',
            term: '알림시간',
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
            text: '알림 시간 변경하기',
            style: 'default',
          },
        ],
      });
      var st = actions.setting_time;
      var h = st[4] > '0'? st[4]+st[6]: st[6];
      h = Number(h);
      db.addCon(h, message.conversation_id);
			console.log("add "+message.conversation_id+" "+db.getCons(h));
    break;
    default:
  }
	
  res.json( { result: true });
});

// 지정된 시간 알림 예시
router.get('/alarm', async (req, res, next) => {
  // 유저 목록 검색
  const date = new Date();
  const h = date.getHours();
  const cons = db.getCons(h);

	if (cons != null) {
    const messages = await Promise.all([
      cons.forEach((con_id, dump, setObject) =>
        libKakaoWork.sendMessage({
          conversationId: con_id,
          text: '오늘 뭐입지?',
          blocks: [
            {
              type: 'header',
              text: '오늘의 추천 착장입니다!',
              style: 'yellow',
            },
            {
              type : "image_link",
              url : "https://swm-chatbot-ovnwx9-6ee.run.goorm.io/resources/today_cloth1.png"
            },
            {
              type: 'text',
              text: '이 의상은 어떠신가요?',
              markdown: true,
            },
            {
              type: "action",
              elements: [
                {
                  type: "button",
                  action_type: 'call_modal',
                  value: '',
                  text: "별로에요!",
                  style: "danger"
                },
                {
                  type: "button",
                  action_type: 'call_modal',
                  value: '',
                  text : "좋아요!",
                  style: "primary"
                }
              ]
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
	}
  // 응답값은 자유
  res.json({
      // users,
      // conversations,
      // messages,
  });
});

module.exports = router;