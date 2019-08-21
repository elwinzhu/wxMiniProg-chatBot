import Taro, {Component} from '@tarojs/taro'
import {View, Image, Text} from '@tarojs/components'
import {done_eee, logoDefault, avatarDefault} from '../../assets/constants/icons';

import styles from './index.module.scss';
import Keys, {wxShowError, Requests, responseOK, networkError} from "../../assets/constants";

let me;

class Logo extends Component {
  constructor(props) {
    super();
    this.state = {checked: props.checked}
  }
  
  render() {
    let {name, imgUrl, companyId, uncheckconfirm, checkable, checked, size} = this.props;
    size = size ? size : 110;
    
    return (
      <View className={styles['logo-container']}>
        <Image src={imgUrl ? imgUrl : (companyId ? logoDefault : avatarDefault)}
               className={`${styles['logo-avatar']} ${companyId ? styles.company : ""} ${checked ? styles.checked : ""} ${checkable ? styles.checkable : ""}`}
               style={{
                 backgroundColor: imgUrl ? "none" : "white",
                 width: (!imgUrl && companyId) ? (size - 56 + 'rpx') : (size - (checked ? 4 : 0) + 'rpx'),
                 height: (!imgUrl && companyId) ? (size - 56 + 'rpx') : (size - (checked ? 4 : 0) + 'rpx'),
                 padding: (!imgUrl && companyId) ? '28rpx' : 0
               }}
               mode='aspectFit'
               onClick={this.handleClick}/>
        {
          checked &&
          <Image className={styles.selectedIcon}
                 src={done_eee}/>
        }
        {
          name &&
          <Text className={styles['logo-text']}>{name}</Text>
        }
      </View>
    );
  }
  
  handleClick = () => {
    if (!this.props.checkable) return;
    
    me = this;
    if (this.state.checked && this.props.uncheckConfirm) {
      wx.showModal({
        content: '删除该公司吗',
        confirmText: "确认",
        cancelText: "取消",
        success: function (e) {
          if (e.confirm) {
            me.toggleFavorite(false);
          }
        }
      })
    }
    else {
      me.toggleFavorite(!this.state.checked);
    }
  };
  
  //request to toggle the fav companies
  //addOrRemove: true to add, false to remove
  toggleFavorite(addOrRemove) {
    let userId = wx.getStorageSync(Keys.AppUserInfo).id;
    let cid = this.props.companyId;
    
    wx.request({
      url: `${Requests.favoriteCompany}`,
      method: addOrRemove ? 'POST' : 'DELETE',
      data: {
        companyId: cid,
        userId
      },
      success: function (res) {
        if (responseOK(res)) {
          wx.showToast({
            'title': addOrRemove ? '已添加' : '已删除'
          });
          me.setState({checked: !me.state.checked});
        }
        else {
          console.log(res.statusCode);
          console.log(`request url: ${Requests.favoriteCompany}, ${addOrRemove ? 'POST' : 'DELETE'}`);
          console.log(`error msg: ${res.data.title}`);
          
          wxShowError(false);
        }
      },
      fail: networkError
    });
  }
}

export default Logo;
