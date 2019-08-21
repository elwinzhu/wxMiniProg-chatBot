import Taro, {Component} from '@tarojs/taro'
import {View, Button} from '@tarojs/components';
import styles from './index.module.scss';

import ProfileCard from '../../components/ProfileCard';
import Keys, {wxShowError} from '../../assets/constants';


let profiles = [];

class Profile extends Component {
  state = {
    selected: -1,
    profilePage: 0,
    opacity: 1,
  };
  
  componentWillMount() {
    //get the prepared data and compose the array
    let r = this.readPotentialProfiles(0);
  }
  
  render() {
    return (
      <View className={styles['container']}>
        <View style={{
          marginBottom: '42rpx',
          textAlign: 'center',
          color: '#49e7d8',
          fontSize: '42rpx',
          fontFamily: 'PingFangSC'
        }}>
          请问哪个是你？
        </View>
        
        <ScrollView className={styles['profile-container']} style={{height: '65.65%'}} scrollY>
          {
            profiles.map((p) => {
              return (
                <View key={p.id}
                      onClick={() => {
                        this.cardClick(p.id);
                      }}
                      animation={this.getAnimation(this.state.opacity)}
                      style={{marginBottom: '10rpx', '&:last-child': {marginBottom: 0}}}
                >
                  <ProfileCard name={p.name}
                               title={p.title}
                               avatar={p.imageUrl}
                               selected={p.selected}/>
                </View>
              )
            })
          }
        </ScrollView>
        
        <View className={styles['btn-container']}>
          <Button className={`${styles.btn} ${this.state.selected === -1 ? styles.btnDisabled : ""}`}
                  onClick={this.confirmProfile}
                  disabled={this.state.selected === -1}>
            确 认
          </Button>
        </View>
        
        <View className={styles['change-container']}>
          <Text onClick={this.notFoundMe}>没有我?</Text>
        </View>
      </View>
    );
  };
  
  getAnimation = (value) => {
    let animation = wx.createAnimation({
      duration: 450,
      timingFunction: 'ease',
    });
    animation.opacity(value).step();
    return animation.export();
  };
  
  readPotentialProfiles = (page) => {
    //page is zero based
    try {
      profiles = wx.getStorageSync(Keys.PotentialProfiles);
      if (!profiles) return false;
      
      return true;
    } catch (e) {
      console.log('Error reading potential profiles: ', e);
      return false;
    }
  };
  
  notFoundMe = () => {
    wx.showModal({
      title: '提示',
      content: '请确保你已有LinkedIn账号或输入更准确的姓名！',
      showCancel: false,
      confirmText: '好',
      complete: function (e) {
        wx.redirectTo({
          url: '../index/index?re-enterName=y'
        })
      }
    })
  };
  
  nextPage = () => {
    //show next page
    this.setState({opacity: 0, selected: -1});
    
    setTimeout(() => {
      let page = (this.state.profilePage + 1);
      this.readPotentialProfiles(page);
      
      this.setState({opacity: 1, profilePage: page})
    }, 400);
  };
  
  cardClick = (id) => {
    profiles.forEach((item) => {
      if (item.id === id) item.selected = true;
      else item.selected = false;
    });
    
    //console.log(profiles);
    this.setState({selected: id});
  };
  
  confirmProfile = () => {
    let profile = profiles.find(p => p.selected);
    
    //remove the potential profiles in storage
    //wx.removeStorageSync(Keys.PotentialProfiles);
    
    //local storage to save the user
    wx.setStorage({
      key: Keys.UserLinkedinProfile,
      data: profile,
      success: function (res) {
        wx.redirectTo({
          url: '../skill-analysis/index'
        });
      },
      fail: function () {
        wxShowError(true);
      }
    })
  }
}

export default Profile;
