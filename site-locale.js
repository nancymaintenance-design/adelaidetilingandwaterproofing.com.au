(function(root) {
  const messages={
    'en-AU':{
      sending:'Sending your enquiry…',sendingButton:'SENDING ENQUIRY…',sent:'Thank you — your enquiry has been sent.',failed:'Unable to send the enquiry. Please call or email Ellis directly.',
      invalidEmail:'Enter a valid email address, such as name@example.com.',contactRequired:'Enter an email address or phone number so we can contact you.',invalidPhone:'Enter a phone number with 7–15 digits. Spaces, brackets, dots, hyphens and a leading + are accepted.',required:'Please complete every required field.',
      area:'Selected area: {area} · {suburb}',areaOnly:'Selected area: {area}. Add your suburb or postcode below.',pause:'Pause slideshow',start:'Start slideshow',
      METHOD_NOT_ALLOWED:'Method not allowed.',PAYLOAD_TOO_LARGE:'Enquiry is too large.',REQUIRED_FIELDS:'Please complete every required field.',CONTACT_REQUIRED:'Enter an email address or phone number so we can contact you.',INVALID_EMAIL:'Enter a valid email address.',INVALID_PHONE:'Enter a phone number with 7–15 digits; spaces, brackets, dots, hyphens and a leading + are accepted.',SERVICE_UNAVAILABLE:'The enquiry service is not configured yet. Please call 0425 170 688.',SEND_FAILED:'Unable to send your enquiry. Please call 0425 170 688.',LOCAL_PREVIEW_ONLY:'Local preview only: enquiries are not sent. Call 0425 170 688 for enquiries.'
    },
    'zh-Hans':{
      sending:'正在发送您的咨询…',sendingButton:'正在发送…',sent:'谢谢，您的咨询已发送。',failed:'暂时无法发送，请直接致电或发邮件联系 Ellis。',
      invalidEmail:'请输入有效的邮箱地址，例如 name@example.com。',contactRequired:'请填写邮箱或电话号码，方便我们与您联系。',invalidPhone:'请输入 7–15 位电话号码，可使用空格、括号、点、连字符及开头的 + 号。',required:'请填写所有必填项目。',
      area:'已选择服务地区：{area} · {suburb}',areaOnly:'已选择服务地区：{area}。请在下方填写郊区或邮编。',pause:'暂停轮播',start:'开始轮播',
      METHOD_NOT_ALLOWED:'不支持此请求方式。',PAYLOAD_TOO_LARGE:'咨询内容过长，请缩短后重试。',REQUIRED_FIELDS:'请填写所有必填项目。',CONTACT_REQUIRED:'请填写邮箱或电话号码，方便我们与您联系。',INVALID_EMAIL:'请输入有效的邮箱地址。',INVALID_PHONE:'请输入 7–15 位电话号码，可使用空格、括号、点、连字符及开头的 + 号。',SERVICE_UNAVAILABLE:'咨询发送服务暂不可用，请致电 0425 170 688。',SEND_FAILED:'暂时无法发送您的咨询，请致电 0425 170 688。',LOCAL_PREVIEW_ONLY:'当前为本地预览，表单不会发送。正式咨询请致电 0425 170 688。'
    }
  };
  const locale=()=>root.document?.documentElement?.lang?.startsWith('zh')?'zh-Hans':'en-AU';
  function message(language,key,values={}) {
    const copy=messages[language]?.[key];if(copy===undefined)throw new Error('Unknown localization key: '+key);
    return copy.replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));
  }
  function errorMessage(language,result={}) {
    if(Object.hasOwn(messages[language],result.code||''))return message(language,result.code);
    // Compatible with the prior API during GitHub → Vercel rollout.
    const legacy=Object.entries(messages['en-AU']).find(([key,value])=>key===key.toUpperCase()&&value===result.error);
    return message(language,legacy?legacy[0]:'failed');
  }
  function languageSwitchUrl(currentHref,counterpartHref) {
    const current=new URL(currentHref),target=new URL(counterpartHref,current);
    if(current.origin!==target.origin)throw new Error('Language link origin mismatch');
    return target.pathname+current.search+current.hash;
  }
  function areaLabel(language,value) {
    const labels={'Adelaide CBD & North Adelaide':'市中心与 North Adelaide','Inner East':'内东区','Inner South':'内南区','Western & Coastal Suburbs':'西区与沿海地区','Northern Suburbs':'北部郊区','North-Eastern Suburbs':'东北部郊区','Southern Suburbs':'南部郊区','Adelaide Hills & Foothills':'Adelaide Hills 与山麓地区'};
    return language==='zh-Hans'?(labels[value]||value):value;
  }
  const api={messages,message,errorMessage,languageSwitchUrl,areaLabel,locale};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.EllisI18n=api;
  if(root.document) {
    const refresh=()=>root.document.querySelectorAll('[data-language-switch]').forEach(link=>{
      if(!link.dataset.languagePath)link.dataset.languagePath=link.getAttribute('href');
      link.href=languageSwitchUrl(root.location.href,link.dataset.languagePath);
    });
    refresh();root.addEventListener('hashchange',refresh);
  }
})(typeof window!=='undefined'?window:globalThis);
