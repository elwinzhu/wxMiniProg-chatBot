import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components';

import styles from './no-data.module.scss';
import robot from '../../assets/images/robot-circle.png'
import Keys, {networkError, Requests, responseOK, wxShowError} from "../../assets/constants";

let tags = [];

class JobSearch extends Component {
  
  componentWillMount() {
    this.searchValue = this.$router.params.value;
    this.nodataTxt = this.$router.params.nodata;
    this.userId = this.$router.params.userId;
    this.expandedTimes = this.$router.params.et ? parseInt(this.$router.params.et) : 0;
    tags = wx.getStorageSync(Keys.HotTitles);
    
    this.area = this.$router.params.area;
    
    let searchLocations = "";
    let searchParams = wx.getStorageSync(Keys.SearchParams)[0];
    searchParams.locations.map(l => {
      searchLocations += ',' + l.city;
    });
    this.locations = `${searchLocations.substring(1).trim()}周边${this.area}`;
  }
  
  componentDidMount() {
    wx.setNavigationBarTitle({title: '搜索结果'});
  }
  
  render() {
    let searchValue = decodeURIComponent(this.searchValue);
    //searchValue = "北京 工程师";
    let nodataTxt = decodeURIComponent(this.nodataTxt);
    
    return (
      <View className={styles.root}>
        <View className={styles['container']}>
          <View className={styles.box1}>
            <View className={styles.msg}>
              小T暂时无法找到“{nodataTxt}”的职位。建议你尝试更改职位名称或扩大搜索范围。
            </View>
          </View>
          {
            tags && tags.length > 0 &&
            <View className={styles.box2}>
              <Text>
                快捷搜索职位 (“{this.locations}”)
              </Text>
              <View style={{display: 'flex', flexWrap: 'wrap'}}>
                {
                  tags.map((t, i) =>
                    <View key={i} className={styles.tag}
                          onClick={() => {
                            this.keywordsSearch(t);
                          }}>{t}</View>
                  )
                }
              </View>
            </View>
          }
          <View className={styles.box3}>
            <View className={styles.tag} onClick={this.expandArea}>扩大搜索范围</View>
          </View>
        </View>
        
        <View className={styles['voice-container']}>
          <Text className={styles.searchTxt}>
            {searchValue}
          </Text>
          <View className={styles['btn-container']}>
            <Image src={robot} className={styles.btn}
                   onClick={() => {
                     //wx.navigateBack();
                     wx.redirectTo({url: `../chat/index?userId=${this.userId}`});
                   }}/>
          </View>
        </View>
      </View>
    );
  };
  
  retryTimes = 0;
  searchJobs = (searchParams, keyword) => {
    let me = this;
  
    wx.showLoading({showMask: true});
    wx.request({
      url: `${Requests.searchJobs}/userId/${me.userId}`,
      method: 'POST',
      data: {
        search_restrictions: searchParams,
        default_geo_distance: me.area //100 * Math.pow(2, me.expandedTimes) + 'km'
      },
      success: function (res) {
        if (res.statusCode >= 500) {
          wx.navigateTo({url: `../error/index`})
        }
        else if (res.statusCode >= 400) {
          wx.showModal({
            title: '搜索失败',
            content: '抱歉我们未能找到相关职位, 重新输入搜索条件试试？',
            showCancel: false,
            success(r) {
              if (r.confirm) {
                wx.redirectTo(
                  {url: `../chat/index?userId=${me.$router.params.userId}&useVoice=${me.state.useVoice}`}
                );
              }
            }
          })
        }
        else if (!responseOK(res)) {
          wxShowError(false);
        }
        else {
          console.log('no data search');
          
          try {
            //got jobs
            //console.log(res.data);
            // let arr = res.data.slice(0, 6);
            // console.log(arr);
            //return;
            console.log(res);
  
            //check status
            if (res.data.status === "FINISHED"){
              //got data
              clearInterval(me.requestTimer);
              wx.setStorageSync(Keys.JobSearchResult, res.data.jobs);
              
              wx.hideLoading();
              wx.redirectTo({url: `../job-search/index?userId=${me.userId}&value=${encodeURIComponent(keyword)}`});
            }
            else {
              if (me.retryTimes < 5 && !me.requestTimer) {
                me.requestTimer = setInterval(() => {
                  me.retryTimes++;
                  me.searchJobs(searchParams, keyword);
                }, 1000);
              }
              else {
                if (me.retryTimes === 5) {
                  //at most 5 times
                  me.retryTimes = 0;
                  clearInterval(me.requestTimer);
        
                  wx.setStorageSync(Keys.JobSearchResult, res.data.jobs);
                  wx.setStorageSync(Keys.HotTitles, res.data.recommendedTitles);
                  wx.setStorageSync(Keys.SearchParams, searchParams);
  
                  wx.hideLoading();
                  wx.redirectTo({url: `../job-search/no-data?userId=${me.userId}&value=${encodeURIComponent(keyword)}&et=${me.expandedTimes}&area=${res.data.searchAreaSize}&nodata=${encodeURIComponent(me.locations + ' ' + keyword)}`});
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
  
  keywordsSearch(kw) {
    let searchParams = wx.getStorageSync(Keys.SearchParams)[0];
    searchParams.title = kw;
    searchParams.role = null;
    searchParams.field = null;
    
    // let nextSearchValue = "";
    // searchParams.locations.map(l => {
    //   nextSearchValue += ',' + l.city;
    // });
    //
    // nextSearchValue += ' ' + kw;
    
    this.searchJobs([searchParams], /*nextSearchValue.substring(1)*/ kw);
  };
  
  expandArea = () => {
    console.log('expand area');
    this.expandedTimes += 1;
    
    let searchParams = wx.getStorageSync(Keys.SearchParams);
    let nextSearchValue = "";
    searchParams.map(p => {
      nextSearchValue += "," + p.title;
    });
    
    this.searchJobs(searchParams, nextSearchValue.substring(1));
  }
}

export default JobSearch;
