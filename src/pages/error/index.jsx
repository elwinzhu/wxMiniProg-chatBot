import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image} from '@tarojs/components';
import styles from './index.module.scss';
import logo from '../../assets/images/robot-fail-big.png';
import Keys, {networkError, Requests, responseOK, wxShowError} from "../../assets/constants";

class errorPage extends Component {
  render() {
    return (
      <View className={styles.root}>
        <View className={styles['error-container']}>
          <Text className={styles['error-num']}>
            OOPS!
          </Text>
          <Image className={styles.robot} src={logo}>
          </Image>
          <View className={styles['error-label']}>
            错了哎，小T还在努力中 去
            <Text onClick={this.goToMainPage} className={styles['main-page-link']}>
              首页
            </Text>
            看看吧
          </View>
        </View>
        <Button className={styles['report-btn']} onClick={this.reportError}>
          <Text className={styles['report-btn-text']}>
            报 错
          </Text>
        </Button>
        <Button className={styles['btn-log-out']}
                onClick={this.logOut}>
          <Text style={{
            color: 'white',
            fontSize: '30rpx',
            fontFamily: 'PingFangSC',
            color: '#e7f5fc'
          }}>注 销</Text>
        </Button>
      </View>
    )
  }
  
  reportError = () => {
    wx.showModal({
      title: '报错',
      content: '您确定要把错误报告给我们吗？',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '报错成功',
            icon: 'success',
            duration: 1000
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  };
  
  goToMainPage = () => {
    const userId = this.$router.params.userId;
    const appUserInfo = wx.getStorageSync(Keys.AppUserInfo);
    if (userId) {
      wx.redirectTo({url: `../welcome/index?userId=${this.$router.params.userId}`});
    } else if(appUserInfo) {
      wx.redirectTo({url: `../index/index?re-enterName=y`});
    }else{
      wx.redirectTo({url: `../index/index?witherror=1`});
    }
  }
  
  logOut = () => {
    //get userId from local storage since possibly no such parameter passed
    let userId = wx.getStorageSync(Keys.AppUserInfo).id;
  
    wx.request({
      url: `${Requests.appUserLogOut}/${userId}`,
      method: 'DELETE',
      success: function (res) {
        if (!responseOK(res)) {
          console.log(res.statusCode);
          console.log(`request url: ${Requests.appUserLogOut}/${userId}, delete`);
          console.log(`error msg: ${res.data.title}`);
        
          wxShowError(false);
        }
        else {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000,
            complete() {
              wx.clearStorageSync();
              setTimeout(() => {
                wx.reLaunch({
                  url: '../index/index'
                })
              }, 1500)
            }
          });
        }
      },
      fail: networkError
    });
  }
}

export default errorPage
