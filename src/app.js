import Taro, {Component} from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {
  
  config = {
    pages: [
      'pages/index/index',
      'pages/job-search/no-data',
      'pages/job-search/index',
      'pages/job-recommendation/no-data',
      'pages/job-recommendation/index',
      'pages/send-resume/index',
      'pages/welcome/index',
      'pages/test/index',
      'pages/skill-analysis/index',
      'pages/select-profile/index',
      'pages/general-info/index',
      'pages/comp-info/index',
      'pages/fav-companies/index',
      'pages/my-jobs/index',
      'pages/search-companies/index',
      'pages/chat/index',
      'pages/error/index'
    ],
    window: {
      //navigationStyle:'custom',
      navigationBarBackgroundColor: '#130f5f',
      navigationBarTitleText: 'Hi Talent',
      navigationBarTextStyle: "white",
      backgroundTextStyle: 'dark',
      
      enablePullDownRefresh: false,
      disableScroll: true
    }
  };
  
  componentDidMount() {
    Taro.getSystemInfo({
      success: res => {
        // let titleBarHeight = 0;
        // if(res.system.indexOf("Android") !== -1){
        //   titleBarHeight = 68;
        // }else{
        //   if(res.model.indexOf("iPhone X") !== -1){
        //     titleBarHeight = 88;
        //   }else{
        //     titleBarHeight = 64;
        //   }
        // }
        // global.barHeight = titleBarHeight;
        // global.barLineHeight = titleBarHeight + res.statusBarHeight;
        
        console.log('windowheight: ', res.windowHeight);
        console.log('screenheight: ', res.screenHeight);
        console.log('navbar height: ', res.screenHeight - res.windowHeight);
        console.log('status bar height: ', res.statusBarHeight);
        console.log('window width: ', res.windowWidth);
        
        global.pixelRatio = res.pixelRatio;
        global.winH = res.windowHeight;
        global.winW = res.windowWidth;
      }
    });
    
    console.log('# Version: 1.0.1');
    //console.log('# Description:');
  }
  
  componentDidShow() {
  }
  
  componentDidHide() {
  }
  
  componentDidCatchError() {
  }
  
  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Index/>
    )
  }
}

Taro.render(<App/>, document.getElementById('app'));
