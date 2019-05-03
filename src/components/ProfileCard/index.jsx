import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components';

import Logo from '../Logo';
import styles from './index.module.scss';


class ProfileCard extends Component {
  render() {
    let {name, title, cardStyle, avatar, selected} = this.props;
    
    return (
      <View className={styles['card-container']}
            style={{
              ...cardStyle,
              backgroundColor: 'rgba(38, 198, 202, 0.3)'
            }}
            animation={this.props.animation}
      >
        <View className={styles['card-logo-container']}>
          {
            selected ? (
              <Logo imgUrl={avatar} checked size={102}></Logo>
            ) : (
              <Logo imgUrl={avatar} size={102}></Logo>
            )
          }
        </View>
        
        <View className={styles['card-content-container']}>
          <Text className={styles.name}>{name}</Text>
          <Text className={styles.title}>{title}</Text>
        </View>
        
        {
          selected &&
          <View className={styles['tick-container']}>
            <View className={styles.selectedTxt}>
              已选择
            </View>
          </View>
        }
        
        {/*{*/}
        {/*selected &&*/}
        {/*<View className={_className}>*/}
        {/*<View className={styles.tick}>*/}
        {/*<Image src={done_eee} style={{width: '60rpx', height: '60rpx'}}/>*/}
        {/*</View>*/}
        {/*</View>*/}
        {/*}*/}
      </View>
    );
  }
}

export default ProfileCard;
