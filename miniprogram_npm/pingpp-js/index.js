module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1606699494728, function(require, module, exports) {
var version = require('./version').v;
var hasOwn = {}.hasOwnProperty;

var PingppSDK = function () {
  require('./init').init();
};

PingppSDK.prototype.version = version;

module.exports = new PingppSDK();

var testmode = require('./testmode');
var callbacks = require('./callbacks');
var PingppError = require('./errors').Error;
var mods = require('./mods');
var stash = require('./stash');
var dc = require('./collection');
var payment_elements = require('./payment_elements');

PingppSDK.prototype.createPayment = function (
  chargeJSON, callback, signature, debug
) {
  if (typeof callback === 'function') {
    callbacks.userCallback = callback;
  }

  try {
    payment_elements.init(chargeJSON);
  } catch (e) {
    if (e instanceof PingppError) {
      callbacks.innerCallback('fail',
        callbacks.error(e.message, e.extra));
      return;
    } else {
      throw e;
    }
  }

  if (!hasOwn.call(payment_elements, 'id')) {
    callbacks.innerCallback('fail',
      callbacks.error('invalid_charge', 'no_charge_id'));
    return;
  }
  if (!hasOwn.call(payment_elements, 'channel')) {
    callbacks.innerCallback('fail',
      callbacks.error('invalid_charge', 'no_channel'));
    return;
  }

  if (hasOwn.call(payment_elements, 'app')) {
    if (typeof payment_elements.app === 'string') {
      stash.app_id = payment_elements.app;
    } else if (typeof payment_elements.app === 'object' &&
      typeof payment_elements.app.id === 'string') {
      stash.app_id = payment_elements.app.id;
    }
  }
  dc.report({
    type: stash.type || 'pure_sdk_click',
    channel: payment_elements.channel,
    ch_id: payment_elements.id
  });
  var channel = payment_elements.channel;
  if (!hasOwn.call(payment_elements, 'credential')) {
    callbacks.innerCallback('fail',
      callbacks.error('invalid_charge', 'no_credential'));
    return;
  }
  if (payment_elements.paid && payment_elements.actual_amount === 0) {
    callbacks.innerCallback('success');
    return;
  }

  if (!payment_elements.credential) {
    callbacks.innerCallback('fail',
      callbacks.error('invalid_credential', 'credential_is_undefined'));
    return;
  }
  if (!hasOwn.call(payment_elements.credential, channel)) {
    callbacks.innerCallback('fail',
      callbacks.error('invalid_credential', 'credential_is_incorrect'));
    return;
  }
  if (!hasOwn.call(payment_elements, 'livemode')) {
    callbacks.innerCallback('fail',
      callbacks.error('invalid_charge', 'no_livemode_field'));
    return;
  }
  var channelModule = mods.getChannelModule(channel);
  if (typeof channelModule === 'undefined') {
    console.error('channel module "' + channel + '" is undefined');
    callbacks.innerCallback('fail',
      callbacks.error('invalid_channel',
        'channel module "' + channel + '" is undefined')
    );
    return;
  }
  if (payment_elements.livemode === false) {
    if (hasOwn.call(channelModule, 'runTestMode')) {
      channelModule.runTestMode(payment_elements);
    } else {
      testmode.runTestMode(payment_elements);
    }
    return;
  }

  if (typeof signature != 'undefined') {
    stash.signature = signature;
  }
  if (typeof debug == 'boolean') {
    stash.debug = debug;
  }
  channelModule.handleCharge(payment_elements);
};

PingppSDK.prototype.setAPURL = function (url) {
  stash.APURL = url;
};

PingppSDK.prototype.setUrlReturnCallback = function (callback, channels) {
  if (typeof callback === 'function') {
    callbacks.urlReturnCallback = callback;
  } else {
    throw 'callback need to be a function';
  }

  if (typeof channels !== 'undefined') {
    if (Array.isArray(channels)) {
      callbacks.urlReturnChannels = channels;
    } else {
      throw 'channels need to be an array';
    }
  }
};

PingppSDK.prototype.signAgreement = function (agreement, callback) {
  if (typeof callback === 'function') {
    callbacks.userAgreementCallback = callback;
  }

  var module = mods.getExtraModule('agreement');
  if (typeof module === 'undefined') {
    console.error('module "agreement" is undefined');
    callbacks.innerCallback('fail',
      callbacks.error('invalid_module',
        'module "agreement" is undefined')
    );
    return false;
  }

  return module.signAgreement(agreement);
};

}, function(modId) {var map = {"./version":1606699494729,"./init":1606699494730,"./testmode":1606699494738,"./callbacks":1606699494733,"./errors":1606699494735,"./mods":1606699494739,"./stash":1606699494731,"./collection":1606699494736,"./payment_elements":1606699494734}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494729, function(require, module, exports) {
module.exports = {
  v: '2.2.21'
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494730, function(require, module, exports) {
var stash = require('./stash');
var utils = require('./utils');
var dc = require('./collection');

module.exports = {
  SRC_URL: 'https://cookie.pingxx.com',

  init: function() {
    var self = this;
    utils.documentReady(function(){
      try {
        (!(utils.inWxLite() || utils.inAlipayLite())) && self.initPuid();
      } catch (e){/* empty */}
    });
  },

  initPuid: function() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined'
        || localStorage === null) {
      return;
    }
    var puid = localStorage.getItem('pingpp_uid');
    if (puid === null) {
      puid = utils.randomString();
      try {
        localStorage.setItem('pingpp_uid', puid);
      } catch (e) {
        /* empty */
      }
    }
    stash.puid = puid;
    if (!document.getElementById('p_analyse_iframe')) {
      var iframe;
      try {
        iframe = document.createElement('iframe');
      }catch(e){
        iframe = document.createElement('<iframe name="ifr"></iframe>');
      }
      iframe.id = 'p_analyse_iframe';
      iframe.src = this.SRC_URL + '/?puid=' + puid;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    setTimeout(function() {
      dc.send();
    }, 0);
  }
};

}, function(modId) { var map = {"./stash":1606699494731,"./utils":1606699494732,"./collection":1606699494736}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494731, function(require, module, exports) {
module.exports = {
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494732, function(require, module, exports) {
var callbacks = require('./callbacks');
var hasOwn = {}.hasOwnProperty;

var utils = module.exports = {

  /**
   * 对象转换成 query string
   * @param object data  待转对象
   * @param string channel  渠道
   * @param boolean urlencode  是否需要 urlencode
   *
   * @return string query string
   */
  stringifyData: function (data, channel, urlencode) {
    if (typeof urlencode == 'undefined') {
      urlencode = false;
    }
    var output = [];
    for (var i in data) {
      if (!hasOwn.call(data, i) || typeof data[i] === 'function') {
        continue;
      }
      if (channel == 'bfb_wap' && i == 'url') {
        continue;
      }
      if (channel == 'yeepay_wap' && i == 'mode') {
        continue;
      }
      if (i == 'channel_url') {
        continue;
      }
      output.push(i + '=' +
          (urlencode ? encodeURIComponent(data[i]) : data[i]));
    }
    return output.join('&');
  },

  /**
   * 网络请求
   * @param string url
   * @param string method  请求方式, POST, GET ...
   * @param object requestData  请求数据
   * @param function successCallback  成功回调 (data, statusCode, xhr)
   * @param function errorCallback  错误回调 (xhr, statusCode, error)
   */
  request: function (url, method, requestData,
    successCallback, errorCallback, headers) {
    if (typeof XMLHttpRequest === 'undefined') {
      console.log('Function XMLHttpRequest is undefined.');
      return;
    }
    var xhr = new XMLHttpRequest();
    if (typeof xhr.timeout !== 'undefined') {
      xhr.timeout = 6000;
    }
    method = method.toUpperCase();

    if (method === 'GET' && typeof requestData === 'object' && requestData) {
      url += '?' + utils.stringifyData(requestData, '', true);
    }
    xhr.open(method, url, true);
    if (typeof headers !== 'undefined') {
      for (var k in headers) {
        if (hasOwn.call(headers, k)) {
          xhr.setRequestHeader(k, headers[k]);
        }
      }
    }
    if (method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.send(JSON.stringify(requestData));
    } else {
      xhr.send();
    }
    if (typeof successCallback == 'undefined') {
      successCallback = function () {};
    }
    if (typeof errorCallback == 'undefined') {
      errorCallback = function () {};
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        successCallback(xhr.responseText, xhr.status, xhr);
      }
    };
    xhr.onerror = function (e) {
      errorCallback(xhr, 0, e);
    };
  },

  /**
   * 表单提交
   * @param string url
   * @param string method  请求方式, POST, GET ...
   * @param object params  请求数据
   */
  formSubmit: function (url, method, params) {
    if (typeof window === 'undefined') {
      console.log('Not a browser, form submit url: ' + url);
      return;
    }
    var form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', url);

    for (var key in params) {
      if (hasOwn.call(params, key)) {
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', params[key]);
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  },

  randomString: function (length) {
    if (typeof length == 'undefined') {
      length = 32;
    }
    var chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var str = '';
    for (var i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return str;
  },

  redirectTo: function (url, channel) {
    if (callbacks.shouldReturnUrlByCallback(channel)) {
      callbacks.triggerUrlReturnCallback(null, url);
      return;
    }
    if (typeof window === 'undefined') {
      console.log('Not a browser, redirect url: ' + url);
      return;
    }
    window.location.href = url;
  },

  inWeixin: function () {
    if (typeof navigator === 'undefined') {
      return false;
    }
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1;
  },

  inAlipay: function () {
    if (typeof navigator === 'undefined') {
      return false;
    }
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('alipayclient') !== -1;
  },

  /*global wx*/
  inWxLite: function() {
    if(typeof wx === 'undefined') {
      return false;
    }
    
    return wx.miniProgram || wx.requestPayment;
  },

  /*global my*/
  inAlipayLite: function() {
    if(typeof my === 'undefined') {
      return false;
    }

    return my.tradePay;
  },

  documentReady: function (fn) {
    if (typeof document === 'undefined') {
      fn();
      return;
    }
    if (document.readyState != 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  },

  loadUrlJs: function (sid, jsurl, callback) {
    var nodeHead = document.getElementsByTagName('head')[0];
    var nodeScript = null;
    if (document.getElementById(sid) == null) {
      nodeScript = document.createElement('script');
      nodeScript.setAttribute('type', 'text/javascript');
      nodeScript.setAttribute('src', jsurl);
      nodeScript.setAttribute('id', sid);
      nodeScript.async = true;
      if (callback != null) {
        nodeScript.onload = nodeScript.onreadystatechange = function () {
          if (nodeScript.ready) {
            return false;
          }

          if (!nodeScript.readyState || nodeScript.readyState == 'loaded'
              || nodeScript.readyState == 'complete') {
            nodeScript.ready = true;
            callback();
          }
        };
      }
      nodeHead.appendChild(nodeScript);
    } else {
      if (callback != null) {
        callback();
      }
    }
  }
};

}, function(modId) { var map = {"./callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494733, function(require, module, exports) {
module.exports = {

  userCallback: undefined,

  urlReturnCallback: undefined,

  urlReturnChannels: [
    'alipay_pc_direct', // 默认只开启 alipay_pc_direct 使用 callback 返回 URL
  ],

  userAgreementCallback: undefined,

  innerCallback: function(result, err) {
    if (typeof this.userCallback === 'function') {
      if (typeof err === 'undefined') {
        err = this.error();
      }
      this.userCallback(result, err);
      this.userCallback = undefined;
      var payment_elements = require('./payment_elements');
      payment_elements.clear();
    }
  },

  error: function(msg, extra) {
    msg = (typeof msg === 'undefined') ? '' : msg;
    extra = (typeof extra === 'undefined') ? '' : extra;
    return {
      msg: msg,
      extra: extra
    };
  },

  triggerUrlReturnCallback: function (err, url) {
    if (typeof this.urlReturnCallback === 'function') {
      this.urlReturnCallback(err, url);
    }
  },

  shouldReturnUrlByCallback: function (channel) {
    if (typeof this.urlReturnCallback !== 'function') {
      return false;
    }
    return this.urlReturnChannels.indexOf(channel) !== -1;
  },

  innerAgreementCallback: function(result, err) {
    if (typeof this.userAgreementCallback === 'function') {
      if (typeof err === 'undefined') {
        err = this.error();
      }
      this.userAgreementCallback(result, err);
      this.userAgreementCallback = undefined;
    }
  }
};

}, function(modId) { var map = {"./payment_elements":1606699494734}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494734, function(require, module, exports) {
/**
 * Created by dong on 2016/12/30.
 */

var PingppError = require('./errors').Error;
var hasOwn = {}.hasOwnProperty;

module.exports = {
  id: null,
  or_id: null,
  channel: null,
  app: null,
  credential: {},
  extra: null,
  livemode: null,
  order_no: null,
  time_expire: null,
  paid: false,
  status: null,
  actual_amount: null,

  init: function (charge_or_order) {
    var charge;
    if (typeof charge_or_order === 'string') {
      try {
        charge = JSON.parse(charge_or_order);
      } catch (err) {
        throw new PingppError('json_decode_fail', err);
      }
    } else {
      charge = charge_or_order;
    }

    if (typeof charge === 'undefined') {
      throw new PingppError('json_decode_fail');
    }

    if (hasOwn.call(charge, 'object') && charge.object == 'order') {
      charge.or_id = charge.id;
      charge.order_no = charge.merchant_order_no;
      var charge_essentials = charge.charge_essentials;
      charge.channel = charge_essentials.channel;
      charge.credential = charge_essentials.credential;
      charge.extra = charge_essentials.extra;
      if(hasOwn.call(charge, 'charge') && charge.charge != null) {
        charge.id = charge.charge;
      } else if(hasOwn.call(charge_essentials, 'id')
        && charge_essentials.id != null) {
        charge.id = charge_essentials.id;
      } else if(hasOwn.call(charge, 'charges')) {
        for(var i = 0; i < charge.charges.data.length; i++){
          if(charge.charges.data[i].channel === charge_essentials.channel) {
            charge.id = charge.charges.data[i].id;
            break;
          }
        }
      }
    } else if(hasOwn.call(charge, 'object') && charge.object == 'recharge') {
      charge = charge.charge;
    }

    for (var key in this) {
      if (hasOwn.call(charge, key)) {
        this[key] = charge[key];
      }
    }
    return this;
  },

  clear: function () {
    for (var key in this) {
      if (typeof this[key] !== 'function') {
        this[key] = null;
      }
    }
  }
};
}, function(modId) { var map = {"./errors":1606699494735}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494735, function(require, module, exports) {
var error = function PingppError(message, extra) {
  this.message = message;
  this.extra = extra;
};

module.exports = {
  Error: error,
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494736, function(require, module, exports) {
var utils = require('./utils');
var stash = require('./stash');
var md5 = require('./libs/md5');

var collection = {
  seperator: '###',
  limit: 1,
  report_url: 'https://statistics.pingxx.com/one_stats',
  timeout: 100
};
var getParam = function(str, param) {
  var reg = new RegExp('(^|&)' + param + '=([^&]*)(&|$)', 'i');
  var r = str.substring(0).match(reg);
  if (r !== null) return unescape(r[2]);
  return null;
};
var getUserAgent = function() {
  if (typeof navigator === 'undefined') {
    return '';
  }
  return navigator.userAgent;
};
var getHost = function() {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.host;
};

collection.store = function(obj) {
  if (utils.inWxLite() || utils.inAlipayLite()) {
    return;
  }
  if (typeof localStorage === 'undefined' || localStorage === null) return;
  var _this = this;
  var reportData = {};
  reportData.app_id = obj.app_id || stash.app_id || 'app_not_defined';
  reportData.ch_id = obj.ch_id || '';
  reportData.channel = obj.channel || '';
  reportData.type = obj.type || '';
  reportData.user_agent = getUserAgent();
  reportData.host = getHost();
  reportData.time = new Date().getTime();
  reportData.puid = stash.puid;

  var reportStr = 'app_id=' + reportData.app_id +
    '&channel=' + reportData.channel + '&ch_id=' + reportData.ch_id +
    '&host=' + reportData.host + '&time=' + reportData.time +
    '&type=' + reportData.type + '&user_agent=' + reportData.user_agent +
    '&puid=' + reportData.puid;

  var statsToSave = reportStr;
  if (localStorage.getItem('PPP_ONE_STATS') !== null &&
    localStorage.getItem('PPP_ONE_STATS').length !== 0
  ) {
    statsToSave = localStorage.getItem('PPP_ONE_STATS') +
      _this.seperator + reportStr;
  }
  try {
    localStorage.setItem('PPP_ONE_STATS', statsToSave);
  } catch (e) {
    /* empty */
  }
};

collection.send = function() {
  if (typeof localStorage === 'undefined' || localStorage === null) return;
  var _this = this;
  var pppOneStats = localStorage.getItem('PPP_ONE_STATS');
  if (pppOneStats === null ||
    pppOneStats.split(_this.seperator).length < _this.limit) {
    return;
  }
  try {
    var data = [];
    var origin = pppOneStats.split(_this.seperator);
    var token = md5(origin.join('&'));

    for (var i = 0; i < origin.length; i++) {
      data.push({
        app_id: getParam(origin[i], 'app_id'),
        channel: getParam(origin[i], 'channel'),
        ch_id: getParam(origin[i], 'ch_id'),
        host: getParam(origin[i], 'host'),
        time: getParam(origin[i], 'time'),
        type: getParam(origin[i], 'type'),
        user_agent: getParam(origin[i], 'user_agent'),
        puid: getParam(origin[i], 'puid')
      });
    }

    utils.request(_this.report_url, 'POST', data, function(data, status) {
      if (status == 200) {
        localStorage.removeItem('PPP_ONE_STATS');
      }
    }, undefined, {
      'X-Pingpp-Report-Token': token
    });
  } catch (e) {
    /* empty */
  }
};

collection.report = function(obj) {
  if (utils.inWxLite() || utils.inAlipayLite()) {
    return;
  }
  var _this = this;
  _this.store(obj);
  setTimeout(function(){
    _this.send();
  }, _this.timeout);
};

module.exports = collection;

}, function(modId) { var map = {"./utils":1606699494732,"./stash":1606699494731,"./libs/md5":1606699494737}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494737, function(require, module, exports) {
/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/* global unescape, module */

(function () {
  /*
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
  function safe_add (x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
  function bit_rol (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /*
  * These functions implement the four basic operations the algorithm uses.
  */
  function md5_cmn (q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
  }
  function md5_ff (a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function md5_gg (a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function md5_hh (a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5_ii (a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  /*
  * Calculate the MD5 of an array of little-endian words, and a bit length.
  */
  function binl_md5 (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << (len % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var i;
    var olda;
    var oldb;
    var oldc;
    var oldd;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;

    for (i = 0; i < x.length; i += 16) {
      olda = a;
      oldb = b;
      oldc = c;
      oldd = d;

      a = md5_ff(a, b, c, d, x[i], 7, -680876936);
      d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

      a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5_gg(b, c, d, a, x[i], 20, -373897302);
      a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

      a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5_hh(d, a, b, c, x[i], 11, -358537222);
      c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

      a = md5_ii(a, b, c, d, x[i], 6, -198630844);
      d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

      a = safe_add(a, olda);
      b = safe_add(b, oldb);
      c = safe_add(c, oldc);
      d = safe_add(d, oldd);
    }
    return [a, b, c, d];
  }

  /*
  * Convert an array of little-endian words to a string
  */
  function binl2rstr (input) {
    var i;
    var output = '';
    for (i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
    }
    return output;
  }

  /*
  * Convert a raw string to an array of little-endian words
  * Characters >255 have their high-byte silently ignored.
  */
  function rstr2binl (input) {
    var i;
    var output = [];
    output[(input.length >> 2) - 1] = undefined;
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return output;
  }

  /*
  * Calculate the MD5 of a raw string
  */
  function rstr_md5 (s) {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
  }

  /*
  * Calculate the HMAC-MD5, of a key and some data (raw strings)
  */
  function rstr_hmac_md5 (key, data) {
    var i;
    var bkey = rstr2binl(key);
    var ipad = [];
    var opad = [];
    var hash;
    ipad[15] = opad[15] = undefined;
    if (bkey.length > 16) {
      bkey = binl_md5(bkey, key.length * 8);
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }
    hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
  }

  /*
  * Convert a raw string to a hex string
  */
  function rstr2hex (input) {
    var hex_tab = '0123456789abcdef';
    var output = '';
    var x;
    var i;
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F) +
      hex_tab.charAt(x & 0x0F);
    }
    return output;
  }

  /*
  * Encode a string as utf-8
  */
  function str2rstr_utf8 (input) {
    return unescape(encodeURIComponent(input));
  }

  /*
  * Take string arguments and return either raw or hex encoded strings
  */
  function raw_md5 (s) {
    return rstr_md5(str2rstr_utf8(s));
  }
  function hex_md5 (s) {
    return rstr2hex(raw_md5(s));
  }
  function raw_hmac_md5 (k, d) {
    return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
  }
  function hex_hmac_md5 (k, d) {
    return rstr2hex(raw_hmac_md5(k, d));
  }

  function md5 (string, key, raw) {
    if (!key) {
      if (!raw) {
        return hex_md5(string);
      }
      return raw_md5(string);
    }
    if (!raw) {
      return hex_hmac_md5(key, string);
    }
    return raw_hmac_md5(key, string);
  }

  module.exports = md5;
}());

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494738, function(require, module, exports) {
var utils = require('./utils');
var hasOwn = {}.hasOwnProperty;
module.exports = {
  PINGPP_MOCK_URL: 'http://sissi.pingxx.com/mock.php',

  runTestMode: function (charge) {
    var params = {
      'ch_id': charge.id,
      'scheme': 'http',
      'channel': charge.channel
    };

    if (hasOwn.call(charge, 'order_no')) {
      params.order_no = charge.order_no;
    } else if (hasOwn.call(charge, 'orderNo')) {
      params.order_no = charge.orderNo;
    }
    if (hasOwn.call(charge, 'time_expire')) {
      params.time_expire = charge.time_expire;
    } else if (hasOwn.call(charge, 'timeExpire')) {
      params.time_expire = charge.timeExpire;
    }
    if (hasOwn.call(charge, 'extra')) {
      params.extra = encodeURIComponent(JSON.stringify(charge.extra));
    }
    utils.redirectTo(
      this.PINGPP_MOCK_URL + '?' + utils.stringifyData(params),
      charge.channel
    );
  }
};

}, function(modId) { var map = {"./utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494739, function(require, module, exports) {
var hasOwn = {}.hasOwnProperty;
var mods = {};
module.exports = mods;

mods.channels = {
  alipay: require('./channels/alipay'),
  alipay_lite: require('./channels/alipay_lite'),
  alipay_pc_direct: require('./channels/alipay_pc_direct'),
  alipay_qr: require('./channels/alipay_qr'),
  alipay_qr_lakala: require('./channels/alipay_qr_lakala'),
  alipay_wap: require('./channels/alipay_wap'),
  alipay_wap_lakala: require('./channels/alipay_wap_lakala'),
  bfb_wap: require('./channels/bfb_wap'),
  cb_alipay_pc_direct: require('./channels/cb_alipay_pc_direct'),
  cb_alipay_wap: require('./channels/cb_alipay_wap'),
  cb_wx_pub: require('./channels/cb_wx_pub'),
  ccb_qr: require('./channels/ccb_qr'),
  ccb_wap: require('./channels/ccb_wap'),
  cmb_pc_qr: require('./channels/cmb_pc_qr'),
  cmb_wallet: require('./channels/cmb_wallet'),
  coolcredit: require('./channels/coolcredit'),
  cp_b2b: require('./channels/cp_b2b'),
  isv_lite: require('./channels/isv_lite'),
  isv_wap: require('./channels/isv_wap'),
  jdpay_wap: require('./channels/jdpay_wap'),
  pab_pc: require('./channels/pab_pc'),
  paypal: require('./channels/paypal'),
  qpay_pub: require('./channels/qpay_pub'),
  upacp_b2b: require('./channels/upacp_b2b'),
  upacp_pc: require('./channels/upacp_pc'),
  upacp_wap: require('./channels/upacp_wap'),
  wx_lite: require('./channels/wx_lite'),
  wx_lite_pab: require('./channels/wx_lite_pab'),
  wx_pub: require('./channels/wx_pub'),
  wx_pub_hzbank: require('./channels/wx_pub_hzbank'),
  wx_pub_pab: require('./channels/wx_pub_pab'),
  wx_wap: require('./channels/wx_wap'),
  yeepay_wap: require('./channels/yeepay_wap')
};

mods.extras = {
  ap: require('./channels/extras/ap'),
  agreement: require('./agreement')
};

mods.getChannelModule = function(channel) {
  if (hasOwn.call(mods.channels, channel)) {
    return mods.channels[channel];
  }
  return undefined;
};

mods.getExtraModule = function(name) {
  if (hasOwn.call(mods.extras, name)) {
    return mods.extras[name];
  }
  return undefined;
};

}, function(modId) { var map = {"./channels/alipay":1606699494740,"./channels/alipay_lite":1606699494741,"./channels/alipay_pc_direct":1606699494742,"./channels/alipay_qr":1606699494743,"./channels/alipay_qr_lakala":1606699494744,"./channels/alipay_wap":1606699494746,"./channels/alipay_wap_lakala":1606699494747,"./channels/bfb_wap":1606699494748,"./channels/cb_alipay_pc_direct":1606699494749,"./channels/cb_alipay_wap":1606699494750,"./channels/cb_wx_pub":1606699494751,"./channels/ccb_qr":1606699494752,"./channels/ccb_wap":1606699494753,"./channels/cmb_pc_qr":1606699494754,"./channels/cmb_wallet":1606699494755,"./channels/coolcredit":1606699494756,"./channels/cp_b2b":1606699494757,"./channels/isv_lite":1606699494758,"./channels/isv_wap":1606699494760,"./channels/jdpay_wap":1606699494761,"./channels/pab_pc":1606699494762,"./channels/paypal":1606699494763,"./channels/qpay_pub":1606699494764,"./channels/upacp_b2b":1606699494765,"./channels/upacp_pc":1606699494766,"./channels/upacp_wap":1606699494767,"./channels/wx_lite":1606699494759,"./channels/wx_lite_pab":1606699494768,"./channels/wx_pub":1606699494769,"./channels/wx_pub_hzbank":1606699494770,"./channels/wx_pub_pab":1606699494771,"./channels/wx_wap":1606699494772,"./channels/yeepay_wap":1606699494773,"./channels/extras/ap":1606699494774,"./agreement":1606699494775}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494740, function(require, module, exports) {
var callbacks = require('../callbacks');
var hasOwn = {}.hasOwnProperty;

/*global my,AlipayJSBridge*/
module.exports = {

  PINGPP_NOTIFY_URL_BASE: 'https://notify.pingxx.com/notify',

  handleCharge: function (charge) {
    var credential = charge.credential[charge.channel];
    if (credential || hasOwn.call(credential, 'orderInfo')) {
      this.callpay(credential.orderInfo);
    } else {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'missing_alipay'));
    }
  },

  alipayLiteEnabled: function () {
    return typeof my !== 'undefined' && my.tradePay;
  },

  // 支付宝小程序支付
  callpay: function (orderStr) {
    var self = this;
    if (this.alipayLiteEnabled()) {
      return this.alipayLitePay(orderStr);
    }

    if (typeof navigator !== 'undefined'
      && /AlipayClient/.test(navigator.userAgent || navigator.swuserAgent)) {
      return this.waitAlipayJSBridgde(function () {
        self.alipayJsBridgePay(orderStr);
      });
    }

    var errmsg = '请在支付宝小程序或者支付宝应用内中打开';
    console.log(errmsg);
    callbacks.innerCallback('fail', callbacks.error(errmsg));
    return;
  },

  waitAlipayJSBridgde: function (callback) {
    if (window.AlipayJSBridge) {
      callback && callback();
    } else {
      document.addEventListener('AlipayJSBridgeReady', callback, false);
    }
  },

  alipayJsBridgePay: function (orderStr) {
    AlipayJSBridge.call('tradePay', {
      orderStr: orderStr
    }, this.alipayResultHandler);
  },

  alipayLitePay: function (orderStr) {
    var tradePayParams = {};
    tradePayParams.orderStr = orderStr;
    tradePayParams.complete = this.alipayResultHandler;
    my.tradePay(tradePayParams);
  },

  alipayResultHandler: function (res) {
    var extra = {
      resultCode: res.resultCode
    };
    if (hasOwn.call(res, 'memo')) {
      extra.memo = res.memo;
    }
    if (hasOwn.call(res, 'result')) {
      extra.result = res.result;
    }
    // 支付成功
    if (res.resultCode == '9000') {
      callbacks.innerCallback('success', callbacks.error('', extra));
    } else if (res.resultCode == '6001') { // 取消支付
      callbacks.innerCallback('cancel', callbacks.error('用户取消支付', extra));
    } else {
      callbacks.innerCallback('fail', callbacks.error('支付失败', extra));
    }
  },

  runTestMode: function (charge) {
    var path = '/charges/' + charge.id;
    my.httpRequest({
      url: this.PINGPP_NOTIFY_URL_BASE + path + '?livemode=false',
      success: function(res) {
        if (res.data == 'success') {
          callbacks.innerCallback('success');
        } else {
          callbacks.innerCallback('fail',
            callbacks.error('testmode_notify_fail'));
        }
      },
      fail:function() {
        callbacks.innerCallback('fail', callbacks.error('network_err'));
      }
    });
  }
};

}, function(modId) { var map = {"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494741, function(require, module, exports) {
var callbacks = require('../callbacks');

/*global my*/
module.exports = {

  PINGPP_NOTIFY_URL_BASE: 'https://notify.pingxx.com/notify',

  handleCharge: function (charge) {
    var trade_no = charge.credential[charge.channel];
    if (trade_no) {
      this.callpay(trade_no);
    } else {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'missing_alipay_lite'));
    }
  },

  alipayLiteEnabled: function () {
    return typeof my !== 'undefined' && my.tradePay;
  },

  //支付宝小程序支付
  callpay: function (tradeNO) {
    if (!this.alipayLiteEnabled()) {
      console.log('请在支付宝小程序中打开');
      return;
    }
    var alipay_lite = {};
    alipay_lite.tradeNO = tradeNO;
    alipay_lite.complete = function (res) {
      //支付成功
      if (res.resultCode == 9000) {
        callbacks.innerCallback('success');
      } else if (res.resultCode == 6001) { //取消支付
        callbacks.innerCallback('cancel', callbacks.error('用户取消支付'));
      } else {
        callbacks.innerCallback('fail', callbacks.error('支付失败'));
      }
    };
    my.tradePay(alipay_lite);
  },

  runTestMode: function (charge) {
    var path = '/charges/' + charge.id;
    my.httpRequest({
      url: this.PINGPP_NOTIFY_URL_BASE + path + '?livemode=false',
      success: function(res) {
        if (res.data == 'success') {
          callbacks.innerCallback('success');
        } else {
          callbacks.innerCallback('fail',
            callbacks.error('testmode_notify_fail'));
        }
      },
      fail:function() {
        callbacks.innerCallback('fail', callbacks.error('network_err'));
      }
    });
  }
};

}, function(modId) { var map = {"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494742, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  ALIPAY_PC_DIRECT_URL: 'https://mapi.alipay.com/gateway.do',

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var baseURL = this.ALIPAY_PC_DIRECT_URL;
    if (hasOwn.call(credential, 'channel_url')) {
      baseURL = credential.channel_url;
    }
    if (!hasOwn.call(credential, '_input_charset')) {
      if(hasOwn.call(credential, 'service')
        && credential.service === 'create_direct_pay_by_user') {
        credential._input_charset = 'utf-8';
      }
    }
    var query = utils.stringifyData(credential, channel, true);
    utils.redirectTo(baseURL + '?' + query, channel);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494743, function(require, module, exports) {
var hasOwn = {}.hasOwnProperty;
var callbacks = require('../callbacks');

/*global AlipayJSBridge*/
module.exports = {

  handleCharge: function (charge) {
    var credential = charge.credential[charge.channel];
    if (hasOwn.call(credential, 'transaction_no')) {
      this.tradePay(credential.transaction_no);
    } else {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'missing_field_transaction_no'));
    }
  },

  ready: function (callback) {
    if (window.AlipayJSBridge) {
      callback && callback();
    } else {
      document.addEventListener('AlipayJSBridgeReady', callback, false);
    }
  },

  tradePay: function (tradeNO) {
    this.ready(function () {
      // 通过传入交易号唤起快捷调用方式(注意tradeNO大小写严格)
      AlipayJSBridge.call('tradePay', {
        tradeNO: tradeNO
      }, function (data) {
        if ('9000' == data.resultCode) {
          callbacks.innerCallback('success');
        } else if('6001' == data.resultCode) {
          callbacks.innerCallback('cancel', callbacks.error(data.result));
        } else {
          callbacks.innerCallback('fail',
            callbacks.error(data.result));
        }
      });
    });
  }
};

}, function(modId) { var map = {"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494744, function(require, module, exports) {
var redirectBase = require('./commons/redirect_base');

module.exports = {

  handleCharge: function(charge) {
    redirectBase.handleCharge(charge);
  }
};

}, function(modId) { var map = {"./commons/redirect_base":1606699494745}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494745, function(require, module, exports) {
var utils = require('../../utils');
var callbacks = require('../../callbacks');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    var targetURL;
    if (typeof credential === 'string') {
      targetURL = credential;
    } else if (hasOwn.call(credential, 'url')) {
      targetURL = credential.url;
    } else {
      callbacks.innerCallback('fail', callbacks.error('invalid_credential',
        'credential format is incorrect'));
      return;
    }
    utils.redirectTo(targetURL, charge.channel);
  }
};

}, function(modId) { var map = {"../../utils":1606699494732,"../../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494746, function(require, module, exports) {
var utils = require('../utils');
var mods = require('../mods');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  ALIPAY_WAP_URL_OLD: 'https://wappaygw.alipay.com/service/rest.htm',
  ALIPAY_WAP_URL: 'https://mapi.alipay.com/gateway.do',

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var baseURL = this.ALIPAY_WAP_URL;
    if (hasOwn.call(credential, 'req_data')) {
      baseURL = this.ALIPAY_WAP_URL_OLD;
    } else if (hasOwn.call(credential, 'channel_url')) {
      baseURL = credential.channel_url;
    }
    if (!hasOwn.call(credential, '_input_charset')) {
      if ((hasOwn.call(credential, 'service')
          && credential.service === 'alipay.wap.create.direct.pay.by.user')
        || hasOwn.call(credential, 'req_data')
      ) {
        credential._input_charset = 'utf-8';
      }
    }
    var query = utils.stringifyData(credential, channel, true);
    var targetURL = baseURL + '?' + query;
    var ap = mods.getExtraModule('ap');
    if (utils.inWeixin() && typeof ap !== 'undefined') {
      ap.pay(targetURL);
    } else {
      utils.redirectTo(targetURL, channel);
    }
  }
};
}, function(modId) { var map = {"../utils":1606699494732,"../mods":1606699494739}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494747, function(require, module, exports) {
var redirectBase = require('./commons/redirect_base');

module.exports = {

  handleCharge: function(charge) {
    redirectBase.handleCharge(charge);
  }
};

}, function(modId) { var map = {"./commons/redirect_base":1606699494745}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494748, function(require, module, exports) {
var utils = require('../utils');
var callbacks = require('../callbacks');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];

    if (!hasOwn.call(credential, 'url')) {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'missing_field:url'));
      return;
    }
    utils.redirectTo(credential.url + '?' +
      utils.stringifyData(credential, channel), channel);
  }
};

}, function(modId) { var map = {"../utils":1606699494732,"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494749, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  ALIPAY_PC_DIRECT_URL: 'https://intlmapi.alipay.com/gateway.do',

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var baseURL = this.ALIPAY_PC_DIRECT_URL;
    if (hasOwn.call(credential, 'channel_url')) {
      baseURL = credential.channel_url;
    }

    if (!hasOwn.call(credential, '_input_charset')) {
      if(hasOwn.call(credential, 'service')
        && credential.service === 'create_forex_trade') {
        credential._input_charset = 'utf-8';
      }
    }
    var query = utils.stringifyData(credential, channel, true);

    utils.redirectTo(baseURL + '?' + query, channel);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494750, function(require, module, exports) {
var utils = require('../utils');
var mods = require('../mods');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  ALIPAY_WAP_URL: 'https://intlmapi.alipay.com/gateway.do',

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var baseURL = this.ALIPAY_WAP_URL;
    if (hasOwn.call(credential, 'channel_url')) {
      baseURL = credential.channel_url;
    }
    if (!hasOwn.call(credential, '_input_charset')) {
      if ((hasOwn.call(credential, 'service')
          && credential.service === 'create_forex_trade_wap')
      ) {
        credential._input_charset = 'utf-8';
      }
    }

    var query = utils.stringifyData(credential, channel, true);
    var targetURL = baseURL + '?' + query;
    var ap = mods.getExtraModule('ap');
    if (utils.inWeixin() && typeof ap !== 'undefined') {
      ap.pay(targetURL);
    } else {
      utils.redirectTo(targetURL, channel);
    }
  }
};

}, function(modId) { var map = {"../utils":1606699494732,"../mods":1606699494739}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494751, function(require, module, exports) {
var callbacks = require('../callbacks');
var utils = require('../utils');
var stash = require('../stash');
var mods = require('../mods');
var hasOwn = {}.hasOwnProperty;

/*global WeixinJSBridge*/
module.exports = {

  PINGPP_NOTIFY_URL_BASE: 'https://notify.pingxx.com/notify',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    var fields = [
      'appId', 'timeStamp', 'nonceStr', 'package', 'signType', 'paySign'
    ];
    for (var k = 0; k < fields.length; k++) {
      if (!hasOwn.call(credential, fields[k])) {
        callbacks.innerCallback('fail',
          callbacks.error('invalid_credential', 'missing_field_' + fields[k]));
        return;
      }
    }
    stash.jsApiParameters = credential;
    this.callpay();
  },

  callpay: function() {
    var self = this;
    var wx_jssdk = mods.getExtraModule('wx_jssdk');
    if (typeof wx_jssdk !== 'undefined' && wx_jssdk.jssdkEnabled()) {
      wx_jssdk.callpay();
    } else if (typeof WeixinJSBridge == 'undefined') {
      var eventCallback = function() {
        self.jsApiCall();
      };
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady',
          eventCallback, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', eventCallback);
        document.attachEvent('onWeixinJSBridgeReady', eventCallback);
      }
    } else {
      this.jsApiCall();
    }
  },

  jsApiCall: function() {
    if (hasOwn.call(stash, 'jsApiParameters')) {
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        stash.jsApiParameters,
        function(res) {
          delete stash.jsApiParameters;
          if (res.err_msg == 'get_brand_wcpay_request:ok') {
            callbacks.innerCallback('success');
          } else if (res.err_msg == 'get_brand_wcpay_request:cancel') {
            callbacks.innerCallback('cancel');
          } else {
            callbacks.innerCallback('fail',
              callbacks.error('wx_result_fail', res.err_msg));
          }
        }
      );
    }
  },

  runTestMode: function(charge) {
    var dopay = confirm('模拟付款？');
    if (dopay) {
      var path = '/charges/' + charge.id;
      utils.request(this.PINGPP_NOTIFY_URL_BASE + path + '?livemode=false',
        'GET', null,
        function(data, status) {
          if (status >= 200 && status < 400 && data == 'success') {
            callbacks.innerCallback('success');
          } else {
            var extra = 'http_code:' + status + ';response:' + data;
            callbacks.innerCallback('fail',
              callbacks.error('testmode_notify_fail', extra));
          }
        },
        function() {
          callbacks.innerCallback('fail', callbacks.error('network_err'));
        });
    }
  }
};

}, function(modId) { var map = {"../callbacks":1606699494733,"../utils":1606699494732,"../stash":1606699494731,"../mods":1606699494739}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494752, function(require, module, exports) {
var redirectBase = require('./commons/redirect_base');

module.exports = {

  handleCharge: function(charge) {
    redirectBase.handleCharge(charge);
  }
};

}, function(modId) { var map = {"./commons/redirect_base":1606699494745}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494753, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;
var callbacks = require('../callbacks');

module.exports = {

  CCB_WAP_URL_BASE: 'https://ibsbjstar.ccb.com.cn/CCBIS/ccbMain?',

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    if (!hasOwn.call(credential, 'orderinfo')) {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'missing_field:orderinfo'));
      return;
    }

    var targetURL = this.CCB_WAP_URL_BASE + credential['orderinfo'];
    utils.redirectTo(targetURL, channel);
  }
};

}, function(modId) { var map = {"../utils":1606699494732,"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494754, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var baseURL;
    if (hasOwn.call(credential, 'channel_url')) {
      baseURL = credential.channel_url;
      delete credential.channel_url;
    }

    utils.formSubmit(baseURL, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494755, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  CMB_WALLET_URL:
    'https://netpay.cmbchina.com/netpayment/BaseHttp.dll?MB_EUserPay',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    var request_url = this.CMB_WALLET_URL;
    if (hasOwn.call(credential, 'ChannelUrl')) {
      request_url = credential.ChannelUrl;
      delete credential.ChannelUrl;
    }

    if (hasOwn.call(credential, 'channelVersion')) {
      delete credential.channelVersion;
    }

    utils.formSubmit(request_url, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494756, function(require, module, exports) {
var utils = require('../utils');

module.exports = {
  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    utils.formSubmit(credential.request_url, 'post', credential.request_data);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494757, function(require, module, exports) {
var utils = require('../utils');

module.exports = {

  CP_B2B_URL: 'https://payment.chinapay.com/CTITS/service/rest/page/nref/000000000017/0/0/0/0/0',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    utils.formSubmit(this.CP_B2B_URL, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494758, function(require, module, exports) {
var wxLite = require('./wx_lite');

module.exports = wxLite;

}, function(modId) { var map = {"./wx_lite":1606699494759}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494759, function(require, module, exports) {
/**
 * Created by yulitao on 2016/12/29.
 */
var stash = require('../stash');
var callbacks = require('../callbacks');
var hasOwn = {}.hasOwnProperty;
/*global wx*/
module.exports = {

  PINGPP_NOTIFY_URL_BASE: 'https://notify.pingxx.com/notify',

  handleCharge: function (charge) {
    var credential = charge.credential[charge.channel];
    var fields = [
      'appId', 'timeStamp', 'nonceStr', 'package', 'signType', 'paySign'
    ];
    for (var k = 0; k < fields.length; k++) {
      if (!hasOwn.call(credential, fields[k])) {
        callbacks.innerCallback('fail',
          callbacks.error('invalid_credential', 'missing_field_' + fields[k]));
        return;
      }
    }
    stash.jsApiParameters = credential;
    this.callpay();
  },

  wxLiteEnabled: function () {
    return typeof wx !== 'undefined' && wx.requestPayment;
  },

  //微信小程序支付
  callpay: function () {
    if (!this.wxLiteEnabled()) {
      console.log('请在微信小程序中打开');
      return;
    }
    var wx_lite = stash.jsApiParameters;
    delete wx_lite.appId;
    wx_lite.complete = function (res) {
      //支付成功
      if (res.errMsg === 'requestPayment:ok') {
        callbacks.innerCallback('success');
      }
      //取消支付
      if (res.errMsg === 'requestPayment:cancel'
        || res.errMsg === 'requestPayment:fail cancel') {
        callbacks.innerCallback('cancel', callbacks.error('用户取消支付'));
      }
      //支付验证签名失败
      if (res.err_code !== 'undefined' && res.err_desc !== 'undefined') {
        callbacks.innerCallback('fail', callbacks.error(res.err_desc, res));
      }
    };
    wx.requestPayment(wx_lite);
  },

  runTestMode: function (charge) {
    var path = '/charges/' + charge.id;
    wx.request({
      url: this.PINGPP_NOTIFY_URL_BASE + path + '?livemode=false',
      success: function(res) {
        if (res.data == 'success') {
          callbacks.innerCallback('success');
        } else {
          callbacks.innerCallback('fail',
            callbacks.error('testmode_notify_fail'));
        }
      },
      fail:function() {
        callbacks.innerCallback('fail', callbacks.error('network_err'));
      }
    });
  }
};

}, function(modId) { var map = {"../stash":1606699494731,"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494760, function(require, module, exports) {
var redirectBase = require('./commons/redirect_base');
var callbacks = require('../callbacks');
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {
  handleCharge: function (charge) {
    var extra = charge.extra;
    if (hasOwn.call(extra, 'pay_channel')) {
      var pay_channel = extra.pay_channel;
      if (pay_channel === 'wx' && !utils.inWeixin()) {
        callbacks.innerCallback('fail',
          callbacks.error('Not in the WeChat browser'));
        return;
      } else if (pay_channel === 'alipay' && !utils.inAlipay()) {
        callbacks.innerCallback('fail',
          callbacks.error('Not in the Alipay browser'));
        return;
      }
    } else {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_charge', 'charge 格式不正确'));
      return;
    }
    redirectBase.handleCharge(charge);
  }
};

}, function(modId) { var map = {"./commons/redirect_base":1606699494745,"../callbacks":1606699494733,"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494761, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  JDPAY_WAP_URL_OLD: 'https://m.jdpay.com/wepay/web/pay',
  JDPAY_H5_URL: 'https://h5pay.jd.com/jdpay/saveOrder',
  JDPAY_PC_URL: 'https://wepay.jd.com/jdpay/saveOrder',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    var request_url = this.JDPAY_H5_URL;
    if (hasOwn.call(credential, 'channelUrl')) {
      request_url = credential.channelUrl;
      delete credential.channelUrl;
    } else if (hasOwn.call(credential, 'merchantRemark')) {
      request_url = this.JDPAY_WAP_URL_OLD;
    }
    utils.formSubmit(request_url, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494762, function(require, module, exports) {
var utils = require('../utils');

module.exports = {

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    var request_url = credential.channelUrl;
    delete credential.channelUrl;

    utils.formSubmit(request_url, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494763, function(require, module, exports) {
var utils = require('../utils');

module.exports = {
  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    utils.redirectTo(credential, charge.channel);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494764, function(require, module, exports) {
var callbacks = require('../callbacks');
var utils = require('../utils');
var stash = require('../stash');
var hasOwn = {}.hasOwnProperty;

/*global mqq*/
module.exports = {
  SRC_URL: 'https://open.mobile.qq.com/sdk/qqapi.js?_bid=152',
  ID: 'mqq_api',

  handleCharge: function (charge) {
    var credential = charge.credential[charge.channel];

    if (!hasOwn.call(credential, 'token_id')) {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'missing_token_id'));
      return;
    }
    stash.tokenId = credential.token_id;
    utils.loadUrlJs(this.ID, this.SRC_URL, this.callpay);
  },

  callpay: function () {
    if (typeof mqq != 'undefined') {
      if (mqq.QQVersion == 0) {
        callbacks.innerCallback('fail',
          callbacks.error('Not in the QQ client'));
        delete stash.tokenId;
        return;
      }
      mqq.tenpay.pay({
        tokenId: stash.tokenId
      }, function (result) {
        if (result.resultCode == 0) {
          callbacks.innerCallback('success');
        } else {
          callbacks.innerCallback('fail',
            callbacks.error(result.retmsg));
        }
      });
    } else {
      callbacks.innerCallback('fail',
        callbacks.error('network_err'));
    }
    delete stash.tokenId;
  }
};
}, function(modId) { var map = {"../callbacks":1606699494733,"../utils":1606699494732,"../stash":1606699494731}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494765, function(require, module, exports) {
var utils = require('../utils');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var baseURL;
    if (hasOwn.call(credential, 'channel_url')) {
      baseURL = credential.channel_url;
      delete credential.channel_url;
    }

    utils.formSubmit(baseURL, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494766, function(require, module, exports) {
var utils = require('../utils');

module.exports = {

  UPACP_PC_URL: 'https://gateway.95516.com/gateway/api/frontTransReq.do',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    utils.formSubmit(this.UPACP_PC_URL, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494767, function(require, module, exports) {
var utils = require('../utils');

module.exports = {

  UPACP_WAP_URL: 'https://gateway.95516.com/gateway/api/frontTransReq.do',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    utils.formSubmit(this.UPACP_WAP_URL, 'post', credential);
  }
};

}, function(modId) { var map = {"../utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494768, function(require, module, exports) {
var wxLite = require('./wx_lite');

module.exports = wxLite;

}, function(modId) { var map = {"./wx_lite":1606699494759}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494769, function(require, module, exports) {
var callbacks = require('../callbacks');
var utils = require('../utils');
var stash = require('../stash');
var mods = require('../mods');
var hasOwn = {}.hasOwnProperty;

/*global WeixinJSBridge*/
module.exports = {

  PINGPP_NOTIFY_URL_BASE: 'https://notify.pingxx.com/notify',

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    var fields = [
      'appId', 'timeStamp', 'nonceStr', 'package', 'signType', 'paySign'
    ];
    for (var k = 0; k < fields.length; k++) {
      if (!hasOwn.call(credential, fields[k])) {
        callbacks.innerCallback('fail',
          callbacks.error('invalid_credential', 'missing_field_' + fields[k]));
        return;
      }
    }
    stash.jsApiParameters = credential;
    this.callpay();
  },

  callpay: function() {
    var self = this;
    var wx_jssdk = mods.getExtraModule('wx_jssdk');
    if (typeof wx_jssdk !== 'undefined' && wx_jssdk.jssdkEnabled()) {
      wx_jssdk.callpay();
    } else if (typeof WeixinJSBridge == 'undefined') {
      var eventCallback = function() {
        self.jsApiCall();
      };
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady',
          eventCallback, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', eventCallback);
        document.attachEvent('onWeixinJSBridgeReady', eventCallback);
      }
    } else {
      this.jsApiCall();
    }
  },

  jsApiCall: function() {
    if (hasOwn.call(stash, 'jsApiParameters')) {
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        stash.jsApiParameters,
        function(res) {
          delete stash.jsApiParameters;
          if (res.err_msg == 'get_brand_wcpay_request:ok') {
            callbacks.innerCallback('success');
          } else if (res.err_msg == 'get_brand_wcpay_request:cancel') {
            callbacks.innerCallback('cancel');
          } else {
            callbacks.innerCallback('fail',
              callbacks.error('wx_result_fail', res.err_msg));
          }
        }
      );
    }
  },

  runTestMode: function(charge) {
    var dopay = confirm('模拟付款？');
    if (dopay) {
      var path = '/charges/' + charge.id;
      utils.request(this.PINGPP_NOTIFY_URL_BASE + path + '?livemode=false',
        'GET', null,
        function(data, status) {
          if (status >= 200 && status < 400 && data == 'success') {
            callbacks.innerCallback('success');
          } else {
            var extra = 'http_code:' + status + ';response:' + data;
            callbacks.innerCallback('fail',
              callbacks.error('testmode_notify_fail', extra));
          }
        },
        function() {
          callbacks.innerCallback('fail', callbacks.error('network_err'));
        });
    }
  }
};

}, function(modId) { var map = {"../callbacks":1606699494733,"../utils":1606699494732,"../stash":1606699494731,"../mods":1606699494739}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494770, function(require, module, exports) {
var wxPub = require('./wx_pub');

module.exports = wxPub;

}, function(modId) { var map = {"./wx_pub":1606699494769}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494771, function(require, module, exports) {
var wxPub = require('./wx_pub');

module.exports = wxPub;

}, function(modId) { var map = {"./wx_pub":1606699494769}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494772, function(require, module, exports) {
var utils = require('../utils');
var callbacks = require('../callbacks');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  handleCharge: function(charge) {
    var credential = charge.credential[charge.channel];
    if (typeof credential === 'string') {
      utils.redirectTo(credential, charge.channel);
    } else if (typeof credential === 'object'
      && hasOwn.call(credential, 'url')
    ) {
      utils.redirectTo(credential.url, charge.channel);
    } else {
      callbacks.innerCallback('fail',
        callbacks.error('invalid_credential', 'credential 格式不正确'));
    }
  }
};

}, function(modId) { var map = {"../utils":1606699494732,"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494773, function(require, module, exports) {
var utils = require('../utils');
var callbacks = require('../callbacks');
var hasOwn = {}.hasOwnProperty;

module.exports = {

  YEEPAY_WAP_URL: 'https://ok.yeepay.com/paymobile/api/pay/request',
  YEEPAY_WAP_TEST_URL: 'http://mobiletest.yeepay.com/paymobile/api/pay/request',

  handleCharge: function(charge) {
    var channel = charge.channel;
    var credential = charge.credential[channel];
    var fields = ['merchantaccount', 'encryptkey', 'data'];
    for (var k = 0; k < fields.length; k++) {
      if (!hasOwn.call(credential, fields[k])) {
        callbacks.innerCallback('fail',
          callbacks.error('invalid_credential', 'missing_field_' + fields[k]));
        return;
      }
    }
    var baseURL;
    if (hasOwn.call(credential, 'mode') && credential.mode == 'test') {
      baseURL = this.YEEPAY_WAP_TEST_URL;
    } else {
      baseURL = this.YEEPAY_WAP_URL;
    }
    utils.redirectTo(baseURL + '?' +
      utils.stringifyData(credential, channel, true), charge.channel);
  }
};

}, function(modId) { var map = {"../utils":1606699494732,"../callbacks":1606699494733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494774, function(require, module, exports) {
var stash = require('../../stash');
var hasOwn = {}.hasOwnProperty;

(function() {
  var b = {};
  var a = {};
  a.PADCHAR = '=';
  a.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  a.makeDOMException = function() {
    try {
      return new DOMException(DOMException.INVALID_CHARACTER_ERR);
    } catch (d) {
      var c = new Error('DOM Exception 5');
      c.code = c.number = 5;
      c.name = c.description = 'INVALID_CHARACTER_ERR';
      c.toString = function() {
        return 'Error: ' + c.name + ': ' + c.message;
      };
      return c;
    }
  };
  a.getbyte64 = function(e, d) {
    var c = a.ALPHA.indexOf(e.charAt(d));
    if (c === -1) {
      throw a.makeDOMException();
    }
    return c;
  };
  a.decode = function(f) {
    f = '' + f;
    var j = a.getbyte64;
    var h, e, g;
    var d = f.length;
    if (d === 0) {
      return f;
    }
    if (d % 4 !== 0) {
      throw a.makeDOMException();
    }
    h = 0;
    if (f.charAt(d - 1) === a.PADCHAR) {
      h = 1;
      if (f.charAt(d - 2) === a.PADCHAR) {
        h = 2;
      }
      d -= 4;
    }
    var c = [];
    for (e = 0; e < d; e += 4) {
      g = (j(f, e) << 18) |
        (j(f, e + 1) << 12) |
        (j(f, e + 2) << 6) |
        j(f, e + 3);
      c.push(String.fromCharCode(g >> 16, (g >> 8) & 255, g & 255));
    }
    switch (h) {
      case 1:
        g = (j(f, e) << 18) | (j(f, e + 1) << 12) | (j(f, e + 2) << 6);
        c.push(String.fromCharCode(g >> 16, (g >> 8) & 255));
        break;
      case 2:
        g = (j(f, e) << 18) | (j(f, e + 1) << 12);
        c.push(String.fromCharCode(g >> 16));
        break;
    }
    return c.join('');
  };
  a.getbyte = function(e, d) {
    var c = e.charCodeAt(d);
    if (c > 255) {
      throw a.makeDOMException();
    }
    return c;
  };
  a.encode = function(f) {
    if (arguments.length !== 1) {
      throw new SyntaxError('Not enough arguments');
    }
    var g = a.PADCHAR;
    var h = a.ALPHA;
    var k = a.getbyte;
    var e, j;
    var c = [];
    f = '' + f;
    var d = f.length - f.length % 3;
    if (f.length === 0) {
      return f;
    }
    for (e = 0; e < d; e += 3) {
      j = (k(f, e) << 16) | (k(f, e + 1) << 8) | k(f, e + 2);
      c.push(h.charAt(j >> 18));
      c.push(h.charAt((j >> 12) & 63));
      c.push(h.charAt((j >> 6) & 63));
      c.push(h.charAt(j & 63));
    }
    switch (f.length - d) {
      case 1:
        j = k(f, e) << 16;
        c.push(h.charAt(j >> 18) + h.charAt((j >> 12) & 63) + g + g);
        break;
      case 2:
        j = (k(f, e) << 16) | (k(f, e + 1) << 8);
        c.push(h.charAt(j >> 18) +
          h.charAt((j >> 12) & 63) +
          h.charAt((j >> 6) & 63) + g);
        break;
    }
    return c.join('');
  };
  b.url = 'pay.htm';
  b.pay = function(d) {
    var c = encodeURIComponent(a.encode(d));
    if (hasOwn.call(stash, 'APURL')) {
      b.url = stash.APURL;
    }
    location.href = b.url + '?goto=' + c;
  };
  b.decode = function(c) {
    return a.decode(decodeURIComponent(c));
  };

  module.exports = b;
})();

}, function(modId) { var map = {"../../stash":1606699494731}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1606699494775, function(require, module, exports) {
var hasOwn = {}.hasOwnProperty;
var callbacks = require('./callbacks');
var utils = require('./utils');

module.exports = {
  signAgreement: function (agreement) {
    var agreementObj;
    if (typeof agreement === 'string') {
      try {
        agreementObj = JSON.parse(agreement);
      } catch (err) {
        callbacks.innerAgreementCallback('fail',
          callbacks.error('json_decode_fail', err));
        return false;
      }
    } else {
      agreementObj = agreement;
    }

    if (typeof agreementObj === 'undefined') {
      callbacks.innerAgreementCallback('fail',
        callbacks.error('json_decode_fail'));
      return false;
    }

    if (!hasOwn.call(agreementObj, 'object')
      || agreementObj.object !== 'agreement'
      || !hasOwn.call(agreementObj, 'channel')
      || !hasOwn.call(agreementObj, 'credential')
      || typeof agreementObj.credential !== 'object'
    ) {
      callbacks.innerAgreementCallback('fail',
        callbacks.error('invalid_object'));
      return false;
    }

    if (!hasOwn.call(agreementObj.credential, agreementObj.channel)) {
      callbacks.innerAgreementCallback('fail',
        callbacks.error('invalid_credential'));
      return false;
    }

    var credential = agreementObj.credential[agreementObj.channel];
    var urlToOpen;
    if (typeof credential === 'string') {
      urlToOpen = credential;
    } else if (hasOwn.call(credential, 'credential')
      && typeof credential.credential === 'string'
    ) {
      urlToOpen = credential.credential;
    }

    if (typeof urlToOpen === 'undefined') {
      callbacks.innerAgreementCallback('fail',
        callbacks.error('invalid_credential'));
      return false;
    }

    if (agreementObj.channel.substring(0, 6) === 'alipay') {
      var url = new URL(urlToOpen);
      urlToOpen = 'http://d.alipay.com/i/index.htm?iframeSrc='
        + encodeURIComponent('alipays://platformapi/startapp?appId=60000157'
          +'&appClearTop=false&startMultApp=YES&sign_params='
          + encodeURIComponent(url.search.substring(1))
        );
    }

    setTimeout(function() {
      utils.redirectTo(urlToOpen);
    }, 0);

    return true;
  }
};
}, function(modId) { var map = {"./callbacks":1606699494733,"./utils":1606699494732}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1606699494728);
})()
//# sourceMappingURL=index.js.map