import Taro, {Component} from '@tarojs/taro';
import {View, Text, Image, Button, ScrollView, Input, Form} from '@tarojs/components';

import styles from './index.module.scss';
import Keys, {Requests, wxShowError, responseOK, networkError} from "../../assets/constants";
import robot from '../../assets/images/robot-circle.png';

let msgs = [];
let nlpResponse = [];
let answers = [];

let chatHeight = 0;
let recorderManager = null;
const options = {
  duration: 10000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 64000,
  format: 'mp3',
  frameSize: 50
};

class Chat extends Component {
  state = {
    round: 0,
    roundA: 0,
    yPos: 0,
    opacity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    opacityA: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    useVoice: true,
    disableVoice: true,

    aYPos: 0,
    animateQ: true
  };

  componentWillMount() {
    let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
    this.userAvatar = profile.imageUrl;
    this.userName = profile.name;
    this.userId = this.$router.params.userId;
  };

  componentDidMount() {
    this.getChatBoxHeight();
    this.createRecordManager();

    //clear the list to initialize a new session
    msgs = [];
    //initialize the session
    this.requestNLP("", true);
  }

  playVoice = (res) => {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.src = res.tempFilePath;

    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    });
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
  };

  displayVoiceTxt = (translatedTxt) => {
    let me = this;

    answers.push(translatedTxt);

    let round = me.state.roundA + 1;
    let op = me.state.opacityA;
    op[round] = 1;

    me.setState({
      aYPos: me.state.aYPos - 80,
      animateQ: false,
      roundA: this.state.roundA + 1,
      opacityA: op
    });
  };

  processVoice = (res) => {
    let me = this;

    wx.uploadFile({
      url: Requests.speechRecognition,
      filePath: res.tempFilePath,
      name: 'file',
      // formData: {user: 'test'},
      success(e) {
        console.log('voice recognition: ', e);

        let txt = JSON.parse(e.data).data;
        me.displayVoiceTxt(txt);

        //me.requestNLP(txt, false);

        // if (me.state.round >= 4) {
        //   wx.navigateTo({
        //     url: `../job-search/index?value=${encodeURIComponent('高级工程师 美国')}`
        //   })
        // }
        //
        // let round = me.state.round + 1;
        // let op = me.state.opacity;
        // op[round] = 1;
        // op[me.state.round] = 0.2;
        //
        // if (round === 1)
        //   msgTemplate[round][1] = JSON.parse(e.data).data;
        // else if (round === 2)
        //   msgTemplate[round][3] = JSON.parse(e.data).data;
        //
        // me.setState({yPos: me.state.yPos - chatHeight, opacity: op, round});

        /*
        if(responseOK(e)){
          console.log('voice recognition: ', e);

          let txt = JSON.parse(e.data).data;
          //me.displayVoiceTxt(txt);

          me.requestNLP(txt, false);

        }
        else wxShowError(false, '语音识别失败！');
        */
      },
      fail() {
        wxShowError(true, '语音传输错误！');
      }
    });
  };

  requestNLP = (txt, initSession) => {
    let me = this;

    // wx.redirectTo({url: `../job-search/index?userId=${me.userId}`});
    // return;

    wx.request({
      url: `${Requests.speechNLP}`,
      method: 'POST',
      data: {
        sessionId: me.userId,
        userName: me.userName,
        clearDialogHistory: initSession,
        initSession,
        currentUtterance: txt
      },
      success(res) {
        console.log(`nlp response, init ${initSession}: `, res);
        if (res.statusCode >= 500){
          wx.navigateTo({url: `../error/index`})
        }
        else if (responseOK(res)) {
          let round = me.state.round + 1;
          let op = me.state.opacity;
          op[round] = 1;
          op[me.state.round] = round === 1 ? 0 : 0.2;

          msgs.push(res.data.response.strToDisplay);

          me.setState({
            yPos: me.state.yPos - chatHeight,
            opacity: op,
            round,
            disableVoice: false,
            animateQ: true
          });

          //with session end flag, start to send request
          //to search the companies
          if (res.data.response.action === "jobSearch") {
            //get parameters from the response and send request
            //to search jobs
            let parseRes = res.data.response.strToDisplay;
            //me.searchJobs(parseRes);
          }
        }
        else wxShowError(false, '语音处理失败！');
      },
      fail: networkError
    });
  };

  searchJobs = (searchParams) => {
    wx.request({
      //url: `${Requests.recommendJobs}/userId/${userId}`,
      url: `${Requests.recommendJobs}`,
      success: function (res) {
        if (!responseOK(res)) {
          wxShowError(false);
        }
        else {
          console.log('welcome - job recomm');

          try {
            //got jobs
            console.log(typeof(res.data));

            console.log(res.data);
            let arr = res.data.slice(0, 6);
            console.log(arr);
            return;

            //jobs = me.processSimulatedData((res.data));

            wx.setStorageSync(Keys.Recommendations, jobs1);
            wx.redirectTo({url: `../job-recommendation/index?userId=${userId}`});
          } catch (ex) {
            console.log(ex.message);
            wxShowError(true);
          }
        }
      },
      fail: networkError
    });
  };

  createRecordManager = () => {
    let me = this;
    recorderManager = wx.getRecorderManager();
    recorderManager.onStop((res) => {
      //console.log('recorder stop', res);

      //me.playVoice(res);
      me.processVoice(res);
    });
  };

  getChatBoxHeight = () => {
    const query = wx.createSelectorQuery();
    query.select('#dlg1').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      //console.log(res);
      chatHeight = res[0].height;
    });
  };

  render() {
    return (
      <View className={styles.root}>
        {/*<View className={styles['logo-container']}>*/}
        {/*<Image src={this.userAvatar} className={styles.avatar}/>*/}
        {/*</View>*/}

        <ScrollView className={styles['chat-container']}>
          <View className={styles.dlg} animation={this.translate(0)}
            //style={{opacity: this.state.opacity[1]}}
          >
            <Text> place holder </Text>
          </View>

          <View className={`${styles['dlg1']} ${styles.dlg}`} id='dlg1'
                animation={this.state.animateQ ? this.translate(1) : undefined}>
            <View>{msgs[0] ? msgs[0] : ""}</View>
            <View style={{
              textAlign: 'right',
              //border: '1px solid yellow',
              marginTop: '180rpx',
              height: 200
            }} animation={this.translateAns()}>{answers[0]}</View>
          </View>

          <View className={`${styles['dlg2']} ${styles.dlg}`} animation={this.translate(2)}>
            <Text>{msgs[1] ? msgs[1] : ""}</Text>
          </View>

          <View className={`${styles['dlg3']} ${styles.dlg}`} animation={this.translate(3)}>
            <Text>{msgs[2] ? msgs[2] : ""}</Text>
          </View>

          <View className={styles.dlg} animation={this.translate(4)}>
            <Text>{msgs[3] ? msgs[3] : ""}</Text>
          </View>

          <View className={styles.dlg} animation={this.translate(5)}>
            <Text>{msgs[4] ? msgs[4] : ""}</Text>
          </View>

          <View className={styles.dlg} animation={this.translate(6)}>
            <Text>{msgs[5] ? msgs[5] : ""}</Text>
          </View>

          <View className={styles.dlg} animation={this.translate(7)}>
            <Text>{msgs[6] ? msgs[6] : ""}</Text>
          </View>

          <View className={styles.dlg} animation={this.translate(8)}>
            <Text>{msgs[7] ? msgs[7] : ""}</Text>
          </View>
          <View className={styles.dlg} animation={this.translate(9)}>
            <Text>{msgs[8] ? msgs[8] : ""}</Text>
          </View>

          <View className={styles.dlg} animation={this.translate(10)}>
            <Text>{msgs[9] ? msgs[9] : ""}</Text>
          </View>
        </ScrollView>

        <View className={styles['voice-container']}>
          <View>
            {
              this.state.useVoice ? (
                <View className={styles.robot}
                      disabled={this.state.disableVoice}
                      onTouchStart={() => {
                        this.startVoice(this.state.disableVoice);
                      }}
                      onTouchEnd={this.endVoice}>
                  <Image src={robot} className={styles.img}></Image>
                </View>
              ) : (
                <Form onSubmit={this.sendText}>
                  <Input placeholder='请输入文字' bindconfirm={this.sendText} cursorSpacing={5} adjustPosition={false}></Input>
                </Form>
              )
            }
          </View>
          <Text style={{textDecoration: 'underline', fontSize: '20rpx', color: '#ccc', marginTop: '36rpx'}}
                onClick={() => {
                  this.setState({useVoice: !this.state.useVoice})
                }}>
            {this.state.useVoice ? '用文字搜索' : '用语音对话'}
          </Text>
        </View>

      </View>
    );
  }

  startVoice = (disabled) => {
    if (!disabled)
      recorderManager.start(options);
  };

  endVoice = () => {
    recorderManager.stop();
    this.setState({disableVoice: true});
  };

  translate = (i) => {
    let animation = wx.createAnimation({
      duration: 2000, //1000
      timingFunction: 'ease',
    });
    animation.translateY(this.state.yPos + 'px').opacity(this.state.opacity[i]).step();
    return animation.export();
  };

  translateAns = (i) => {
    let animation = wx.createAnimation({
      duration: 500, //1000
      timingFunction: 'ease',
    });
    animation.translateY(this.state.aYPos + 'px').opacity(this.state.opacityA[i]).step();
    return animation.export();
  };

  sendText = (e) => {
    this.requestNLP(e.detail.value, false);
  }
}

export default Chat;
