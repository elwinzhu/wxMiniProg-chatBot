const Keys = {
  UserLinkedinProfile: 'userLinkedInProfile',
  PotentialProfiles: 'potentialProfiles',
  Recommendations: 'jobRecommendations',
  AppUserInfo: 'appUserInfo',
  
  IconCreate: 'IconCreate',
  IconPlaceHolder: 'IconPlaceHolder',
  JobSearchResult: 'jobSearchResult',
  
  HotTitles: 'hotTitles',
  SearchParams: 'searchParams'
};

export default Keys;

//------------------------------------------------------------------

let apiBaseUrl = 'http://api.hitalent.us:38081/apnpublic/api/v1';
apiBaseUrl = 'https://api.intelliprogroup.cn:8443/apnpublic/api/v1';
export const Requests = {
  getAppUser: `${apiBaseUrl}/wechat-users`,
  //getPotentialProfiles: `http://staging.api.hitalent.us:3010/api/search`,
  getPotentialProfiles: `https://api.intelliprogroup.cn:8443/api/search`,
  bindProfileToAppUser: `${apiBaseUrl}/wechat-users`,
  skillAnalysis: `${apiBaseUrl}/wechat-users`,
  favoriteCompany: `${apiBaseUrl}/user-favorite-companies`,
  searchCompany: `${apiBaseUrl}/companies`,
  recommendJobs: `${apiBaseUrl}/jobs`,
  myJobs: `${apiBaseUrl}/my-jobs`,
  favoriteJobs: `${apiBaseUrl}/user-favorite-jobs`,
  getJobDetail: `${apiBaseUrl}/jobs`,
  speechRecognition: `${apiBaseUrl}/speech-recognizers`,
  //speechNLP: `http://api.hitalent.us:8283/apnNLP/nlp/listen/session`,
  speechNLP: `https://api.intelliprogroup.cn:8443/apnNLP/nlp/listen/session`,
  searchJobs: `${apiBaseUrl}/jobs/search`,
  viewResume: `${apiBaseUrl}/talents`,
  sendResume: `${apiBaseUrl}/applications`,
  
  appUserLogOut: `${apiBaseUrl}/wechat-users`
};

//------------------------------------------------------------------

export const wxShowError = (wxError, msg = '数据错误。请退出重试！', complete) => {
  wx.hideLoading();
  wx.showModal({
    title: wxError === undefined ? "错误" : wxError ? '微信错误' : '请求错误',
    content: msg,
    showCancel: false,
    confirmText: '好',
    complete
  });
};

export const networkError = (complete) => {
  wxShowError(undefined, "网络错误，请退出重试！", complete);
};

export const responseOK = (response) => {
  return (response && (response.statusCode >= 200 && response.statusCode <= 206));
};

//------------------------------------------------------------------

export const arrayToRows = (array, rowSize) => {
  let row = [];
  let temp = [];
  if (array.length <= rowSize) {
    temp.push(array);
  }
  else {
    array.forEach((o, i) => {
      if (i % rowSize === 0) {
        if (row.length > 0)
          temp.push(row);
        row = [];
      }
      
      row.push(o);
    });
    
    //for last row
    if (row.length > 0)
      temp.push(row);
  }
  return temp;
};

export const stripHtml = (htmlText) => {
  let html = htmlText.replace(/(<br\s?\/>)/ig, '\n');
  
  let noHTML = /(<([^>]+)>)/ig;
  return html.replace(noHTML, '').replace(/(&nbsp;)/ig, ' ');
  
  //return html.replace(noHTML, '');
};

//------------------------------------------------------------------

export const pxBase = 603;


