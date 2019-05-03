import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components';
import styles from './index.module.scss';

import logo from '../../assets/images/logo.png';

class CompIntro extends Component {
  componentWillMount() {
    console.log(this.$router.params);
  }
  
  render() {
    return (
      <View className={styles['out-container']}>
        <View className={styles.up}>
          <Image className={styles.avatar} src={logo}></Image>
          <Text style={{color: 'white', fontSize: '34rpx', fontWeight: 'bold'}}>海搜科技</Text>
        </View>
        
        <View className={styles.down}>
          <Text>
            全球领先的人才服务平台
          </Text>
        </View>
      </View>
    );
  }
}

export default CompIntro;
