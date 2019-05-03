import Taro, {Component} from '@tarojs/taro';
import {View} from '@tarojs/components';
import Stepper from './Stepper';

class StepperTester extends Component {
  render() {
    const activeStep = 0;
    const labels = Object.freeze([
      '投递成功',
      '企业查询',
      '结果反馈'
    ]);
    return (
      <View style={{margin: '20px'}}>
        <Stepper activeStep={activeStep} labels={labels} />
      </View>
    );
  }
}

export default StepperTester;
