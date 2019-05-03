import Taro, {Component} from '@tarojs/taro';
import {View, Text} from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';
import stylesWhite from './white.module.scss';

const labels = Object.freeze([
  '投递成功',
  '企业查询',
  '结果反馈'
]);


class Stepper extends Component {
  render() {
    let {activeStep, variant} = this.props;
    if (activeStep === null) activeStep = -1;
    
    let style = variant === 'white' ? stylesWhite : styles;
    
    return (
      <View className={style.root}>
        {labels.map((label, index) => {
          return (
            <View key={index} className={style.step}>
              <View className={style['step-progress']}>
                <View
                  className={
                    classNames(style['step-progress-line'], {[style['step-progress-line-active']]: index <= activeStep})
                  }
                />
                <View
                  className={
                    classNames(style['step-progress-dot'], {[style['step-progress-dot-active']]: index <= activeStep})
                  }
                />
                <View
                  className={
                    classNames(style['step-progress-line'], {[style['step-progress-line-active']]: index < activeStep})
                  }
                />
              </View>
              <View className={style['step-label']}>
                <Text
                  className={
                    classNames(style['step-label-text'], {[style['step-label-text-active']]: index <= activeStep})
                  }
                >
                  {label}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    );
  }
}

export default Stepper;
