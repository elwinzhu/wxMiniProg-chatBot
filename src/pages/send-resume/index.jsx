import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image, Button} from '@tarojs/components';
import styles from './index.module.scss';


import Hi from '../../components/Hi'
import Stepper from '../../components/Stepper';
import Keys, {wxShowError, Requests, responseOK, networkError} from "../../assets/constants";
import logo from '../../assets/images/robot-full.png';


let jobs = [
  {
    id: 1,
    title: "高級人工智能工程師",
    city: "Santa Clara, US",
    company: "Google",
    tags: ['人工智能', '大數據', 'shoucang1'],
    score: 92,
    //rightItems: 2,
    logoUrl: "https://pic.52112.com/icon/256/20161116/4003/212327.png",
    liked: true,
    progress: 0,
    type: 'fav'
  },
  {
    id: 2,
    title: "高級人工智能工程師",
    city: "Santa Clara, US",
    company: "Google",
    tags: ['人工智能', '大數據', 'NPL td1'],
    score: 90,
    //rightItems: 3,
    logoUrl: "https://pic.52112.com/icon/256/20161116/4003/212327.png",
    liked: false,
    progress: 1,
    type: 'applied'
  },
  {
    id: 3,
    title: "高級人工智能工程師",
    city: "Santa Clara, US",
    company: "Google",
    tags: ['人工智能', '大數據', 'NPL td2'],
    score: 89,
    //rightItems: 1,
    logoUrl: "https://pic.52112.com/icon/256/20161116/4003/212327.png",
    liked: true,
    progress: 2,
    type: 'applied'
  },
  {
    id: 4,
    title: "高級人工智能工程師",
    city: "Santa Clara, US",
    company: "Google",
    tags: ['人工智能', '大數據', 'NPL td3'],
    score: 89,
    //rightItems: 1,
    logoUrl: "https://pic.52112.com/icon/256/20161116/4003/212327.png",
    liked: true,
    progress: 2,
    type: 'applied'
  },
  {
    id: 5,
    title: "高級人工智能工程師",
    city: "Santa Clara, US",
    company: "Google",
    tags: ['人工智能', '大數據', 'shoucang2'],
    score: 89,
    //rightItems: 1,
    logoUrl: "https://pic.52112.com/icon/256/20161116/4003/212327.png",
    liked: true,
    progress: 0,
    type: 'fav'
  }
];
let me;

class SendResume extends Component {
  //check personal resume: resumeView true
  //apply jobs: resumeView false
  
  //step -1: nothing, default
  //step 0: show job details
  //step 1: confirm and send resume
  //step 2: show resume sent info
  
  state = {
    step: -1
  };
  
  componentWillMount() {
    this.setState({step: this.$router.params.resumeView === "true" ? 1 : 0});
  };
  
  componentDidMount() {
    //set this to the variable me.
    //necessary here
    me = this;
    
    let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
    this.avatar = profile.imageUrl;
    this.jobId = this.$router.params.jobId;
    this.userId = this.$router.params.userId;
  }
  
  sayHiClick = (email, phone) => {
    if (me.state.step === 1) {
      console.log('sending resume');
      //console.log(email, phone);
      
      wx.showLoading({
        title: '正在发送...',
        showMask: true
      });
      
      //request to send resume to the job
      wx.request({
        url: Requests.sendResume,
        method: 'POST',
        data: {
          jobId: me.jobId, userId: me.userId,
          email, phone
        },
        success: function (res) {
          if (!responseOK(res)) {
            console.log(res.statusCode);
            console.log(`request url: ${Requests.sendResume}, post`);
            console.log(`error msg: ${res.data.title}`);
          }
          
          if (res.statusCode >= 400) {
            wx.navigateTo({url: '../error/index'})
          } else if (!responseOK(res)) {
            wxShowError(false);
          }
          else {
            wx.hideLoading();
            me.setState({step: me.state.step + 1});
          }
        },
        fail: networkError
      });
    }
    else {
      me.setState({step: me.state.step + 1});
    }
  };
  
  backToList = () => {
    wx.navigateBack();
  };
  
  render() {
    //console.log(this.$router.params);
    let jobId = this.$router.params.jobId;
    let userId = this.$router.params.userId;
    let rightItems = parseInt(this.$router.params.rightItems);
    if (isNaN(rightItems))
      rightItems = 3;
    
    
    return this.$router.params.resumeView === "true" ?
      (
        <Hi step={1} resumeView userId={userId}
            disableContactInput={this.$router.params.resumeView === "true"}
            sayHiClick={(email, phone) => {
              this.sayHiClick(email, phone);
            }}/>
      ) : (
        this.state.step === 2 ?
          (
            <View className={styles['out-container']}>
              <View className={styles.up}>
                <Image className={styles.avatar}
                       src={logo}></Image>
                
                <View style={{
                  fontSize: '30rpx', color: '#49e7d8',
                  fontFamily: 'PingFangSC'
                }}>简历发送成功！</View>
                <View
                  style={{
                    fontSize: '23rpx', color: '#e7f5fc',
                    fontFamily: 'PingFangSC', marginTop: '20rpx'
                  }}>进入“首页-我的工作”可随时查看简历进度</View>
                <View style={{marginTop: '114rpx', width: '600rpx'}}>
                  <Stepper activeStep={0}/>
                </View>
              </View>
              
              <Button className={styles.backBtn} onClick={this.backToList}>返回职位列表</Button>
            
            </View>
          ) :
          this.state.step === 0 ?
            (
              <Hi jobId={jobId} step={0} userId={userId}
                  sayHiClick={() => {
                    this.sayHiClick();
                  }}
                  jobCardItems={rightItems}
              />
            ) :
            this.state.step === 1 ?
              (
                <Hi userId={userId} step={this.state.step}
                    disableContactInput={this.$router.params.resumeView === "true"}
                    sayHiClick={(email, phone) => {
                      this.sayHiClick(email, phone);
                    }}
                    cancel={() => {
                      this.setState({step: this.state.step - 1})
                    }}
                />
              ) : (
                <View></View>
              )
      )
  }
}

export default SendResume;
