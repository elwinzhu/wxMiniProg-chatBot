import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image, ScrollView} from '@tarojs/components';

import styles from './index.module.scss';
import JobCard from '../../components/JobCard';
import Keys, {wxShowError} from "../../assets/constants";
import robot from '../../assets/images/robot-circle.png';
import {avatarDefault} from '../../assets/constants/icons';


let jobs = null;

class JobRecomm extends Component {
  state = {
    op: 0,
    refresh: 0
  };
  
  componentWillMount() {
    this.userId = this.$router.params.userId;
    
    //get user profile from storage
    let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
    let userInfo = wx.getStorageSync(Keys.AppUserInfo);
    if (!profile || !userInfo) {
      wxShowError(undefined, undefined, () => {
        wx.redirectTo({url: '../index/index?witherror=1'});
      });
    }
    else {
      this.userAvatar = profile.imageUrl;
      this.talentName = profile.name;
      
      //**get the jobs from storage which is done in welcome page
      //before the component mount to render the jobs
      //jobs won't display if this action is taken in componentDidMount
      //let res = this.readRecommendations();
    }
  }
  
  componentDidShow() {
    this.readRecommendations();
    this.setState({refresh: this.state.refresh + 1});
  }
  
  render() {
    //if (!jobs || jobs.length === 0) return (<View></View>);
    
    return (
      <View className={styles['jobrecom-container']}>
        <View className={styles['header-container']}>
          <View className={styles['my-figure']} onClick={this.showGeneralInfo}>
            <Image src={this.userAvatar ? this.userAvatar : avatarDefault}
                   className={this.userAvatar ? styles.avatar : styles['without-avatar']}/>
            <Text className={styles.name}>{this.talentName}</Text>
          </View>
          
          <Text className={styles['my-resumes']} onClick={this.gotoMyJobs}>我的工作</Text>
        </View>
        
        <ScrollView className={styles['jobs-container']} scrollY={true}>
          {
            jobs &&
            jobs.map((j, i) => {
              return (
                <View key={j.id}
                      className={styles['card-container']}
                >
                  <JobCard title={j.title}
                           city={j.city}
                           company={j.company}
                           tags={j.tags}
                           score={j.score}
                           rightItems={j.rightItems}
                           logoUrl={j.logoUrl}
                           liked={j.liked}
                           jobId={j.id}
                           userId={this.userId}
                           onClick={() => {
                             this.jobClick(j.id)
                           }}/>
                </View>
              )
            })
          }
        </ScrollView>
        
        <View className={styles['voice-container']}>
          <Image className={styles.chatBtn} src={robot} onClick={this.gotoChat}></Image>
        </View>
      </View>
    );
  };
  
  readRecommendations = () => {
    try {
      jobs = wx.getStorageSync(Keys.Recommendations);
      if (!jobs) return false;
      
      return true;
    } catch (e) {
      console.error('Error reading recommendations: ', e);
      return false;
    }
  };
  
  jobClick = (jobId) => {
    console.log('recommendation click, ', `../send-resume/index?jobId=${jobId}&userId=${this.userId}&rightItems=2`);
    
    //pass the userid to next page
    wx.navigateTo({
      url: `../send-resume/index?jobId=${jobId}&rightItems=2&userId=${this.userId}`
    })
  };
  
  gotoChat = () => {
    wx.navigateTo({
      url: `../chat/index?userId=${this.userId}&useVoice=true`
    });
  };
  
  gotoMyJobs = () => {
    wx.navigateTo({
      url: `../my-jobs/index?userId=${this.userId}`
    });
  };
  
  showGeneralInfo = () => {
    wx.navigateTo({
      //url: `../general-info/index?userId=${this.userId}`
      url: `../send-resume/index?resumeView=true&userId=${this.userId}`
    });
  };
}

export default JobRecomm;
