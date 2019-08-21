import Taro, {Component} from '@tarojs/taro';
import {View, Text, Input, Form} from '@tarojs/components';

import logo from '../../assets/images/robot-full.png';

import styles from './index.module.scss';
import Keys, {
  wxShowError, Requests,
  networkError, responseOK, pxBase
} from '../../assets/constants';

const guideText = Object.freeze({
  hi: ['Hi，', '我是您的智能小助手！'],
  hi2: ['我能帮您', '找工作 / 做推荐 / 投简历'],
  hi3: ['我是小T！', '请问您的LinkedIn姓名是什么？'],
});

let windowWidth = 0;

class Index extends Component {
  state = {
    xPos: 0
  };
  
  componentWillMount() {
    this.getAppUser();
    //check screen width
    windowWidth = wx.getSystemInfoSync().windowWidth;
    this.reEnterName = this.$router.params['re-enterName'] === 'y';
  }
  
  componentDidMount() {
    if (!this.reEnterName) {
      setTimeout(this.xTranslate, 2000); //2000
      setTimeout(this.xTranslate, 5500); //5500
    }
  };
  
  xTranslate = () => {
    this.setState({xPos: this.state.xPos - windowWidth});
  };
  
  render() {
    return (
      <View className={styles.root}>
        <View className={styles.intro} style={{height: '46.1%'}}>
          {
            this.reEnterName && (
              <View className={styles.container} style={{width: 3 * windowWidth + 'px'}}>
                <View className={styles['text-container3']} style={{width: windowWidth + 'px', fontSize: '40rpx'}}>
                  <Text>{guideText.hi3[0]}</Text>
                  <Text style={{marginTop: '8rpx'}}>{guideText.hi3[1]}</Text>
                  
                  <Input type='text' placeholder='请输入你的名字'
                         className={styles.input}
                    //onConfirm={this.submitName}
                         onBlur={this.submitName}
                         placeholderClass={styles.ph}
                  />
                </View>
              </View>
            )
          }
          {
            !this.reEnterName && (
              <View className={styles.container} style={{width: 3 * windowWidth + 'px'}}
                    animation={this.state.xPos !== 0 ? this.getAnimation() : null}
              >
                <View className={styles['text-container1']} style={{width: windowWidth + 'px', fontSize: '40rpx'}}>
                  <Text>{guideText.hi[0]}</Text>
                  <Text style={{marginTop: '8rpx'}}>{guideText.hi[1]}</Text>
                </View>
                <View className={styles['text-container2']} style={{width: windowWidth + 'px', fontSize: '40rpx'}}>
                  <Text>{guideText.hi2[0]}</Text>
                  <Text style={{marginTop: '8rpx'}}>{guideText.hi2[1]}</Text>
                </View>
                <View className={styles['text-container3']} style={{width: windowWidth + 'px', fontSize: '40rpx'}}>
                  <Text>{guideText.hi3[0]}</Text>
                  <Text style={{marginTop: '8rpx'}}>{guideText.hi3[1]}</Text>
                  
                  <Input type='text' placeholder='请输入你的名字'
                         className={styles.input}
                    //onConfirm={this.submitName}
                         onBlur={this.submitName}
                         placeholderClass={styles.ph}
                  />
                </View>
              </View>
            )
          }
        </View>
        
        <View className={styles['avatar-container']}>
          <Image className={styles.avatar} src={logo}>
          </Image>
        </View>
      </View>
    );
  }
  
  getAnimation = () => {
    let animation = wx.createAnimation({
      duration: 1000, //1000
      timingFunction: 'ease',
    });
    animation.translateX(this.state.xPos).step();
    return animation.export();
  };
  
