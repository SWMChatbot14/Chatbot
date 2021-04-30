// routes/index.js
const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');
const router = express.Router();
const libKakaoWork = require('../libs/kakaoWork');
const db = require('../libs/db/on_memory');
// 1. child-process모듈의 spawn 취득
const spawn = require('child_process').spawn;
// 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행
var temp_today = "17_19";


router.get('/', async (req, res, next) => {
  var cur = null;
  do { // 해당 스페이스의 모든 인원들에게 접근하도록 loop
    const data = await libKakaoWork.getUserList(cur);
    const users = data.users;
    cur = data.cursor;
    // 가져온 ~10명에 대해서 각각 채팅방 생성
    const conversations = await Promise.all(
      users.map((user) => libKakaoWork.openConversations({
        userId: user.id
      }))
    );
    // 생성한 채팅방에 메세지 전송
    const messages = await Promise.all([
      conversations.map((conversation) =>
        libKakaoWork.sendMessage({
          conversationId: conversation.id,
          text: '[오늘 뭐입지?] 서비스 이용 안내',
          blocks: [{
              type: 'header',
              text: '오늘 뭐 입지?',
              style: 'blue',
            },
            {
              type: "image_link",
              url: "https://swm-chatbot-ovnwx9-6eeo3l.run.goorm.io/resources/introduction_logo2.jpeg"
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

  cron.schedule('0 * * * *', () => {
    // python3 ./libs/crawling/weather.py 실행
    const result = spawn('python3', ['./libs/crawling/weather.py']);
    // stdout의 'data'이벤트리스너로 실행결과를 받는다.
    result.stdout.on('data', function(data) {
      var weather_json = JSON.parse(data.toString());
      var pertemps = new Array();
      var temp_keys = Object.keys(weather_json.pertemp);
      for (var i = 0; i < temp_keys.length; i++) {
        var key = temp_keys[i];
        var temp = weather_json.pertemp[key];
        pertemps.push(Number(temp)); // pertemps는 array. 그 날 체감 온도 나옴
      }
      let middle = Math.floor(pertemps.length / 2);
      pertemps = [...pertemps].sort((a, b) => a - b);
      var median = pertemps[middle];
      console.log("median:" + median);

      temp_today = "20_22";
    });
    // 4. 에러 발생 시, stderr의 'data'이벤트리스너로 실행결과를 받는다.
    result.stderr.on('data', function(data) {
      console.log(data.toString());
    });
    axios.get("https://swm-chatbot-ovnwx9-6eeo3l.run.goorm.io/alarm");
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
  const {
    message,
    value
  } = req.body;
  switch (value) {
    case '시간 설정하기':
      var options = new Array();
      for (var h = 0; h < 24; h++) {
        var time = '';
        if (h < 10) time += '0 ' + h + ' : 0 0';
        else {
          h = String(h);
          time += h[0] + ' ' + h[1] + ' : 0 0';
        }
        options.push({
          text: time,
          value: '매 일 ' + time
        });
      }
      return res.json({
        view: {
          title: '시간 설정',
          accept: '확인',
          decline: '취소',
          value: '시간 설정 결과',
          blocks: [{
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
  const {
    message,
    actions,
    action_time,
    value
  } = req.body;
  const con_id = message.conversation_id;
  switch (value) {
    case '시간 설정 결과':
      await libKakaoWork.sendMessage({
        conversationId: con_id,
        text: '알림 설정 완료!',
        blocks: [{
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
      var h = st[4] > '0' ? st[4] + st[6] : st[6];
      h = Number(h);
      db.addCon(h, message.conversation_id);
      console.log("add " + message.conversation_id + " " + db.getCons(h));
      break;
    case 'not-good':

      // var temp_today = "20_22"
      var dir_male = './resources/male/' + temp_today;
      console.log("dir_male:" + dir_male);
      var dir_female = './resources/female/' + temp_today;
      console.log("dir_female:" + dir_female);
      var num_male, num_female;
      fs.readdir(dir_male, (error, filelist) => {
        num_male = filelist.length;
        console.log("num_male:" + num_male);
        fs.readdir(dir_female, (error, filelist) => {
          num_female = filelist.length;
          console.log("num_female:" + num_female);
          var idx_male = Math.ceil(Math.random() * num_male);
          console.log("idx_male:" + idx_male);
          var idx_female = Math.ceil(Math.random() * num_female);
          console.log("idx_female:" + idx_female);
          var rej = db.getRejects(con_id);
          if (rej == null) rej = 0;
          rej = (rej + 1) % 3; // 세 번 거절하면 0으로 리셋
          db.setRejects(con_id, rej);
          if (rej) { // 아직 세 번 거절하지 않았다 -> 추천 계속
            libKakaoWork.sendMessage({
              conversationId: con_id,
              text: '다른 거 뭐입지?',
              blocks: [{
                  type: 'header',
                  text: '또 다른 추천 착장입니다!',
                  style: 'yellow',
                },
                {
                  type: "image_link",
                  url: "https://swm-chatbot-ovnwx9-6eeo3l.run.goorm.io/resources/male/" + temp_today + "/" + idx_male + ".png"
                },
                {
                  type: "image_link",
                  url: "https://swm-chatbot-ovnwx9-6eeo3l.run.goorm.io/resources/female/" + temp_today + "/" + idx_female + ".png"
                },
                {
                  type: 'text',
                  text: '이 의상은 어떠신가요?',
                  markdown: true,
                },
                {
                  type: "action",
                  elements: [{
                      type: "button",
                      action_type: 'submit_action',
                      action_name: 'not-good',
                      value: 'not-good',
                      text: "별로에요!",
                      style: "danger"
                    },
                    {
                      type: "button",
                      action_type: 'submit_action',
                      action_name: 'good',
                      value: 'good',
                      text: "좋아요!",
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
            rej = 0;
          } else { // 세 번 거절한 경우 추천 x..
            libKakaoWork.sendMessage({
              conversationId: con_id,
              text: '오늘은 아닌가 봐',
              blocks: [{
                  type: 'header',
                  text: '오늘은 날이 아닌가 봐',
                  style: 'yellow',
                },
                {
                  type: 'text',
                  text: '집이 최고야 ~',
                  markdown: true,
                },
                {
                  type: "button",
                  action_type: 'submit_action',
                  action_name: 'not-good',
                  value: 'not-good',
                  text: "별로에요!",
                  style: "danger"
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
          }
        });
      });


      break;
    case 'good':
      db.setRejects(con_id, 0);
      await libKakaoWork.sendMessage({
        conversationId: con_id,
        text: '저희도 좋아요',
        blocks: [{
            type: 'header',
            text: '좋아요 !',
            style: 'yellow',
          },
          {
            type: 'text',
            text: '즐거운 외출 되시길 바래요 ~',
            markdown: true,
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
      break;
    default:
  }

  res.json({
    result: true
  });
});

// 지정된 시간 알림 예시
router.get('/alarm', async (req, res, next) => {
  const date = new Date();
  const h = date.getHours();
  const cons = db.getCons(h);

  // var temp_today = "20_22"
  var dir_male = './resources/male/' + temp_today;
  console.log("dir_male:" + dir_male);
  var dir_female = './resources/female/' + temp_today;
  console.log("dir_female:" + dir_female);
  var num_male, num_female;
  fs.readdir(dir_male, (error, filelist) => {
    num_male = filelist.length;
    console.log("num_male:" + num_male);
    fs.readdir(dir_female, (error, filelist) => {
      num_female = filelist.length;
      console.log("num_female:" + num_female);
      var idx_male = Math.ceil(Math.random() * num_male);
      console.log("idx_male:" + idx_male);
      var idx_female = Math.ceil(Math.random() * num_female);
      console.log("idx_female:" + idx_female);
      if (cons != null) {
        const messages = cons.forEach((con_id, dump, setObject) => {
					console.log("con_id:"+con_id);
          libKakaoWork.sendMessage({
            conversationId: con_id,
            text: '오늘 뭐입지?',
            blocks: [{
                type: 'header',
                text: '오늘의 추천 착장입니다!',
                style: 'yellow',
              },
              {
                type: "image_link",
                url: "https://swm-chatbot-ovnwx9-6eeo3l.run.goorm.io/resources/male/" + temp_today + "/" + idx_male + ".png"
              },
              {
                type: "image_link",
                url: "https://swm-chatbot-ovnwx9-6eeo3l.run.goorm.io/resources/female/" + temp_today + "/" + idx_female + ".png"
              },
              {
                type: 'text',
                text: '이 의상은 어떠신가요?',
                markdown: true,
              },
              {
                type: "action",
                elements: [{
                    type: "button",
                    action_type: 'submit_action',
                    action_name: 'not-good',
                    value: 'not-good',
                    text: "별로에요!",
                    style: "danger"
                  },
                  {
                    type: "button",
                    action_type: 'submit_action',
                    action_name: 'good',
                    value: 'good',
                    text: "좋아요!",
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
				})
      }
      res.json({
        // users,
        // conversations,
        // messages,
      });
    });
  });
});


module.exports = router;