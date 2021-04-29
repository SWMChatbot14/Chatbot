import numpy as np
import pandas as pd 
import requests
from bs4 import BeautifulSoup

# 시각, 날씨, 기온, 체감온도, 강수량(mm), 강수 확률, 바람(m/s), 습도
# 역삼동 코드 : 1165053100d
src = 'https://www.weather.go.kr/w/wnuri-fct2021/main/digital-forecast.do?code=1165053100&unit=m%2Fs'
source = requests.get(src)
soup = BeautifulSoup(source.content,"html.parser")

slide = soup.findAll("div", class_="item-wrap")

today = []
for ul in slide[0]:
    if ul.name == 'ul':
        time = []
        for li in ul:
            if li.name == 'li':
                time.append(li.contents[1].text.replace('\xa0', '-').split('(')[0])
            if len(time)==6: break
        today.append(time)
        
tomorrow = []
for ul in slide[1]:
    if ul.name == 'ul':
        time = []
        for li in ul:
            if li.name == 'li':
                time.append(li.contents[1].text.replace('\xa0', '-'))
            if len(time)==6: break
        tomorrow.append(time)

print(today)
print(tomorrow)

w_dataframe = pd.DataFrame(data=tomorrow, columns=["시간", "날씨", "기온(체감온도)", "체감온도", "강수량(mm)", "강수확률"])
w_dataframe
