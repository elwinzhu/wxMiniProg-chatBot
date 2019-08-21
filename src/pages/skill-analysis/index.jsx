import Taro, {Component} from '@tarojs/taro';
import {View, Text, Canvas, Button, Progress} from '@tarojs/components';

import styles from './index.module.scss';
import Logo from '../../components/Logo';
import Keys, {
  wxShowError, Requests,
  networkError, responseOK
} from "../../assets/constants";

import p1 from '../../assets/images/01.png';
import p3 from '../../assets/images/03.png';
import p4 from '../../assets/images/04.png';
import p5 from '../../assets/images/05.png';
import p6 from '../../assets/images/06.png';
import p8 from '../../assets/images/08.png';
import p9 from '../../assets/images/09.png';
import p10 from '../../assets/images/10.png';
import p11 from '../../assets/images/11.png';


let pngSeq = [p11, p3, p4, p5, p6, p8, p9, p10];
let pngSeq2 = [p11, p3, p4, p5, p6, p8, p9, p10, p11, p1];

let preferredComp = [];
let assessment = [];
let ctx, ctxVal;

class SkillAnalysis extends Component {
  state = {
    xPos: 0,
    analysing: true,
    seqIndex: 0
  };
  
  componentDidMount() {
    // setTimeout(() => {
    //   this.setState({analysing: false});
    // }, 2000);
    //
    
    //set a timer for the animation
    this.setRobotAnimation();
    
    this.userId = wx.getStorageSync(Keys.AppUserInfo).id;
    
    setTimeout(this.doAnalysis, 3000);
    //this.doAnalysis();
    this.reqDone = false;
  }
  
  setRobotAnimation = () => {
    this.timer = setInterval(() => {
      if (!this.reqDone)
        this.setState({seqIndex: (this.state.seqIndex + 1) % 8});
      else {
        if (this.state.seqIndex === 17) {
          clearInterval(this.timer);
          
          setTimeout(() => {
            this.setState({analysing: false});
            this.drawRadarAsync();
          }, 1200)
        }
        else
          this.setState({seqIndex: this.state.seqIndex + 1});
      }
    }, 150);
  };
  
  doAnalysis = () => {
    //assert that the app user has been created and saved into storage
    this.userId = wx.getStorageSync(Keys.AppUserInfo).id;
    let lp = wx.getStorageSync(Keys.UserLinkedinProfile),
      linkedInUrl = lp.url,
      photoUrl = lp.imageUrl;
    
    let me = this;
    
    //request to bind user profile to created app user
    wx.request({
      url: Requests.bindProfileToAppUser,
      method: 'PUT',
      data: {
        id: me.userId,
        linkedInUrl,
        photoUrl
      },
      success(res) {
        if (!responseOK(res)) {
          console.log(res.statusCode);
          console.log(`request url: ${Requests.bindProfileToAppUser}, put`);
          console.log(`error msg: ${res.data.title}`);
        }
        
        if (res.statusCode >= 500) {
          wx.navigateTo({url: '../error/index'})
        }
        else if (responseOK(res)) {
          //assert that the user linkedin profile has existed in local storage
          //update the app user info
          wx.setStorageSync(Keys.AppUserInfo, res.data);
          
          me.fiveDivisionAnalysis();
        }
        else {
          // me.reqDone = true;
          // pngSeq.push(...pngSeq2);
          wxShowError(false, '您的LinkedIn资料获取失败。请重试！', () => {
            wx.redirectTo({
              url: '../select-profile/index'
            })
          });
        }
      },
      fail: networkError
    });
  };
  
  fiveDivisionAnalysis = () => {
    let me = this;
    
    //request for user skills analysis
    wx.request({
      url: `${Requests.skillAnalysis}/${me.userId}/radars`,
      success: function (r) {
        if (!responseOK(r)) {
          console.log(r.statusCode);
          console.log(`request url: ${Requests.skillAnalysis}/${me.userId}/radar, get`);
          console.log(`error msg: ${r.data.title}`);
        }
        
        if (r.statusCode >= 500) {
          wx.navigateTo({url: '../error/index'})
        }
        else if (responseOK(r)) {
          //got assessment
          console.log(r.data);
          
          assessment = [];
          r.data.map((v, i) => {
            assessment.push({
              label: v.name,
              value: parseInt(v.score)
            })
          });
          
          me.guessPreferredCompanies();
        }
        else {
          wxShowError(false, "技能分析失败。为您自动跳转到首页！", () => {
            wx.redirectTo({url: '../index/index?reEnterName=y'});
          });
        }
      },
      fail: networkError
    })
  };
  
