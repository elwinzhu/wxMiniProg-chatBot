import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components';


import styles from './index.module.scss';


class TopTabs extends Component {
  render() {
    const {options, selected} = this.props;
    
    return (
      <View className={styles['outer-container']}>
        <View className={styles['inner-container']}>
          {
            options ? options.map((option, i) => {
              return (
                <View onClick={() => this.props.onSelect(option)} key={i}>
                  {
                    option === selected ?
                      <View className={styles['tabs-checked']}>
                        {option}<View className={styles['underline']}></View></View> :
                      <View className={styles['tabs']}>{option}</View>
                  }
                </View>
              )
            }) : ""
          }
        </View>
      </View>
    );
  }
}

export default TopTabs;
