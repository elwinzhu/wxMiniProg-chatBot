import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components';

import Logo from '../Logo';
import Score from '../Score';
import Like from '../Like';
import Stepper from '../Stepper';

import styles from './index.module.scss';
import classNames from "classnames";
import Keys, {networkError, Requests, responseOK, wxShowError} from "../../assets/constants";


class JobCard extends Component {
  state = {sliked: false};
  
  componentDidMount() {
    this.setState({sliked: this.props.liked});
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({sliked: nextProps.liked});
  }
  
  render() {
    let {
      title, city, company, tags, score, rightItems,
      progress, cardStyle, logoUrl, jobId, userId, liked
    } = this.props;
    let {sliked} = this.state;
    
    const _className = classNames(
      styles['right-info-container'],
      rightItems === 3 ? styles.center : ''
    );
    
    return (
      <View className={styles['card-container']} style={cardStyle} animation={this.props.animation}
            onClick={this.props.onClick}
      >
        
        <Logo imgUrl={logoUrl} companyId={!!company}></Logo>
        
        <View className={styles['card-content-container']}>
          <View className={styles['content-up']}>
            <View className={styles['content-details']}>
              <Text className={styles.title}>{title}</Text>
              <Text className={styles.location}>{company ? `${company}, ${city}` : city}</Text>
            </View>
            
            <View className={_className}>
              {
                rightItems == 1 ?
                  <View className={styles.score}>
                    <Score score={score}></Score>
                  </View>
                  :
                  rightItems == 2 ?
                    <View>
                      <View className={styles.score}>
                        <Score score={score}></Score>
                      </View>
                      <Like liked={sliked} onClick={() => {
                        this.toggleLike(jobId, sliked)
                      }}></Like>
                    </View>
                    :
                    rightItems === 3 ?
                      <Like liked={sliked} onClick={() => {
                        this.toggleLike(jobId, sliked)
                      }}></Like>
                      :
                      ""
              }
            </View>
          </View>
          
          {
            (progress !== null && progress !== undefined && progress >= 0) && (
              <View style={{marginTop: '34rpx'}}>
                <Stepper activeStep={progress}/>
                {/*<Text className={styles.tags}>{tags ? tags.join(' ') : ''}</Text>*/}
              </View>
            )
          }
        </View>
      
      
      </View>
    );
  }
  
  toggleLike = (jobId, curLike) => {
    let me = this;
    
    wx.request({
      url: Requests.favoriteJobs,
      method: curLike ? 'DELETE' : 'POST',
      data: {
        userId: me.props.userId,
        jobId
      },
      success: function (res) {
        if (responseOK(res)) {
          wx.showToast({
            title: curLike ? "已取消" : '标注成功',
            icon: 'success',
            duration: 800
          });
          me.setState({sliked: !curLike});
          
          //update the local storage
          me.updateFavInLocal(jobId, curLike);
        }
        else {
          console.log(res.statusCode);
          console.log(`request url: ${Requests.favoriteJobs}, ${curLike ? 'DELETE' : 'POST'}`);
          console.log(`error msg: ${res.data.title}`);
          
          wxShowError(undefined, "重复的操作!");
        }
      },
      fail: networkError
    });
  };
  
  updateFavInLocal = (jobId, curLike) => {
    //update the recommendation into local storage
    let recmd = wx.getStorageSync(Keys.Recommendations);
    let job = recmd.find(r => r.id === jobId);
    if (job) {
      job.liked = curLike ? false : true;
      wx.setStorageSync(Keys.Recommendations, recmd);
    }
    
    //update search result
    let searchRes = wx.getStorageSync(Keys.JobSearchResult);
    if (searchRes) {
      job = searchRes.find(r => r.id === jobId);
      if (job) {
        job.favorite = curLike ? false : true;
        wx.setStorageSync(Keys.JobSearchResult, searchRes);
      }
    }
  }
}

export default JobCard;
