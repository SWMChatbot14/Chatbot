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
          }
        ]
      })
    )
  ])
});