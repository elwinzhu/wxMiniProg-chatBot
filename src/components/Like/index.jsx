import Taro, {Component} from '@tarojs/taro'
import {View, Image} from '@tarojs/components';
import {like, unlike} from '../../assets/constants/icons';

import styles from './index.module.scss';


class Like extends Component {
  render() {
    let {liked} = this.props;
    return (
      <View style={{
        width: '90rpx',
        height: '47rpx',
        borderRadius: '42.5rpx',
        border: 'solid 1px #49e7d8',
        backgroundColor: 'rgba(73, 231, 216, 0.2)',
        textAlign: 'center'
      }} onClick={(e) => {
        this.props.onClick();
        e.stopPropagation();
      }}>
        <Image src={liked ? like : unlike}
               className={styles.img}
        />
      </View>
    );
  }
}

export default Like;
