import Taro, {Component} from '@tarojs/taro'
import {View, Text, ScrollView} from '@tarojs/components';
import JobCard from '../JobCard';
import {stripHtml} from "../../assets/constants";

import styles from './index.module.scss';


class InfoDetails extends Component {
  //displayJob true: job info, false: resume info
  state = {
    emailReq: false
  };
  
  componentWillReceiveProps(nextProps) {
    if (!nextProps.info || !nextProps.info.email) {
      this.props.contactRequired(true);
      this.setState({emailReq: true})
    }
  }
  
  render() {
    let {info, displayJob, contactRequired, inputContact, disableContactInput} = this.props;
    
    if (!info)
      return (<View></View>);
    
    return displayJob ?
      (
        <View className={styles['root']}>
          <JobCard title={info.title}
                   city={info.city}
                   company={info.company}
                   score={info.score}
                   rightItems={info.rightItems}
                   logoUrl={info.logoUrl}
                   liked={info.liked}
                   jobId={info.id}
                   userId={info.userId}
                   progress={info.applied ? 0 : undefined}
                   updateRecommendation
                   cardStyle={{
                     border: 'none', borderRadius: 0,
                     backgroundColor: "transparent",
                     borderBottom: '2rpx solid rgba(135, 135, 158, 0.48)'
                   }}>
          </JobCard>
          <View className={styles['details-container']}>
            <ScrollView className={styles.infoBox} scrollY>
              <View className={styles.scrollContent}>
                <View className={styles.title}>
                  <View>Job Title</View>
                  <Text className={styles['txt-details']}>{stripHtml(info.title)}</Text>
                </View>
                <View className={`${styles['job-desc']} ${styles['bottom-element']}`}>
                  <View>Job Description</View>
                  <Text className={styles['txt-details']}>{stripHtml(info.desc)}</Text>
                </View>
                
                {/*<View className={styles['job-desc']}>*/}
                {/*<View>Job Responsibilities</View>*/}
                {/*{*/}
                {/*info.duties.map((r, i) =>*/}
                {/*<View className={styles['txt-details']} key={i}>{r}</View>*/}
                {/*)*/}
                {/*}*/}
                {/*</View>*/}
                {/*<View className={`${styles['skills']} ${styles['bottom-element']}`}>*/}
                {/*<View>Required Skills</View>*/}
                {/*{*/}
                {/*info.skills.map((s, i) =>*/}
                {/*<View className={styles['txt-details']} key={i}>{s}</View>*/}
                {/*)*/}
                {/*}*/}
                {/*</View>*/}
              </View>
            </ScrollView>
          </View>
        </View>
      ) : (
        <View className={styles['root']}>
          <JobCard title={info.name}
                   city={info.title}
                   logoUrl={info.avatar}
                   cardStyle={{
                     border: 'none', borderRadius: 0,
                     backgroundColor: "transparent",
                     borderBottom: '1rpx solid rgba(135, 135, 158, 0.48)',
                   }}
          >
          </JobCard>
          <View className={styles['details-container']}>
            {
              disableContactInput ? (
                <View className={styles.contacts}>
                  <View className={styles['one-contact']}>
                    <Text style={{width: '110rpx'}}>邮箱</Text>
                    <Text className={styles['contact-value']}>{info.email}</Text>
                  </View>
                  <View className={styles['one-contact']}>
                    <Text style={{width: '110rpx'}}>电话</Text>
                    <Text className={styles['contact-value']}>{info.phone}</Text>
                  </View>
                </View>
              ) : (
                <View className={styles.contacts}>
                  <View className={`${styles['one-contact']} ${this.state.emailReq ? styles.emailReq : ""}`}>
                    <Text style={{width: '110rpx'}}>邮箱 *</Text>
                    <Input type='text' value={info.email}
                           className={styles.input}
                           onInput={this.inputEmail}
                           onBlur={this.validateEmail}
                    />
                  </View>
                  <View className={styles['one-contact']}>
                    <Text style={{width: '110rpx'}}>电话</Text>
                    <Input type='text' value={info.phone}
                           className={styles.input}
                           onInput={
                             (e) => {
                               this.props.inputContact(undefined, e.detail.value.trim());
                             }
                           }
                    />
                  </View>
                </View>
              )
            }
            
            <ScrollView className={styles.infoBox} scrollY>
              <View className={styles.scrollContent}>
                <View className={styles.title}>
                  <View>LinkedIn链接</View>
                  <View className={`${styles['txt-details']}} ${styles['txt-details-sm']}`}> {info.linkedInUrl}</View>
                </View>
                <View className={styles['job-desc']}>
                  <View>工作经验</View>
                  {
                    info.exp.map((e, i) =>
                      <View key={i}
                            style={{
                              marginBottom: '15rpx',
                              '&:last-child': {marginBottom: 0}
                            }}>
                        <View className={styles['txt-details']}>
                          {
                            (e.title && e.company) ? (`${e.title} at ${e.company}`) :
                              (e.title && !e.company) ? (e.title) :
                                (!e.title && e.company) ? (e.company) : ""
                          }
                        </View>
                        <View className={`${styles['txt-details']}} ${styles['txt-details-sm']}`}>
                          {
                            (e.startDate && e.endDate) ? (`${e.startDate} ~ ${e.endDate}`) :
                              (e.startDate && !e.endDate) ? (`${e.startDate} ~ Present`) :
                                (!e.startDate && e.endDate) ? (` ~ ${e.endDate}`) : ""
                          }
                        </View>
                      </View>
                    )
                  }
                </View>
                <View className={`${styles['skills']} ${styles['bottom-element']}`}>
                  <View>教育背景</View>
                  {
                    info.edu.map((e, i) =>
                      <View key={i}
                            style={{
                              marginBottom: '15rpx',
                              '&:last-child': {marginBottom: 0}
                            }}>
                        <View className={styles['txt-details']}>
                          {e.degreeName ? e.degreeName : ""}
                        </View>
                        <View className={`${styles['txt-details']}} ${styles['txt-details-sm']}`}>
                          {e.collegeName ? e.collegeName : ""}
                        </View>
                        <View className={`${styles['txt-details']}} ${styles['txt-details-sm']}`}>
                          {
                            (e.startDate && e.endDate) ? (`${e.startDate} ~ ${e.endDate}`) :
                              (e.startDate && !e.endDate) ? (`${e.startDate} ~ `) :
                                (!e.startDate && e.endDate) ? (` ~ ${e.endDate}`) : ""
                          }
                        </View>
                      </View>
                    )
                  }
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )
  }
  
  validateEmail = (e) => {
    let invalid = !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      e.detail.value.trim());
    
    this.props.contactRequired(invalid);
    
    this.setState({emailReq: invalid});
  };
  
  inputEmail = (e) => {
    if (e.detail.value.trim() === "")
      this.props.contactRequired(true);
    else
      this.props.contactRequired(false);
    
    this.props.inputContact(e.detail.value.trim());
    
    this.setState({
      emailReq: e.detail.value.trim() === ""
    });
  };
  
}

export default InfoDetails;
