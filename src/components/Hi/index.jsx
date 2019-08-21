import Taro, {Component} from '@tarojs/taro'
import {View, Text, Button} from '@tarojs/components';
import styles from './index.module.scss';

import InfoDetails from '../InfoDetails';
import Keys, {wxShowError, Requests, responseOK, networkError} from "../../assets/constants";


class Hi extends Component {
  //step 0: show job details
  //step 1: confirm resume
  //step 2: show resume sent info, no case
  
  state = {
    loading: true
  };
  
  jobDetail = null;
  resumeDetail = null;
  
  componentDidMount() {
    let {jobId, step, userId, resumeView} = this.props;
    this.userId = userId;
    
    if (resumeView) {
      wx.setNavigationBarTitle({title: '我的档案'});
      this.getResumeDetails(userId);
    }
    else {
      if (step === 0) {
        this.getJobDetails(jobId, userId);
      }
      else {
        this.getResumeDetails(userId);
      }
    }
  }
  
  //request to get the job details
  getJobDetails = (jobId, userId) => {
    if (jobId && jobId !== 0) {
      let me = this;
      
      wx.showLoading({showMask: true});
      wx.request({
        url: `${Requests.getJobDetail}/${jobId}/userId/${userId}`,
        success: function (res) {
          if (responseOK(res)) {
            me.composeJob(res.data);
            wx.hideLoading();
            me.setState({loading: false});
          }
          else {
            console.log(res.statusCode);
            console.log(`request url: ${Requests.getJobDetail}/${jobId}/userId/${userId}, get`);
            console.log(`error msg: ${res.data.title}`);
            
            wxShowError(false);
          }
        },
        fail: networkError
      });
    }
  };
  
  getResumeDetails = (userId) => {
    if (userId && userId !== 0) {
      let me = this;
      
      wx.showLoading({showMask: true});
      wx.request({
        url: `${Requests.viewResume}/userId/${userId}`,
        success: function (res) {
          if (responseOK(res)) {
            //got resume
            me.composeResume(res.data);
            
            wx.hideLoading();
            me.setState({loading: false});
          }
          else{
            console.log(res.statusCode);
            console.log(`request url: ${Requests.viewResume}/userId/${userId}, get`);
            console.log(`error msg: ${res.data.title}`);
            
            wxShowError(false);
          }
        },
        fail: networkError
      });
    }
  };
  
  composeResume = (resumeData) => {
    let profile = wx.getStorageSync(Keys.UserLinkedinProfile);
    
    this.resumeDetail = {
      id: resumeData.id,
      name: resumeData.fullName,
      linkedInUrl: profile ? profile.url : "",
      avatar: profile ? profile.imageUrl : "",
      exp: resumeData.experiences,
      edu: resumeData.educations,
      title: resumeData.title,
      email: resumeData.email ? resumeData.email : "",
      phone: resumeData.phone ? resumeData.phone : ""
    };
    
    console.log(this.resumeDetail);
  };
  
  composeJob = (jobData) => {
    this.jobDetail = {
      id: jobData.id,
      title: jobData.title,
      city: jobData.city,
      company: jobData.company,
      score: jobData.score ? parseInt((jobData.score) * 100) : 0,
      rightItems: this.props.jobCardItems,
      logoUrl: jobData.logo,
      liked: jobData.favorite,
      desc: jobData.jdText,
      userId: this.userId,
      applied: jobData.applied
    };
    
    console.log(jobData);
  };
  
  logOut = () => {
    let me = this;
    
    //request for data cleaning of this user in backend
    wx.request({
      url: `${Requests.appUserLogOut}/${me.userId}`,
      method: 'DELETE',
      success: function (res) {
        if (!responseOK(res)) {
          console.log(res.statusCode);
          console.log(`request url: ${Requests.appUserLogOut}/${me.userId}, delete`);
          console.log(`error msg: ${res.data.title}`);
          
          wxShowError(false);
        }
        else {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000,
            complete() {
              wx.clearStorageSync();
              setTimeout(() => {
                wx.reLaunch({
                  url: '../index/index'
                })
              }, 1500)
            }
          });
        }
      },
      fail: networkError
    });
  };
  
  cancel = () => {
    wx.navigateBack();
    //this.props.cancel();
  };
  
  inputContact = (e, ph) => {
    if (e && !ph)
      this.email = e;
    else if (!e && ph)
      this.phone = ph;
    else {
      this.email = e;
      this.phone = ph;
    }
  };
  
  handleHiClick = () => {
    if (this.props.step === 1 && this.contactReq) {
      wx.showModal({
        title: "提示",
        content: "请输入正确的邮件地址！",
        showCancel: false,
        confirmText: '好'
      });
      return;
    }
    
    if (this.props.sayHiClick)
      this.props.sayHiClick(this.email, this.phone);
    else
      console.log('not specified the handler');
  };
  
  
  render() {
    let {resumeView, step} = this.props;
    
    //check whether to show the action
    let withAction = true;
    if (resumeView) withAction = true;
    else {
      if (step === 0) {
        if (!this.jobDetail) withAction = false;
        else {
          if (this.jobDetail.applied) withAction = false;
          else withAction = true;
        }
      }
      else withAction = true;
    }
    
    return (
      <View className={styles['out-container']}>
        <View className={`${styles['info']} ${withAction ? "" : styles['without-action']}`}>
          <InfoDetails info={step === 0 ? this.jobDetail : this.resumeDetail}
                       displayJob={step === 0}
                       contactRequired={(v) => {
                         this.contactReq = v;
                       }}
                       disableContactInput={this.props.disableContactInput}
                       inputContact={
                         (e, ph) => {
                           this.inputContact(e, ph);
                         }
                       }
          />
        </View>
        
        {
          withAction &&
          <View className={styles.actionbox}>
            {
              resumeView ? (
                <Button className={`${styles.btn} ${styles.btnLogout}`}
                        onClick={this.logOut}>
                  注 销
                </Button>
              ) : (
                step === 0 ? (
                  <Button className={`${styles.btn} ${styles.btnToSend}`}
                          onClick={this.handleHiClick}>
                    发送简历
                  </Button>
                ) : (
                  step === 1 ? (
                    <View className={styles['two-buttons']}>
                      <View className={styles['btnCancel-container']}>
                        <Button className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={this.cancel}>取消</Button>
                      </View>
                      <View className={styles['btnOK-container']}>
                        <Button className={`${styles.btn} ${styles.btnConfirm}`}
                                onClick={this.handleHiClick}>{"确认发送"}</Button>
                      </View>
                    </View>
                  ) : (<View></View>)
                )
              )
            }
          </View>
        }
      </View>
    );
  }
}

export default Hi;
