import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components';

import styles from './no-data.module.scss';
import Keys, {wxShowError} from "../../assets/constants";
import robot from '../../assets/images/robot-circle.png';
import {avatarDefault} from '../../assets/constants/icons';


class JobRecomm extends Component {
  
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
    }
  }
  
  render() {
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
        
        <View className={styles['jobs-container']}>
          <View style={{width: '470rpx'}}>
            小T发现你的LinkedIn信息还不够完整，暂时无法找到与你匹配的工作
          </View>
        </View>
        
        <View className={styles['voice-container']}>
          <Image className={styles.chatBtn} src={robot} onClick={this.gotoChat}></Image>
          <View className={styles['bot-txt']}>试试看点击小T，进行精准职位搜索</View>
        </View>
      </View>
    );
  };
  
  
  gotoChat = () => {
    wx.navigateTo({url: `../chat/index?userId=${this.userId}&useVoice=true`});
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