  lastreturned = false;
  guessPreferredCompanies = () => {
    let me = this;
    
    me.lastreturned = false;
    //request for user skills analysis
    wx.request({
      url: `${Requests.skillAnalysis}/${me.userId}/companies`,
      success: function (r) {
        me.lastreturned = true;
        
        if (!responseOK(r)) {
          console.log(r.statusCode);
          console.log(`request url: ${Requests.skillAnalysis}/${me.userId}, get`);
          console.log(`error msg: ${r.data.title}`);
          clearInterval(me.requestTimer);
        }
        
        if (r.statusCode >= 500) {
          clearInterval(me.requestTimer);
          wx.navigateTo({url: '../error/index'})
        }
        else if (responseOK(r)) {
          //check status
          if (r.data.status === "FINISHED") {
            clearInterval(me.requestTimer);
            
            //got assessment
            //got preferred companies
            preferredComp = [];
            r.data.companies.map((c, i) => {
              preferredComp.push({
                id: c.id,
                name: c.name,
                url: c.logo
              })
            });
            
            me.reqDone = true;
            pngSeq.push(...pngSeq2);
          }
          else {
            if (!me.requestTimer) {
              me.requestTimer = setInterval(() => {
                if (me.lastreturned)
                  me.guessPreferredCompanies();
              }, 800);
            }
          }
        }
        else {
          wxShowError(false, "技能分析失败。为您自动跳转到首页！", () => {
            wx.redirectTo({url: '../index/index?reEnterName=y'});
          });
        }
      },
      fail: networkError
    })
  };
  
