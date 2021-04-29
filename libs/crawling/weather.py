import numpy as np
import pandas as pd 
import requests
from bs4 import BeautifulSoup

# 시각, 날씨, 기온, 체감온도, 강수량(mm), 강수 확률, 바람(m/s), 습도
# 역삼동 코드 : 1165053100d
src = 'https://www.weather.go.kr/w/wnuri-fct2021/main/digital-forecast.do?code=1165053100&unit=m%2Fs&hr1=Y'
source = requests.get(src)
source.encoding = 'utf-8'
soup = BeautifulSoup(source.content,"html.parser")

slide = soup.findAll("div", class_="item-wrap")

today = []
for ul in slide[0]:
    if ul.name == 'ul':
        time = []
        for li in ul:
            if li.name == 'li':
                if len(time)==2 or len(time)==3:
                    t = li.contents[1].text.replace('\xa0', '-').split('(')[0]
                    time.append(t[:len(t)-1])
                else:
                    time.append(li.contents[1].text.replace('\xa0', '-'))
            if len(time)==6: break
        today.append(time)

# tomorrow = []
# for ul in slide[1]:
#     if ul.name == 'ul':
#         time = []
#         for li in ul:
#             if li.name == 'li':
#                 if len(time)==2 or len(time)==3:
#                     t = li.contents[1].text.replace('\xa0', '-').split('(')[0]
#                     time.append(t[:len(t)-1])
#                 else:
#                     time.append(li.contents[1].text.replace('\xa0', '-'))
#             if len(time)==6: break
#         tomorrow.append(time)

w_dataframe = pd.DataFrame(data=today, columns=["time", "weather", "temp", "pertemp", "precipitation", "prop"])
# w_dataframe.to_csv('./df.csv')
print(w_dataframe.to_json())