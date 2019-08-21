import Taro, {Component} from '@tarojs/taro';
import {View, Text} from '@tarojs/components';

import styles from './index.module.scss';
import Keys, {wxShowError, Requests, responseOK, networkError} from "../../assets/constants";

import p1 from '../../assets/images/01.png';
import p3 from '../../assets/images/03.png';
import p4 from '../../assets/images/04.png';
import p5 from '../../assets/images/05.png';
import p6 from '../../assets/images/06.png';
import p8 from '../../assets/images/08.png';
import p9 from '../../assets/images/09.png';
import p10 from '../../assets/images/10.png';
import p11 from '../../assets/images/11.png';

let jobs = [];

let pngSeq = [p11, p3, p4, p5, p6, p8, p9, p10];
let pngSeq2 = [p11, p3, p4, p5, p6, p8, p9, p10, p11, p1];
let msgs = [
  ['小T正在为你生成', '匹配分数高的岗位推荐'],
  ['在结果页长按小T，可以', '与我对话，精准搜索工作']
];

const maxRetry = 10;

class Welcome extends Component {
  state = {seqIndex: 0, msgIndex: 0};
  
  componentDidMount() {
    //coming into page with app user created and info saved in storage
    //and linkedin profile bound to user
    //get id from the router parameter
    let userId = this.$router.params.userId;
    console.log('app user id: ', userId);
    
    //set a timer for the animation
    this.setRobotAnimation(userId);
    
    //request for recommended jobs
    this.getJobRecommendations(userId);
    
    //set displayed text turning
    this.txtTimer = setInterval(() => {
      this.setState({msgIndex: (this.state.msgIndex + 1) % 2})
    }, 1500);
    
    this.reqDone = false;
  };
  
  retryTimes = 0;
  getJobRecommendations = (userId) => {
    let me = this;
    
    wx.request({
      url: `${Requests.recommendJobs}/userId/${userId}?page=0&size=30`,
      success: function (res) {
        console.log(res.statusCode);
        
        if (!responseOK(res)) {
          console.log(`request url: ${Requests.recommendJobs}/userId/${userId}?page=0&size=30, get`);
          console.log(`error msg: ${res.data.title}`);
        }
        
        if (res.statusCode >= 500) {
          wx.navigateTo({url: '../error/index'})
        }
        else if (!responseOK(res)) {
          wx.clearStorageSync();
          wx.redirectTo({url: '../index/index?witherror=1'});
        }
        else {
          try {
            //in case the user logged off from another device
            if (!res.data) {
              wx.showModal({
                title: "错误",
                content: '数据错误，未能获取推荐的职位。点确认退出重试！',
                showCancel: true,
                confirmText: '确认',
                success(click) {
                  if (click.confirm) {
                    wx.clearStorageSync();
                    wx.redirectTo({url: '../index/index'});
                  }
                }
              });
            }
            else {
              //console.log(res.data.status);
              //check status
              if (res.data.status === "FINISHED") {
                clearInterval(me.requestTimer);
                
                //read data
                jobs = me.processData((res.data.jobs));
                wx.setStorageSync(Keys.Recommendations, jobs);
                
                me.reqDone = true;
                pngSeq.push(...pngSeq2);
              }
              else {
                if (!me.requestTimer && me.retryTimes < maxRetry) {
                  me.requestTimer = setInterval(() => {
                    me.retryTimes++;
                    me.getJobRecommendations(userId)
                  }, 600);
                }
                else {
                  if (me.retryTimes >= maxRetry) {
                    //at most 5 times
                    me.retryTimes = 0;
                    clearInterval(me.requestTimer);
                    
                    me.reqDone = true;
                    pngSeq.push(...pngSeq2);
                  }
                }
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
  
  setRobotAnimation = (userId) => {
    this.timer = setInterval(() => {
      if (!this.reqDone)
        this.setState({seqIndex: (this.state.seqIndex + 1) % 8});
      else {
        if (this.state.seqIndex === 17) {
          clearInterval(this.timer);
          clearInterval(this.txtTimer);
          
          setTimeout(() => {
            wx.redirectTo({
              url: jobs.length === 0 ?
                `../job-recommendation/no-data?userId=${userId}` :
                `../job-recommendation/index?userId=${userId}`
            });
          }, 800)
        }
        else
          this.setState({seqIndex: this.state.seqIndex + 1});
      }
    }, 150);
  };
  
  processData = (data) => {
    let arr = [];
    data.map((d, i) => {
      //if (i <= 4)
      arr.push({
        id: d.id,
        title: d.title,
        city: d.city,
        company: d.company,
        tags: ['人工智能', '大數據', 'NPL'],
        score: parseInt(d.score * 100),
        rightItems: 2,
        logoUrl: d.logo,
        liked: d.favorite
      })
    });
    return arr;
  };
  
  render() {
    return (
      <View className={styles.root}>
        <View className={styles.up}>
          <Text>{msgs[this.state.msgIndex][0]}</Text>
          <Text style={{marginTop: '6rpx'}}>{msgs[this.state.msgIndex][1]}</Text>
        </View>
        <View className={styles.down}>
          <Image src={pngSeq[this.state.seqIndex]}
                 style={{width: '384rpx', height: '365rpx'}}></Image>
        </View>
      </View>
    );
  }
}

export default Welcome;
