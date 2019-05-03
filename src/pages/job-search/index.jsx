import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image, ScrollView} from '@tarojs/components';

import styles from './index.module.scss';
import JobCard from '../../components/JobCard';
import robot from '../../assets/images/robot-circle.png'
import Keys from "../../assets/constants";


let jobs = [];

class JobSearch extends Component {
  state = {
    refresh: 0
  };
  
  componentWillMount() {
    this.searchValue = this.$router.params.value;
    this.userId = this.$router.params.userId;
  }
  
  componentDidShow() {
    this.composeJobs();
    this.setState({refresh: this.state.refresh + 1});
  }
  
  componentDidMount() {
    wx.setNavigationBarTitle({title: '搜索结果'});
  }
  
  render() {
    let searchValue = decodeURIComponent(this.searchValue);
    
    return (
      <View className={styles.root}>
        <ScrollView className={styles['jobs-container']} scrollY={true}>
          {
            jobs.map((j, i) => {
              return (
                <View key={j.id} style={{paddingBottom: '8rpx'}}>
                  <View className={styles['card-container']}>
                    <JobCard title={j.title}
                             city={j.city}
                             company={j.company}
                             tags={j.tags}
                             score={j.score}
                             rightItems={3}
                             logoUrl={j.logoUrl}
                             liked={j.liked}
                             key={j.id}
                             jobId={j.id}
                             userId={this.userId}
                             onClick={() => {
                               this.jobClick(j.id)
                             }}
                    />
                  </View>
                </View>
              )
            })
          }
        </ScrollView>
        
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
  
  composeJobs = () => {
    let searchRes = wx.getStorageSync(Keys.JobSearchResult);
    jobs = searchRes.filter((r, i) => i <= 99).map((r, i) => {
      return {
        title: r.title,
        city: r.city,
        company: r.company,
        logoUrl: r.logo,
        liked: r.favorite,
        id: r.id
      }
    })
  };
  
  jobClick = (jobId) => {
    console.log('search result click');
    wx.navigateTo({
      url: `../send-resume/index?jobId=${jobId}&userId=${this.userId}`
    })
  };
}

export default JobSearch;