  submitName = (e) => {
    if (e.detail.value.trim() === '')
      return;
    
    wx.showLoading({
      mask: true
    });
    
    //check app user creation result from local storage
    if (!wx.getStorageSync(Keys.AppUserInfo))
      wxShowError(undefined, '用户未创建成功，请稍后重试！');
    else {
      //prepare data for the profile page
      wx.request({
        url: `${Requests.getPotentialProfiles}/${e.detail.value}`,
        success: function (res) {
          // res.data.people = []
          // res.statusCode = 500
          // res.data=undefined
  
          if (!responseOK(res)) {
            console.log(res.statusCode);
            console.log(`request url: ${Requests.getPotentialProfiles}/${e.detail.value}, get`);
            console.log(`error msg: ${res.data.title}`);
          }
          
          if (res.statusCode >= 500) {
            wx.hideLoading();
            wx.navigateTo({url: `../error/index`})
          } else if (!responseOK(res) || !res.data || !res.data.people) {
            wxShowError(false, '数据错误。请退出重来或联系我们！');
          }
          else if (res.data.people.length === 0) {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '没有找到相关资料。请确认输入正确并已有LinkedIn账号。',
              showCancel: false,
              confirmText: '好',
            });
          }
          else {
            try {
              wx.setStorageSync(Keys.PotentialProfiles, res.data.people);
              wx.hideLoading();
              wx.redirectTo({url: `../select-profile/index`});
            } catch (ex) {
              wxShowError(true);
            }
          }
        },
        fail: function () {
          networkError();
        }
      });
    }
  };
  
  getAppUser = () => {
    let withErr = this.$router.params.witherror === '1';
    console.log("error redirect to user guidance?: ", withErr);
    
    if (withErr) {
      this.performWxLogin();
    }
    else {
      //check the app user info from local storage
      let ui = wx.getStorageSync(Keys.AppUserInfo);
      if (ui) {
        console.log('Info: App user existing in local storage. No wxlogin performed.');
        
        //app user has existed. check profile bound
        //and determine whether do a redirect
        let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
        if (profile) {
          //assert the talentId has been created in ui
          //profile saved too. redirect to welcome
          wx.redirectTo({url: `../welcome/index?userId=${ui.id}`});
        }
        else {
          let profBound = this.checkProfileBound(ui);
          if (profBound)
            wx.redirectTo({url: `../welcome/index?userId=${ui.id}`});
          else
            this.performWxLogin();
        }
      }
      else {
        console.log('Info: App user not existing in local storage. Perform a wx login');
        
        //no app user info. do a wxLogin and get the app user
        this.performWxLogin();
      }
    }
  };
  
  performWxLogin = () => {
    let me = this;
    wx.login({
      success(res1) {
        console.log(res1);
        
        if (res1.code) {
          console.log(res1.code);
          
          wx.request({
            url: Requests.getAppUser,
            method: 'POST',
            data: {
              jsCode: res1.code
            },
            success(res) {
              console.log(res);
              console.log(res.data);
              
              if (!responseOK(res)) {
                console.log(res.statusCode);
                console.log(`request url: ${Requests.getAppUser}, post`);
                console.log(`error msg: ${res.data.title}`);
              }
              
              if (res.statusCode >= 500) {
                wx.navigateTo({url: `../error/index`})
              } else if (responseOK(res)) {

                let userInfo = res.data;
                //save app user
                wx.setStorageSync(Keys.AppUserInfo, userInfo);
                let profBound = me.checkProfileBound(userInfo);
                if (profBound)
                  wx.redirectTo({url: `../welcome/index?userId=${userInfo.id}`});
              }
              else{
                  wxShowError(false, "创建系统用户失败, 请退出重试！");
              //   wx.showModal({
              //     title: "错误",
              //     content: "创建系统用户失败, 请退出重试！",
              //     showCancel: false,
              //     complete() {
              //       wx.redirectTo({url: "../index/index"})
              //     }
              //   })
              }
            },
            fail() {
              networkError();
            }
          })
        }
        else {
          // wx.showModal({
          //   title: "错误",
          //   content: "微信登录失败，请重试",
          //   showCancel: false,
          //   complete() {
          //     wx.redirectTo({url: "../index/index"})
          //   }
          // })
          wxShowError(false, "创建系统用户失败, 请退出重试！");
        }
      },
      fail() {
        networkError();
      }
    });
  };
  
  checkProfileBound = (userInfo) => {
    if (userInfo.talentId) {
      //assert that talent object must exist in userInfo
      //save talent info and profile
      let {talent} = userInfo;
      if (!talent) return false;
      console.log('has talent info', talent);
      
      //compose linkedin profile and save to local
      let p = {
        name: talent.fullName,
        url: talent.linkedInUrl,
        title: talent.summary,
        location: talent.location,
        imageUrl: talent.photoUrl
      };
      wx.setStorageSync(Keys.UserLinkedinProfile, p);
      
      return true;
    }
    else
      return false;
  }
}

export default Index;