  render() {
    let index = this.state.seqIndex;
    
    return (
      <View className={styles.root}>
        {
          this.state.analysing ? (
            <View>
              <View className={styles.up}>
                <Text>小T正在分析</Text>
                <Text>......</Text>
              </View>
              <View className={styles.down}>
                <Image src={pngSeq[index]}
                       style={{width: '384rpx', height: '365rpx'}}></Image>
              </View>
            </View>
          ) : (
            <View>
              <View className={styles['chart-container']}>
                <Canvas style='width: 600rpx; height: 600rpx;'
                        canvasId='radar'></Canvas>
                <Canvas style='width: 600rpx; height: 600rpx;margin-top:-600rpx;opacity: 0.8;'
                        canvasId='radarVal'></Canvas>
              </View>
              
              <View className={styles['guess-fav-container']}>
                <View style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{fontSize: '28rpx', fontFamily: 'PingFangSC'}}>与HiTalent合作的客户中，我猜你感兴趣这些公司</Text>
                  <View className={styles['logo-container']}>
                    {
                      preferredComp.map(c =>
                        <View style={{
                          width: '214rpx', display: 'flex', justifyContent: 'center'
                        }} key={c.id}>
                          <Logo name={c.name}
                                imgUrl={c.url} companyId={c.id} size={130}></Logo>
                        </View>
                      )
                    }
                  </View>
                </View>
                
                <Button className={styles.btnStart}
                        onClick={() => {
                          wx.redirectTo({url: `../welcome/index?userId=${this.userId}`})
                        }}>开 始</Button>
              </View>
            </View>
          )
        }
      </View>
    );
  }
  
  drawRadarAsync = () => {
    ctx = wx.createCanvasContext("radar");
    ctxVal = wx.createCanvasContext("radarVal");
    
    this.data = {
      index1: 0,
      index2: 0,
      index3: 0,
      index4: 0,
      index5: 0
    };
  
    this.drawNet();
    //must draw two times for the text to show
    //unknown reason
    this.drawNet();
    
    this.radarTimer = setInterval(() => {
      this.doing = false;

      if (this.data.index1 < assessment[0].value) {
        this.data.index1 += 1;
        this.doing = true;
      }
      if (this.data.index2 < assessment[1].value) {
        this.data.index2 += 1;
        this.doing = true;
      }
      if (this.data.index3 < assessment[2].value) {
        this.data.index3 += 1;
        this.doing = true;
      }
      if (this.data.index4 < assessment[3].value) {
        this.data.index4 += 1;
        this.doing = true;
      }
      if (this.data.index5 < assessment[4].value) {
        this.data.index5 += 1;
        this.doing = true;
      }
      this.drawValue();

      if (!this.doing) {
        clearInterval(this.radarTimer);
      }
    }, 10);
  };
  
  drawNet = () => {
    let R = 100;
    let center = 150;
    let cos = Math.cos;
    let sin = Math.sin;
    let pi = Math.PI;
    
    let points;
    ctx.setStrokeStyle("rgba(73, 231, 216, 0.41)");
    ctx.setLineWidth(1);
    for (let r = 20; r <= R; r += 20) {
      points = [
        {x: center + 0, y: center - r},
        {x: center + r * cos(pi / 10), y: center - r * sin(pi / 10)},
        {x: center + r * sin(pi / 5), y: center + r * cos(pi / 5)},
        {x: center - r * sin(pi / 5), y: center + r * cos(pi / 5)},
        {x: center - r * cos(pi / 10), y: center - r * sin(pi / 10)}
      ];
      
      if (r === R) {
        ctx.stroke();
        
        ctx.beginPath();
        ctx.setStrokeStyle("rgba(73, 231, 216, 0.6)");
        ctx.setLineWidth(2);
      }
      
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.lineTo(points[2].x, points[2].y);
      ctx.lineTo(points[3].x, points[3].y);
      ctx.lineTo(points[4].x, points[4].y);
      ctx.lineTo(points[0].x, points[0].y);
    }
    ctx.stroke();
    
    //-----------------------------------------------------------
    ctx.beginPath();
    ctx.setLineWidth(1.5);
    
    ctx.moveTo(center, center);
    ctx.lineTo(points[0].x, points[0].y);
    ctx.moveTo(center, center);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.moveTo(center, center);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.moveTo(center, center);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.moveTo(center, center);
    ctx.lineTo(points[4].x, points[4].y);
    ctx.stroke();
    
    //-----------------------------------------------------------
    ctx.beginPath();
    ctx.setFillStyle('rgba(73, 231, 216, 0.18)');
    
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.lineTo(points[4].x, points[4].y);
    
    ctx.closePath();
    ctx.fill();
    
    //-----------------------------------------------------------
    ctx.draw();
    
    //-----------------------------------------------------------
    //draw text
    ctx.setFillStyle("rgba(231, 245, 252, 0.8)");
    ctx.font = '500 14px PingFangSC';
    points.forEach((p, i) => {
      ctx.beginPath();
      let x, y;
      switch (i) {
        case 0:
          x = p.x - 22;
          y = p.y - 10;
          break;
        case 1:
          x = p.x + 10;
          y = p.y + 5;
          break;
        case 2:
          x = p.x - 14;
          y = p.y + 20;
          break;
        case 3:
          x = p.x - 30;
          y = p.y + 20;
          break;
        case 4:
          x = p.x - 52;
          y = p.y + 5;
          break;
      }
      ctx.fillText(assessment[i].label, x, y);
      //ctx.fillText("社交值", x, y);
    });
  };
  
  drawValue = () => {
    let R = 100;
    let center = 150;
    let cos = Math.cos;
    let sin = Math.sin;
    let pi = Math.PI;
    
    let points = [
      {x: center + 0, y: center - R * this.data.index1 / 100},
      {
        x: center + R * this.data.index2 / 100 * cos(pi / 10),
        y: center - R * this.data.index2 / 100 * sin(pi / 10)
      },
      {
        x: center + R * this.data.index3 / 100 * sin(pi / 5),
        y: center + R * this.data.index3 / 100 * cos(pi / 5)
      },
      {
        x: center - R * this.data.index4 / 100 * sin(pi / 5),
        y: center + R * this.data.index4 / 100 * cos(pi / 5)
      },
      {
        x: center - R * this.data.index5 / 100 * cos(pi / 10),
        y: center - R * this.data.index5 / 100 * sin(pi / 10)
      }
    ];
  
    ctxVal.beginPath();
    ctxVal.setStrokeStyle("#49e7d8");
    ctxVal.setLineWidth(1);
    
    ctxVal.moveTo(points[0].x, points[0].y);
    ctxVal.lineTo(points[1].x, points[1].y);
    ctxVal.lineTo(points[2].x, points[2].y);
    ctxVal.lineTo(points[3].x, points[3].y);
    ctxVal.lineTo(points[4].x, points[4].y);
    ctxVal.lineTo(points[0].x, points[0].y);
    ctxVal.stroke();
  
    ctxVal.beginPath();
    let grd = this.createGradientColor(points);
    ctxVal.setFillStyle(grd);
    ctxVal.moveTo(points[0].x, points[0].y);
    ctxVal.lineTo(points[1].x, points[1].y);
    ctxVal.lineTo(points[2].x, points[2].y);
    ctxVal.lineTo(points[3].x, points[3].y);
    ctxVal.lineTo(points[4].x, points[4].y);
    ctxVal.closePath();
    ctxVal.fill();
    ctxVal.draw();
    
    points.forEach((p) => {
      ctxVal.beginPath();
      ctxVal.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctxVal.setFillStyle('#49e7d8');
      ctxVal.fill();
    });
    ctxVal.draw(true);
  };
  
  createGradientColor = (points) => {
    let minY = Math.min(...points.map(p => p.y));
    let maxY = Math.max(...points.map(p => p.y));
    
    let grd = ctx.createLinearGradient(0, minY, 0, maxY);
    grd.addColorStop(0, 'rgba(57, 207, 219, 0.9)');
    grd.addColorStop(1, 'rgba(62, 82, 219, 0.9)');
    
    return grd;
  }
}

export default SkillAnalysis;
