//index.js
//获取应用实例
const utils = require('../../utils/util.js')
var config = require("../../config.js")
var app = getApp()

Page({
  data: {
    loading: false, // 加载中

    activityOrBrand: true, // 正显示活动还是优惠 —— true 为活动
    list: {
      activity: { pageNo: 1, data: [] },
      brand: { pageNo: 1, data: [] },
    },

    dateList: [],   // 日历数据数组
    swiperCurrent: 0, // 日历轮播正处在哪个索引位置
    dateCurrent: new Date(),  // 正选择的当前日期
    dateCurrentStr: '', // 正选择日期的 id
    dateMonth: '1月',  // 正显示的月份
    dateListArray: ['日', '一', '二', '三', '四', '五', '六'],
  },
  onLoad(options) {
    var that = this;
    this.setData(options);
    // this.loading();
    this.initDate(); // 日历组件程序
    //this.initList(); // 列表程序
    console.log(this.data.dateCurrentStr);
    wx.request({
      url: config.host + '/kfood_list',
      method: 'GET',
      header: {
        'Authorization': "JWT ",
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      data: { pno: that.data.pno },
      success: function (res) {
        console.log(res);
        that.setData(res.data);
        that.setData({
          list: {
            activity: { pageNo: 1, data: res.data.list },
            brand: { pageNo: 1, data: [] },
          }
        })
      }
    })
    console.log(options);
  },
  onShow: function (e) {
    // this.loading('close');
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        });
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadList(true);
  },
  onReachBottom() {
    this.loadList();
  },

  // 顶部 tab 部分
  // ----------------------------
  choose1(e) {
    var that = this;
    this.setData({
      activityOrBrand: !that.data.activityOrBrand,
    });
    this.loadList();
  },

  // 日历组件部分
  // ----------------------------
  initDate() {
    var d = new Date();
    var month = utils.addZero(d.getMonth() + 1),
      day = utils.addZero(d.getDate());
    for (var i = -3; i <= 3; i++) {
      this.updateDate(utils.DateAddDay(d, i * 7));
    }
    this.setData({
      swiperCurrent: 3,
      dateCurrent: d,
      dateCurrentStr: d.getFullYear() + '-' + month + '-' + day,
      dateMonth: month + '月',
    });
  },
  // 获取这周从周日到周六的日期
  calculateDate(_date) {
    var first = utils.FirstDayInThisWeek(_date);
    var d = {
      'month': first.getMonth() + 1,
      'days': [],
    };
    for (var i = 0; i < 7; i++) {
      var dd = utils.DateAddDay(first, i);
      var day = utils.addZero(dd.getDate()),
        month = utils.addZero(dd.getMonth() + 1);
      d.days.push({
        'day': day,
        'id': dd.getFullYear() + '-' + month + '-' + day,
      });
    }
    return d;
  },
  // 更新日期数组数据
  updateDate(_date, atBefore) {
    var week = this.calculateDate(_date);
    if (atBefore) {
      this.setData({
        dateList: [week].concat(this.data.dateList),
      });
    } else {
      this.setData({
        dateList: this.data.dateList.concat(week),
      });
    }
  },
  // 日历组件轮播切换
  dateSwiperChange(e) {
    var index = e.detail.current;
    var d = this.data.dateList[index];
    this.setData({
      swiperCurrent: index,
      dateMonth: d.month + '月',
    });
  },
  // 获得日期字符串
  getDateStr: function (arg) {
    if (utils.type(arg) == 'array') {
      return arr[0] + '-' + arr[1] + '-' + arr[2] + ' 00:00:00';
    } else if (utils.type(arg) == 'date') {
      return arg.getFullYear() + '-' + (arg.getMonth() + 1) + '-' + arg.getDate() + ' 00:00:00';
    } else if (utils.type(arg) == 'object') {
      return arg.year + '-' + arg.month + '-' + arg.day + ' 00:00:00';
    }
  },
  // 点击日历某日
  chooseDate(e) {
    var str = e.target.id;
    this.setData({ dateCurrentStr: str, });
    this.loadList(true);
  },


  // 列表部分
  // ----------------------------
  // 初始化列表
  initList() {
    this.loadList(true);
  },
  // 下拉加载更多
  loadMore() {
    // this.loadList();
  },
  // 列表数据
  loadList(reFresh) {
    var dateStr = this.data.dateCurrentStr + ' 00:00:00',
      flag = this.data.activityOrBrand,
      _data = this.data.list,
      _list = (flag == true ? _data.activity : _data.brand),
      pageNo = reFresh ? 1 : ++_list.pageNo,
      list = reFresh ? [] : _list.data;
    // console.log(dateStr, flag, pageNo, list);

    // 请求数据接口
    var that = this;
    that.loading();
    console.log(flag, pageNo, dateStr);/*
    wx.request({
      url: "https://sum.kdcer.com/api/Applet/GetTest?dirFlag="+flag+"&pageNo="+pageNo+"&pageSize=10&dt="+dateStr,
      success (res) {
        console.log(res.data)
        that.loading('close');
 
        if (flag) {
          var _d = that.defaultTheData(res.data);
          _list.data = list.concat(_d);
        } else {
          var _d = [];
          for(var i in res.data) {
            _d.push(res.data[i]);
          }
          _list.data = list.concat(_d);
        }
        // console.log(_data.activity, _data.brand);
        // 上传供页面渲染
        that.setData({
          list: _data,
        });
      },
      fail (e) {
        console.log(e);
      }
    });*/
  },
  // 对返回的数据进行处理
  defaultTheData(data) {
    // for(var i in data) {
    //   var c = data[i].Content;
    //   if (!(c && c.BeginTime && c.EndTime)) {data[i].Time = ''; continue;} 
    //   data[i]['Time'] = c.BeginTime.replace(/-/g,'/') + ' - ' + c.EndTime.replace(/-/g,'/');
    // }
    return data;
  },
  loading(close) {
    if (!close) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1000,
      });
    } else {
      wx.hideToast();
    }
  },

  onShareAppMessage: function () {
    return {
      title: '优惠尽在青浦奥莱',
      path: 'index'
    }
  }
})
