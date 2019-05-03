import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button, Image} from '@tarojs/components';
import styles from './index.module.scss';
import Keys, {wxShowError, Requests, networkError, responseOK} from "../../assets/constants";
import {rightArrow} from '../../assets/constants/icons';


let buttons = [
  {
    txt: '我感兴趣的公司',
    navUrl: '../fav-companies/index?'
  },
  {
    txt: '简历预览',
    navUrl: '../send-resume/index?showBtn=false&resumeView=true'
  },
  {
    txt: '关于我们',
    navUrl: '../comp-info/index?'
  }
];

class Info extends Component {
  componentWillMount() {
    let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
    if (!profile) {
      wxShowError(undefined);
    }
    else {
      this.userAvatar = profile.imageUrl;
      this.talentName = profile.name;
    }
  }

  componentDidMount() {
    wx.setNavigationBarTitle({title: '我的设置'});
    this.userId = this.$router.params.userId;
  }

  render() {
    return (
      <View className={styles['out-container']}>
        <View className={styles.up}>
          <View className={styles.avatar} style={{backgroundImage: `url(${this.userAvatar});`}}></View>
          <Text style={{
            color: '#e7f5fc',
            fontSize: '34rpx',
            fontWeight: 500,
            fontFamily: 'PingFangSC'
          }}>{this.talentName}</Text>
        </View>

        <View className={styles.down}>
          {
            buttons.map((b, i) =>
              <Button key={i} className={styles.btn}
                      onClick={() => {
                        wx.navigateTo({url: b.navUrl + `&userId=${this.userId}`})
                      }}>
                <Text className={styles['btn-txt']}>{b.txt}</Text>
                <Image src={rightArrow} className={styles.img}></Image>
              </Button>
            )
          }

          <Button className={styles['btn-log-out']}
                  onClick={this.logOut}>
            <Text style={{
              color: 'white',
              fontSize: '36rpx',
              fontFamily: 'PingFangSC',
              color: '#e7f5fc'
            }}>注 销</Text>
          </Button>
        </View>
      </View>
    );
  }

  logOut = () => {
    //request for data cleaning of this user in backend
    wx.request({
      url: `${Requests.appUserLogOut}/${this.userId}`,
      method: 'DELETE',
      success: function (res) {
        console.log(res)
        if (res.statusCode >= 500){
          wx.navigateTo({url: `../error/index`})
        }else if (!responseOK(res)) {
          wxShowError(false);
        }
        else {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          wx.clearStorageSync();
          // setTimeout(wx.reLaunch({
          //   url: '../index/index'
          // }),3000)

        }
      },
      fail: networkError
    });
  }
}

export default Info;
