import Taro, {Component} from '@tarojs/taro';

import {View, Text, Image, ScrollView, Input} from '@tarojs/components';
import styles from './index.module.scss';
import Keys, {Requests, wxShowError, responseOK, networkError} from "../../assets/constants";
import robot from '../../assets/images/robot-circle.png';
import robotLoading from '../../assets/images/loading.png';
import robotFail from '../../assets/images/robot-fail.png';
import listening from '../../assets/images/robot-listening.png';


let msgs = [];
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
const images = {
  robotDefault: robot,
  listening, robotLoading, robotFail
};

class Index extends Component {
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {
      roundQ: -1,
      roundA: -1,
      opacityQ: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      opacityA: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      useVoice: this.$router.params.useVoice === "true",
      disableVoice: true,
      scrollTop: 0,
      imageName: 'robotDefault',
      chatFailed: false,
      txt: ''
    };
  }
  
  componentWillMount() {
    
    let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
    this.userName = profile.name;
    this.userId = this.$router.params.userId;
    
    //clear the list to initialize a new session
    msgs = [];
    answers = [];
  };
  
  componentDidMount() {
    this.getChatBoxHeight();
    this.createRecordManager();
    
    //initialize the session
    this.requestNLP("", true);
  }
  
  displayVoiceTxt = (translatedTxt) => {
    let me = this;
    
    answers.push(translatedTxt);
    let roundA = me.state.roundA + 1;
    let op = me.state.opacityA;
    op[roundA] = 1;
    
    me.setState({
      opacityA: op,
      roundA,
      scrollTop: me.state.scrollTop + 150
    });
  };
  
  handleChange = (e) => {
    // console.log('onChange', e)
    this.setState({
      txt: e.detail.value
    })
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
        
        try {
          let txt = JSON.parse(e.data).data;
          if (!txt) {
            //empty txt
            me.setState({
              disableVoice: false,
              imageName: 'robotDefault'
            });
            return;
          }
          
          me.displayVoiceTxt(txt);
          me.requestNLP(txt, false);
        }
        catch (ex) {
          wxShowError(false, '语音识别错误！');
          me.setState({disableVoice: true, imageName: 'robotFail'});
        }
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
      header: {
        cookie: me.jsessionId ? me.jsessionId : undefined
      },
      data: {
        sessionId: me.userId,
        userName: me.userName,
        clearDialogHistory: initSession,
        initSession,
        currentUtterance: txt,
      },
      success(res) {
        console.log(`nlp response, init ${initSession}: `, res);
        
        if (responseOK(res)) {
          //console.log(res.cookies[0]);
          
          if (!me.jsessionId)
            me.jsessionId = res.header['Set-Cookie'];
          
          let roundQ = me.state.roundQ + 1;
          let op = me.state.opacityQ;
          op[roundQ] = 1;
          
          msgs.push(res.data.response.strToDisplay);
          
          me.setState({
            roundQ,
            opacityQ: op,
            disableVoice: (
              res.data.action === "jobSearch" ||
              res.data.action === "job.search_overInteractionLimit"
            ),
            imageName: res.data.action === "job.search_overInteractionLimit"
              ? 'robotFail' : 'robotDefault',
            chatFailed: (
              res.data.action === "jobSearch" ||
              res.data.action === "job.search_overInteractionLimit"
            ),
            scrollTop: me.state.scrollTop + 150
          });
          
          //with session end flag, start to send request
          //to search the companies
          if (res.data.action === "job.search") {
            //get parameters from the response and send request
            //to search jobs
            let parseRes = res.data.response.parameters;
            let re = /'([^']+)'/;
            let searchValue = re.exec(res.data.response.strToRead)[1];
            
            //console.log(parseRes);
            setTimeout(() => {
              me.searchJobs(parseRes, searchValue);
            }, 1500);
          }
        }
        else wxShowError(false, '语音处理失败！');
      },
      fail: networkError
    });
  };
  
  retryTimes = 0;
  lastreturned = false;
  searchJobs = (searchParams, keyword) => {
    let me = this;
    me.lastreturned = false;
    wx.showLoading({showMask: true});
    
    wx.request({
      url: `${Requests.searchJobs}/userId/${me.userId}`,
      method: 'POST',
      data: {
        search_restrictions: searchParams,
        default_geo_distance: '40km'
        //search: JSON.stringify(searchParams)
      },
      success: function (res) {
        me.lastreturned = true;
        if (res.statusCode >= 500) {
          clearInterval(me.requestTimer);
          wx.navigateTo({url: `../error/index`});
        }
        else if (res.statusCode >= 400) {
          wx.showModal({
            title: '搜索失败',
            content: '抱歉我们未能找到相关职位, 重新输入搜索条件试试？',
            showCancel: false,
            success(r) {
              if (r.confirm) {
                wx.redirectTo(
                  {url: `../chat/index?userId=${me.$router.params.userId}&useVoice=${me.state.useVoice}`}
                );
              }
            }
          });
          clearInterval(me.requestTimer);
        }
        else if (!responseOK(res)) {
          clearInterval(me.requestTimer);
          wxShowError(false);
        }
        else {
          console.log('chat - job search');
          
          try {
            //got jobs
            //console.log(res.data);
            // let arr = res.data.slice(0, 6);
            // console.log(arr);
            //return;
            console.log(res);
            
            //check status
            if (res.data.status === "FINISHED") {
              //got data
              clearInterval(me.requestTimer);
              wx.setStorageSync(Keys.JobSearchResult, res.data.jobs);
              
              wx.hideLoading();
              wx.redirectTo({url: `../job-search/index?userId=${me.userId}&value=${encodeURIComponent(keyword)}`});
            }
            // else if (res.data.status === "NO_JOB_IN_QUERY_LOCATION" ||
            //   res.data.status === "NO_JOB_IN_QUERY_LOCATION"
            // ){
            //   clearInterval(me.requestTimer);
            //   wx.setStorageSync(Keys.JobSearchResult, []);
            //   wx.hideLoading();
            // }
            else if (res.data.status === "RELATIVE_TITLES_RECOMMENDED" ||
              res.data.status === "HOT_TITLES_RECOMMENDED") {
              clearInterval(me.requestTimer);
              
              wx.setStorageSync(Keys.HotTitles, res.data.recommended_titles);
              wx.setStorageSync(Keys.SearchParams, searchParams);
              wx.redirectTo({url: `../job-search/no-data?userId=${me.userId}&value=${encodeURIComponent(keyword)}&area=${res.data.search_area_size}&nodata=${encodeURIComponent(keyword)}`});
            }
            else {
              if (!me.requestTimer) {
                me.requestTimer = setInterval(() => {
                  me.retryTimes++;
                  if (me.lastreturned)
                    me.searchJobs(searchParams, keyword);
                }, 800);
              }
            }
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
  
  startVoice = (disabled) => {
    if (!disabled) {
      recorderManager.start(options);
      //set image
      this.setState({imageName: 'listening'});
      wx.showLoading({
        title: '小T正在听...'
      })
    }
  };
  
  endVoice = () => {
    if (!this.state.disableVoice) {
      recorderManager.stop();
      wx.hideLoading();
      this.setState({disableVoice: true, imageName: 'robotLoading'});
    }
  };
  
  translate = (i) => {
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.opacity(this.state.opacityQ[i]).step();
    return animation.export();
  };
  
  translateAns = (i) => {
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.opacity(this.state.opacityA[i]).step();
    return animation.export();
  };
  
  sendText = (e) => {
    let txt = e.detail.value;
    
    this.displayVoiceTxt(txt);
    
    this.requestNLP(txt, false);
    
    this.setState({
      txt: ''
    });
  };
  
  render() {
    let {roundA, roundQ} = this.state;
    
    return (
      <View className={styles.root}>
        <View className={styles['chat-container']}>
          <ScrollView className={styles['scroll-content']} scrollY scrollTop={this.state.scrollTop}
                      scrollWithAnimation>
            
            <View className={`${styles['dlg1']} ${styles.dlg}`} id='dlg1'>
              <View className={styles.question} animation={this.translate(0)}>
                <View className={roundQ >= 0 ? styles.questionTxt : ""}>
                  {msgs[0] ? msgs[0] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(0)}>
                <View className={roundA >= 0 ? styles.answerTxt : ""}>
                  {answers[0] ? answers[0] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(1)}>
                <View className={roundQ >= 1 ? styles.questionTxt : ""}>
                  {msgs[1] ? msgs[1] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(1)}>
                <View className={roundA >= 1 ? styles.answerTxt : ""}>
                  {answers[1] ? answers[1] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(2)}>
                <View className={roundQ >= 2 ? styles.questionTxt : ""}>
                  {msgs[2] ? msgs[2] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(2)}>
                <View className={roundA >= 2 ? styles.answerTxt : ""}>
                  {answers[2] ? answers[2] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`} id='dlg1'>
              <View className={styles.question} animation={this.translate(3)}>
                <View className={roundQ >= 3 ? styles.questionTxt : ""}>
                  {msgs[3] ? msgs[3] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(3)}>
                <View className={roundA >= 3 ? styles.answerTxt : ""}>
                  {answers[3] ? answers[3] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(4)}>
                <View className={roundQ >= 4 ? styles.questionTxt : ""}>
                  {msgs[4] ? msgs[4] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(4)}>
                <View className={roundA >= 4 ? styles.answerTxt : ""}>
                  {answers[4] ? answers[4] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`} id='dlg1'>
              <View className={styles.question} animation={this.translate(5)}>
                <View className={roundQ >= 5 ? styles.questionTxt : ""}>
                  {msgs[5] ? msgs[5] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(5)}>
                <View className={roundA >= 5 ? styles.answerTxt : ""}>
                  {answers[5] ? answers[5] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(6)}>
                <View className={roundQ >= 6 ? styles.questionTxt : ""}>
                  {msgs[6] ? msgs[6] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(6)}>
                <View className={roundA >= 0 ? styles.answerTxt : ""}>
                  {answers[6] ? answers[6] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(7)}>
                <View className={roundQ >= 7 ? styles.questionTxt : ""}>
                  {msgs[7] ? msgs[7] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(7)}>
                <View className={roundA >= 7 ? styles.answerTxt : ""}>
                  {answers[7] ? answers[7] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(8)}>
                <View className={roundQ >= 8 ? styles.questionTxt : ""}>
                  {msgs[8] ? msgs[8] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(8)}>
                <View className={roundA >= 8 ? styles.answerTxt : ""}>
                  {answers[8] ? answers[8] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(9)}>
                <View className={roundQ >= 9 ? styles.questionTxt : ""}>
                  {msgs[9] ? msgs[9] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(9)}>
                <View className={roundA >= 9 ? styles.answerTxt : ""}>
                  {answers[9] ? answers[9] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg}`}>
              <View className={styles.question} animation={this.translate(10)}>
                <View className={roundQ >= 10 ? styles.questionTxt : ""}>
                  {msgs[10] ? msgs[10] : ""}
                </View>
              </View>
              <View className={styles.answer} animation={this.translateAns(10)}>
                <View className={roundA >= 10 ? styles.answerTxt : ""}>
                  {answers[10] ? answers[10] : ""}
                </View>
              </View>
            </View>
            
            <View className={`${styles.dlg} ${styles.bottomPlace}`}>
              <Text>bottom place holder</Text>
            </View>
          </ScrollView>
        </View>
        <View className={styles['voice-container']}>
          <View>
            {
              
              this.state.useVoice ? (
                <View className={styles.robot}
                      onTouchStart={() => {
                        this.startVoice(this.state.disableVoice);
                      }}
                      onTouchEnd={this.endVoice}
                      onTouchCancel={() => {
                        this.setState({disableVoice: false});
                      }}
                      onClick={this.endVoice}
                >
                  <Image src={images[this.state.imageName]} className={styles.img}></Image>
                </View>
              ) : (
                
                <Input placeholder='请输入文字'
                       onConfirm={this.sendText}
                       className={styles.txt}
                       placeholderClass={styles.ph}
                       onInput={this.handleChange}
                       value={this.state.txt}></Input>
              )
            }
          </View>
          {
            this.state.useVoice ? (
              <View className={styles['action-hit']}>
                {
                  !this.state.chatFailed &&
                  <View>
                    <Text>
                      长按对话，或
                    </Text>
                    <Text style={{textDecoration: 'underline', color: '#d6eefb'}}
                          onClick={() => {
                            this.setState({useVoice: !this.state.useVoice})
                          }}>用文字搜索</Text>
                  </View>
                }
              </View>
            ) : (
              <Text className={styles['action-hit']}
                    style={{marginTop: '20rpx'}}
                    onClick={() => {
                      this.setState({useVoice: !this.state.useVoice})
                    }}>
                用语音对话
              </Text>
            )
          }
        
        </View>
      </View>
    );
  }
}

export default Index;
