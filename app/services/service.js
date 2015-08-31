/****************定义各种服务*****************/
var Host = 'localhost:18080'; //定义主机

//定义登录服务
app.factory('LoginService', ['$http',
    function($http) {
        return {
            doLogin: function(data) {
                return $http({
                    method: 'POST',
                    url: '/login',
                    data: data
                });
            }
        };
    }
]);

//注销登录服务
app.factory('LogoutService', ['$http',
    function($http) {
        return {
            doLogout: function() {
                return $http({
                    method: 'POST',
                    url: '/logout'
                });
            }
        };
    }
]);

//获取指定用户的信息
app.factory('GetUserInfoService', ['$http',
    function($http) {
        return {
            getUserInfo: function(data) {
                return $http({
                    method: 'GET',
                    url: '/getUserInfo?userId=' + data.userId
                });
            }
        };
    }
]);

//更新用户信息
app.factory('UpdateInfoService', ['$http',
    function($http) {
        return {
            updateInfo: function(data) {
                return $http({
                    method: 'POST',
                    url: '/updateinfo',
                    data: data
                })
            }
        };
    }
]);

//获取所有未领取愿望
app.factory('GetUnpickedWish', ['$http',
    function($http) {
        return {
            getWishes: function() {
                return $http({
                    method: 'GET',
                    url: '/getUnpickedWish'
                });
            }
        };
    }
]);

//发布愿望
app.factory('PutWishService', ['$http',
    function($http) {
        return {
            putWish: function(data) {
                return $http({
                    method: 'POST',
                    url: '/putwish',
                    data: data
                });
            }
        };
    }
]);

//查找指定愿望
app.factory('FindWishService', ['$http',
    function($http) {
        return {
            findWish: function(data) {
                return $http({
                    method: 'GET',
                    url: '/getwish?wishId=' + data.wishId
                });
            }
        }
    }
]);

//男生领取愿望
// app.factory('PickWishService', ['$http', function($http) {
//     return {
//         pickWish: function(data) {
//             return $http({
//                 method: 'POST',
//                 url: '/pickwish',
//                 data: data
//             });
//         }
//     };
// }]);

//女生获取自己的愿望
app.factory('GetFemaleWishService', ['$http',
    function($http) {
        return {
            getWish: function(data) {
                return $http({
                    method: 'GET',
                    url: '/getfemalewish?userId=' + data.userId,
                    data: data
                });
            }
        };
    }
]);

//更新愿望状态
app.factory('UpdateWishService', ['$http',
    function($http) {
        return {
            updateWishState: function(data) {
                return $http({
                    method: 'POST',
                    url: '/updatewishstate',
                    data: data
                });
            },

            updateWish: function(data) {
                return $http({
                    method: 'POST',
                    url: '/refreshwish',
                    data: data
                });
            },

            deleteWish: function(data) {
                return $http({
                    method: 'POST',
                    url: '/deletewish',
                    data: data
                });
            },


        };
    }
]);

//男生获取自己领取的愿望
app.factory('GetMaleWishService', ['$http',
    function($http) {
        return {
            getWish: function(data) {
                return $http({
                    method: 'GET',
                    url: '/getmalewish?pickerId=' + data.pickerId
                });
            }
        };
    }
]);

//消息服务
app.factory('MsgService', ['$http',
    function($http) {
        return {
            getMsg: function(data) {
                return $http({
                    method: 'GET',
                    url: '/getmessage?userId=' + data.userId
                });
            },

            readMsg: function(uid) {
                return $http({
                    method: 'GET',
                    url: '/readmessage?userId=' + uid
                });
            },


        };
    }
]);

//聊天服务
app.factory('ContactService', ['$http',
    function($http) {
        return {
            getContact: function(data) {
                return $http({
                    method: 'POST',
                    url: '/getcontact',
                    data: data
                });
            }
        };
    }
]);

/***************************微信服务************************/

//根据code获取网页授权access_token及用户资料
app.factory('WeChatService', ['$http',
    function($http) {
        return {
            getAccessToken: function(code) {
                return $http({
                    method: 'GET',
                    // url: 'https://api.weixin.qq.com/sns/oauth2/access_token?jsonp=JSON_CALLBACK&jsonp&appid=wxc0328e0fe1f4cc8b&secret=06026b20b7c510a6bdebf8b9218d3e6f&code=' + code + '&grant_type=authorization_code',
                    url: '/getAccessToken?code='+code
                    // data: data
                    // responseType: 'json'
                });
            }
        };
    }
]);