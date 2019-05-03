import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

class Score extends Component {
  render() {
    let {score = 0, fontSize} = this.props;
    
    if (!fontSize) fontSize = '70rpx';
    
    return (
      <View style={{color: '#e7f5fc'}}>
        <Text style={{fontSize, fontWeight: '500', fontFamily: 'Avenir'}}>{score}</Text>
        <Text style={{fontSize: '22rpx', fontFamily: 'PingFangSC'}}>分</Text>
      </View>
    );
  }
}

export default Score;
