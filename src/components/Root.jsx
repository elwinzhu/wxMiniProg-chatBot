import Taro, {Component} from '@tarojs/taro';
import {View, Button} from '@tarojs/components';

import StepperTester from './StepperTester';

import Logo from '../components/Logo';
import JobCard from '../components/JobCard';
import Keys from "../assets/constants";


let jobs = []
class Root extends Component {
  
  componentWillMount() {
    jobs = wx.getStorageSync(Keys.Recommendations);
  }
  
  componentDidMount() {
  
  }
  
  componentDidShow() {
  }
  
  componentDidHide() {
  }
  
  
  render() {
    return (
      <View className='root' style={{'height': '100vh'}}>
        <StepperTester/>
        <View style={{border: '1px solid red', display: 'flex'}}>
          <Logo imgUrl="https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=19041711"></Logo>
          <Logo checkable checked
                imgUrl="https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=19041711"></Logo>
        </View>
        
        {
          jobs.map((j, i) => {
            return (
              <JobCard title={j.title}
                       city={j.city}
                       company={j.company}
                       tags={j.tags}
                       score={j.score}
                       rightItems={3}
                       logoUrl={j.logoUrl}
                       liked={j.liked}
                       jobId={j.id}
                       userId={this.userId}
                       progress={0}
              />
            )
          })
        }
      </View>
    )
  }
}

export default Root
