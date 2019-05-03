import Taro, {Component} from '@tarojs/taro';
import {View, Text, Canvas, Button, Progress} from '@tarojs/components';

import styles from './index.module.scss';
import Logo from '../../components/Logo';
import Keys, {
  wxShowError, Requests,
  networkError, responseOK
} from "../../assets/constants";

import p1 from '../../assets/images/01.png';
import p3 from '../../assets/images/03.png';
import p4 from '../../assets/images/04.png';
import p5 from '../../assets/images/05.png';
import p6 from '../../assets/images/06.png';
import p8 from '../../assets/images/08.png';
import p9 from '../../assets/images/09.png';
import p10 from '../../assets/images/10.png';
import p11 from '../../assets/images/11.png';


let pngSeq = [p11, p3, p4, p5, p6, p8, p9, p10];
let pngSeq2 = [p11, p3, p4, p5, p6, p8, p9, p10, p11, p1];

let preferredComp = [];
let assessment = [];

class SkillAnalysis extends Component {
  state = {
    xPos: 0,
    analysing: true,
    seqIndex: 0
  };
  
  componentDidMount() {
    // setTimeout(() => {
    //   this.setState({analysing: false});
    // }, 2000);
    //
    
    //set a timer for the animation
    this.setRobotAnimation();
    
    setTimeout(this.doAnalysis, 3000);
    // /this.doAnalysis();
    this.reqDone = false;
  }
  
  setRobotAnimation = () => {
    this.timer = setInterval(() => {
      if (!this.reqDone)
        this.setState({seqIndex: (this.state.seqIndex + 1) % 8});
      else {
        if (this.state.seqIndex === 17) {
          clearInterval(this.timer);
          
          setTimeout(() => {
            this.setState({analysing: false});
          }, 1200)
        }
        else
          this.setState({seqIndex: this.state.seqIndex + 1});
      }
    }, 150);
  };
  
  doAnalysis = () => {
    //assert that the app user has been created and saved into storage
    this.userId = wx.getStorageSync(Keys.AppUserInfo).id;
    let lp = wx.getStorageSync(Keys.UserLinkedinProfile),
      linkedInUrl = lp.url,
      photoUrl = lp.imageUrl;
    
    let me = this;
    
    //code for debugging
    // wx.request({
    //   url: `${Requests.skillAnalysis}/${me.userId}`,
    //   success: function (r) {
    //     if (responseOK(r)) {
    //       //got assessment
    //       //got preferred companies
    //       me.composeDisplayData(r.data);
    //
    //       me.reqDone = true;
    //       pngSeq.push(...pngSeq2);
    //     }
    //     else {
    //       wxShowError(false, "技能分析失败。请重试！", () => {
    //         wx.clearStorageSync();
    //       });
    //     }
    //   },
    //   fail: networkError
    // });
    // return;
    //code for debugging
    
    //request to bind user profile to created app user
    wx.request({
      url: Requests.bindProfileToAppUser,
      method: 'PUT',
      data: {
        id: me.userId,
        linkedInUrl,
        photoUrl
      },
      success(res) {

        if (res.statusCode >= 500) {
          wx.navigateTo({url: '../error/index'})
        } else if (responseOK(res)) {
          //assert that the user linkedin profile has existed in local storage
          //update the app user info
          wx.setStorageSync(Keys.AppUserInfo, res.data);
          
          //request for user skills analysis
          wx.request({
            url: `${Requests.skillAnalysis}/${me.userId}`,
            success: function (r) {
              if (res.statusCode >= 500) {
                wx.navigateTo({url: '../error/index'})
              } else if (responseOK(r)) {
                //got assessment
                //got preferred companies
                me.composeDisplayData(r.data);
                
                me.reqDone = true;
                pngSeq.push(...pngSeq2);
              } else {
                wxShowError(false, "技能分析失败。为您自动跳转到首页！", () => {
                  wx.redirectTo({url: '../index/index?reEnterName=y'});
                });
              }
            },
            fail: networkError
          })
        }
        else {
          // me.reqDone = true;
          // pngSeq.push(...pngSeq2);
          wxShowError(false, '您的LinkedIn资料获取失败。请重试！', () => {
            wx.redirectTo({
              url: '../select-profile/index'
            })
          });
        }
      },
      fail: networkError
    });
  };
  
  composeDisplayData = (response) => {
    //initialize the array
    preferredComp = [];
    assessment = [];
    
    response.companies.map((c, i) => {
      preferredComp.push({
        id: c.id,
        name: c.name,
        url: c.logo
      })
    });
    response.radars.map((r, i) => {
      assessment.push({
        label: r.name,
        value: r.score
      })
    })
  };
  
  render() {
    let index = this.state.seqIndex;
    
    return (
      <View className={styles.root}>
        {
          this.state.analysing ? (
            <View>
              <View className={styles.up}>
                <Text>小T正在分析</Text>
                <Text>......</Text>
              </View>
              <View className={styles.down}>
                <Image src={pngSeq[index]}
                       style={{width: '384rpx', height: '365rpx'}}></Image>
              </View>
            </View>
          ) : (
            <View>
              <View className={styles['chart-container']}>
                {/*<Canvas style='width: 420rpx; height: 420rpx; border: 1px solid yellow;'*/}
                {/*canvasId='radarChart'></Canvas>*/}
                
                {
                  assessment.map((a, i) =>
                    <View className={styles['value-bar-container']} key={i}>
                      <View className={styles['value-txt']}>
                        <Text>{a.label}</Text>
                        <Text>{a.value} %</Text>
                      </View>
                      <View className={styles.bar}>
                        <Progress percent={a.value}
                                  style={{flex: 1}}
                                  active borderRadius='10px'
                                  backgroundColor='rgba(56, 78, 148, 0.99)'
                                  activeColor="#41cae9" strokeWidth={10}/>
                      </View>
                    </View>
                  )
                }
              </View>
              
              <View className={styles['guess-fav-container']}>
                <View style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{fontSize: '28rpx', fontFamily: 'PingFangSC'}}>与HiTalent合作的客户中，我猜你感兴趣这些公司</Text>
                  <View className={styles['logo-container']}>
                    {
                      preferredComp.map(c =>
                        <View style={{
                          width: '214rpx', display: 'flex', justifyContent: 'center'
                        }} key={c.id}>
                          <Logo name={c.name}
                                imgUrl={c.url} companyId={c.id} size={130}></Logo>
                        </View>
                      )
                    }
                  </View>
                </View>
                
                <Button className={styles.btnStart}
                        onClick={() => {
                          wx.redirectTo({url: `../welcome/index?userId=${this.userId}`})
                        }}>开 始</Button>
              </View>
            </View>
          )
        }
      </View>
    );
  }
}

export default SkillAnalysis;
