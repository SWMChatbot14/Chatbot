# 사전 준비

## 목차
<p>

[1. 구름 IDE 개발환경](#0-시작하기-앞서)<br>
[&nbsp; &nbsp; 1-1. 컨테이너 생성](#1-1컨테이너-생성)<br>
[&nbsp; &nbsp; 1-2. 챗봇 서버와 연동할 URL 설정 및 평가](#1-2-챗봇-서버와-연동할-URL-설정-및-평가)<br>
[&nbsp; &nbsp; 1-3. 구름 프리미엄 쿠폰 등록](#1-3-구름-프리미엄-쿠폰-등록)<br>
[&nbsp; &nbsp; 1-4. 주의 사항](#1-4-주의-사항)</p>

## 1. 구름 IDE 개발환경

### 1-1. 컨테이너 생성
<p>

[구름](https://ide.goorm.io/)에서 로그인한 후, [대시보드](https://ide.goorm.io/my/dashboard)에서 컨테이너 생성을 클릭한다. 이 때 주의할 점이 있다.</p>

<div align="center">
  <figure>
    <img src="./resource/[그림 1]구름 컨테이너 생성 - 깃 연동.png" alt="그림 1">
  </figure>
</div>

<p>생성해둔 git 저장소가 public이라면 탬플릿 범주에서 인증 방식을 Anonymous로 하지만, private이라면 Authorized user이어야 한다.</p>
<p>이름과 설명은 임의대로, 나머지는 화면과 같이 설정하면 된다.</p>

### 1-2. 챗봇 서버와 연동할 URL 설정 및 평가

<p>카카오워크 측에서 사전 전달한 각 팀의 URL을 생성한 컨테이너와 연동한다.</p>
<p>평가 시 다른 팀의 챗봇 메세지를 카카오워크 워크스페이스에서 확인할 수 있어야 하기 때문에 전달된 URL을 통해 본인 팀의 챗봇 API가 호출되어야 한다.</p>

<div align="center">
  <figure>
    <img src="./resource/[그림 2]팀별 URL 설정.png" alt="그림 2">
  </figure>
</div>

<p>(전체화면 기준)상단에서 프로젝트 > 실행 URL과 포트 를 통해서 설정할 수 있다.</p>
<p>

등록된 [강좌](https://swmaestro.goorm.io/learn/lecture/26764/%EC%B9%B4%EC%B9%B4%EC%98%A4%EC%9B%8C%ED%81%AC-%EC%B1%97%EB%B4%87-%EB%A7%8C%EB%93%A4%EA%B8%B0-node-js)에 현재 소속된 워크 스페이스의 모든 인원에게 챗봇 메세지를 전달하는 API에 대한 내용이 있으니 참고하도록 한다.</p>
<p>평가 당일 2021-04-30 오후 네 시에 팀별 챗봇 API(팀 URL)를 호출할 예정이다. 해당 내용을 통해 팀들이 평가를 수행한다.</p>

### 1-3. 구름 프리미엄 쿠폰 등록
<p>팀 별로 사전 지급된 프리미엄 쿠폰을 등록해야 한다.  컨테이너가 24시간 구동될 수 있도록 하기 위함이다.</p>
<p>

**컨테이너를 생성한 계정이 해당 쿠폰을 등록해야 한다.**[구름](https://ide.goorm.io/)에서 로그인, 우측 상단 계정 이름 클릭 > 쿠폰 등록 을 통해 등록하고 [대시보드](https://ide.goorm.io/my/dashboard)에서 생성해둔 컨테이너 블록에 '항상 켜두기' 옵션을 활성화한다.</p>

<div align="center">
  <figure>
    <img src="./resource/[그림 3]구름 프리미엄 쿠폰 등록.png" alt="그림 3">
  </figure>
</div>

### 1-4. 주의 사항
<p>사전 지급된 팀 챗봇의 API KEY가 깃 저장소에 올라가지 않도록 주의한다.</p>

