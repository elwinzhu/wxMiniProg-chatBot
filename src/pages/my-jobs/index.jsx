import Taro, {Component} from '@tarojs/taro'
import {View, Button, Text, Image} from '@tarojs/components';

import styles from './index.module.scss';
import JobCard from '../../components/JobCard';
import {wxShowError, Requests, responseOK, networkError} from "../../assets/constants";
import TopTabs from "../../components/TopTabs";
import logo from '../../assets/images/robot-full.png';


let jobs = [];

let msg = [
  '没有收藏，快去找喜欢的职位吧',
  '没有投递，快去申请职位吧'
];
const jobTypes = ['favorite', 'applied'];

class ResumeRecord extends Component {
  state = {
    displayJobType: jobTypes[0],
    loaded: false
  };
  
  onSelect = (selected) => {
    if (selected === "收藏") {
      this.setState({displayJobType: jobTypes[0]})
    } else {
      this.setState({displayJobType: jobTypes[1]})
    }
  };
  
  componentWillMount() {
    wx.setNavigationBarTitle({title: '我的工作'});
    this.userId = this.$router.params.userId;
  };
  
  componentDidShow() {
    // let curJobs = jobs && jobs.filter(x => x.type === this.state.displayJobType);
    // if (curJobs.length === 0)
    this.getMyJobs();
  }
  
  render() {
    let curJobs = jobs && jobs.filter(x => x[this.state.displayJobType]);
    
    return (
      <View className={styles['root-container']}>
        <TopTabs options={["收藏", "已投递"]}
                 onSelect={this.onSelect}
                 selected={this.state.displayJobType === "favorite" ? "收藏" : "已投递"}
        >
        </TopTabs>
        
        {/*<ScrollView className={styles['jobs-container']} scrollY={true}*/}
        {/*onScrollToUpper={this.scrollU}*/}
        {/*onScrollToLower={this.scrollL}*/}
        {/*onScroll={this.scroll}>*/}
        
        <ScrollView className={styles['jobs-container']} scrollY={true}>
          {
            (curJobs && curJobs.length > 0) ?
              (
                curJobs.map((j, i) => {
                  return (
                    <View style={{paddingBottom: '8rpx'}} key={i}>
                      <View className={styles['card-container']}>
                        <JobCard title={j.title}
                                 city={j.city}
                                 company={j.company}
                                 tags={j.tags}
                                 score={j.score}
                                 logoUrl={j.logo}
                                 liked={j.favorite}
                                 progress={this.state.displayJobType === "favorite" ? undefined : 0}
                                 onClick={() => {
                                   this.jobClick(j.id)
                                 }}
                                 size={90}
                                 jobId={j.id}
                                 userId={this.userId}
                                 rightItems={
                                   this.state.displayJobType === "favorite" ? 3 : undefined
                                 }
                        />
                      </View>
                    </View>
                  )
                })
              ) : this.state.loaded ? (
                <View className={styles['nodata-container']}>
                  <Image className={styles.robot} src={logo}></Image>
                  <View
                    className={styles['nodata-msg']}>{this.state.displayJobType === "favorite" ? msg[0] : msg[1]}</View>
                </View>
              ) : ""
          }
        </ScrollView>
      
      </View>
    );
  };
  
  getMyJobs = () => {
    let me = this;
    wx.showLoading({mask: true, title: '加载中...'});
    
    wx.request({
      url: `${Requests.myJobs}/userId/${this.userId}`,
      success: function (res) {
        if (res.statusCode >= 500) {
          wx.navigateTo({url: `../error/index`})
        } else if (responseOK(res)) {
          //got my jobs
          
          jobs = res.data;
          me.setState({loaded: true});
          wx.hideLoading();
        }
        else {
          wxShowError(false);
        }
      },
      fail: networkError
    });
  };
  
  // scrollU = () => {
  // };
  // scrollL = () => {
  // };
  // scroll = () => {
  // };
  
  jobClick = (jobId) => {
    console.log('resume record click');
    wx.navigateTo({
      url: `../send-resume/index?jobId=${jobId}&userId=${this.userId}`
    })
  }
}

export default ResumeRecord;
