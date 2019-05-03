import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image, Input, Form} from '@tarojs/components';
import styles from './index.module.scss';

import Icons from '../../assets/constants/icons';
import Keys, {networkError, Requests, responseOK, wxShowError} from "../../assets/constants";


let companies = [];

class SearchCompany extends Component {
  state = {showRes: false};
  
  componentDidMount() {
    wx.setNavigationBarTitle({title: '添加公司'});
    
    this.userId = wx.getStorageSync(Keys.AppUserInfo).id;
  };
  
  render() {
    return (
      <View className={styles['container']}>
        <View className={styles['search-box']}>
          <Form style={{width: '100%', position: 'relative'}} onSubmit={this.search}>
            <Image src={Icons.search} className={styles.icon}/>
            <Input className={styles['search-txt']} bindconfirm={this.search}></Input>
          </Form>
        </View>
        
        {
          this.state.showRes &&
          <View className={styles['comp-container']}>
            <View style={{
              color: '#e7f5fc', fontFamily: 'PingFangSC',
              fontSize: '30rpx',
              fontWeight: 500
            }}>
              Search Result
            </View>
            
            {
              companies.map(c => {
                return (
                  <View className={styles['comp-card']} key={c.id}
                        onClick={() => {
                          this.addFavCompany(c.id);
                        }}>
                    <Image src={c.logo}
                           className={styles.logo}
                    ></Image>
                    <Text className={styles.txt}>{c.name}</Text>
                  </View>
                );
              })
            }
          </View>
        }
      </View>
    );
  }
  
  search = (e) => {
    let me = this;
    wx.showLoading({mask: true});
    
    wx.request({
      url: `${Requests.searchCompany}/search?name=${e.detail.value}`,
      success: function (res) {
        if (res.statusCode >= 400) {
          wx.navigateTo({url: '../error/index'})
        } else if (responseOK(res)) {
          //got companies
          companies = res.data;
          me.setState({showRes: true});
          wx.hideLoading();
        }
        else {
          wxShowError(false);
        }
      },
      fail: networkError
    });
  };
  
  
  addFavCompany = (id) => {
    let me = this;
    
    wx.request({
      url: `${Requests.favoriteCompany}`,
      method: 'POST',
      data: {
        companyId: id, userId: me.userId,
      },
      success: function (res) {
        if (responseOK(res)) {
          wx.showToast({
            title: '已添加'
          });
        }
        else {
          wxShowError(false);
        }
      },
      fail: networkError
    });
  };
}

export default SearchCompany;
