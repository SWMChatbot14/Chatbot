const express = require('express');
const router = express.Router();
const libKakaoWork = require('../libs/kakaoWork');

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
      libKakaoWork.sendMesaage({
        conversationId: conversation.id,
        text: '인삿말',
        blocks: [
          {
            type: 'header',
            text: '인삿말',
            style: 'blue',
          },
          {
            type: 'text',
            text: '안녕하세요? 14팀입니다.',
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
      for (var h=0; h<=24; h++) {
        Array.push({ "text": "0 0 : 0 0", "value": 0 });
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
              text: '<br>알림받고 싶은 시간대를 정해주세요',
              markdown: true,
            },
            {
              type: 'select',
              name: 'rating',
              required: true,
              options: options,
              placeholder: '시간대',
            },
          ],
        },
      });
      break;
    default:
  }
  res.json({});
});