import Taro, {Component} from '@tarojs/taro'
import {View, Image, Button} from '@tarojs/components';
import styles from './index.module.scss';

import Logo from '../../components/Logo';
import Keys, {wxShowError, arrayToRows, Requests, responseOK, networkError} from '../../assets/constants';
import {addIcon} from '../../assets/constants/icons';

let data = [];
let companies = [];

class FavCompany extends Component {
  state = {loading: true};

  componentDidMount() {
    wx.setNavigationBarTitle({title: '感兴趣的公司'});

    //if (companies.length === 0)
    //this.getMyFavCompanies();
  };

  componentWillMount(){
    companies = [];
  }

  componentDidShow(){
    this.userId = this.$router.params.userId;
    this.getMyFavCompanies();
  }


  render() {
    return (
      <View className={styles['container']}>
        {
          companies.map((row, ri) => {
              return (
                <View className={styles.row} key={ri}>
                  {
                    row.map((c, ci) => {
                        return (
                          !c.type ?
                            (
                              <View key={ci}>
                                <Logo name={c.name} checked checkable uncheckConfirm
                                      imgUrl={c.logo}
                                      companyId={c.id}>
                                </Logo>
                              </View>
                            ) :
                            c.type === Keys.IconCreate ?
                              (
                                <View key={ci}>
                                  <View className={styles['addFav-container']}>
                                    <Button className={styles['add-btn']}
                                            onClick={this.addFav}>
                                      <Image src={addIcon}
                                             className={styles['addFav-avatar']}
                                             mode='aspectFit'>
                                      </Image>
                                    </Button>
                                  </View>
                                </View>
                              ) : (
                                <View key={ci} style={{visibility: 'hidden'}}>
                                  <View className={styles['addFav-container']}></View>
                                </View>
                              )
                        )
                      }
                    )
                  }
                </View>
              )
            }
          )
        }
      </View>
    );
  }

  addFav = () => {
    console.log('add fav companies');
    wx.navigateTo({
      url: '../search-companies/index'
    })
  };

  getMyFavCompanies = () => {
    let me = this;
    wx.showLoading({title: '获取中...', showMask: true});

    //request for fav companies of the user
    wx.request({
      url: `${Requests.favoriteCompany}/userId/${this.userId}`,
      success: function (res) {
        if (res.statusCode >= 500){
          wx.navigateTo({url: `../error/index`})
        }else if (!responseOK(res)) {
          wxShowError(false);
        }
        else {
          data = res.data;

          //push a new node for the "add new" button
          data.push({
            id: 0,
            type: Keys.IconCreate,
            url: addIcon,
          });

          //push new node(s) to make n rows for place holder to display alignment
          let length = data.length;

          const rowSize = 3;
          if (length % 3 !== 0)
            for (let n = 0; n < (rowSize - (length % rowSize)); ++n) {
              data.push({
                type: Keys.IconPlaceHolder
              });
            }

          //slice to different rows
          companies = arrayToRows(data, 3);

          me.setState({loading: false});
          wx.hideLoading();
        }
      },
      fail: networkError
    });
  };
}

export default FavCompany;
