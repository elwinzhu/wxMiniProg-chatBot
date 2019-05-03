import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components';

import styles from './no-data.module.scss';
import robot from '../../assets/images/robot-circle.png'


class JobSearch extends Component {
  
  componentWillMount() {
    this.searchValue = this.$router.params.value;
    this.userId = this.$router.params.userId;
  }
  
  componentDidMount() {
    wx.setNavigationBarTitle({title: '搜索结果'});
  }
  
  render() {
    let searchValue = decodeURIComponent(this.searchValue);
    //searchValue = "北京 工程师";
    
    return (
      <View className={styles.root}>
        <View className={styles['container']}>
          <View className={styles.box1}>
            <View className={styles.msg}>
              小T暂时无法找到“{searchValue}”的职位。建议你尝试更改职位名称或扩大搜索范围。
            </View>
          </View>
          <View className={styles.box2}>
            <Text>
              快捷搜索职位
            </Text>
            <View style={{display: 'flex', flexWrap: 'wrap'}}>
              <View className={styles.tag}>高级人工智能工程师</View>
              <View className={styles.tag}>汽车工程师</View>
              <View className={styles.tag}>人工智能工程师</View>
              <View className={styles.tag}>UI工程师</View>
              <View className={styles.tag}>高级工程师</View>
              <View className={styles.tag}>工程师</View>
            </View>
          </View>
          <View className={styles.box3}>
            <View className={styles.tag}>扩大搜索范围</View>
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
}

export default JobSearch;
