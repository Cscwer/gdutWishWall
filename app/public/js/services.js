var Host = 'http://gdutgirl.duapp.com'; //定义主机


/************************** 用户服务**********************/
app.factory('UserService', ['$http',
    function($http) {
        return {
            //获取当前登录用户信息
            getMyInfo: function() {
                return $http({
                    method: 'GET',
                    url: Host + '/api/user/info'
                });
            },
            //获取用户信息
            getUserInfo: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/users/' + data.userId
                });
            },

            //更新用户信息
            updateInfo: function(data) {
                return $http({
                    method: 'PUT',
                    url: Host + '/api/users/' + data.user,
                    data: data
                });
            }
        };
    }
]);

/************************** 愿望服务**********************/
app.factory('WishService', ['$http',
    function($http) {
        return {

            getUnpickedWishes: function(page, perPage, searchArea, searchWishType) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/wishes?page=' + page + '&perPage=' + perPage + '&area=' + searchArea + '&type=' + searchWishType
                });
            },

            searchWish: function(content) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/wishes/search?content=' + content
                });
            },

            putWish: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/api/wishes',
                    data: data
                });
            },

            findWish: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/wishes/' + data.wishId
                });
            },

            getWish: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/wishes/user/' + data.userId + '?sex=' + data.sex
                });
            },

            updateWishState: function(data) {
                return $http({
                    method: 'PUT',
                    url: Host + '/api/wishes/state/' + data.wishId,
                    data: data
                });
            },

            updateWish: function(data) {
                return $http({
                    method: 'PUT',
                    url: Host + '/api/wishes/' + data.wishId,
                    data: data
                });
            },

            deleteWish: function(data) {
                return $http({
                    method: 'DELETE',
                    url: Host + '/api/wishes/' + data._id,
                    data: data
                });
            },
        };
    }
]);






//消息服务
app.factory('MsgService', ['$http',
    function($http) {
        return {
            getMsg: function(userId) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/msgs/' + userId
                });
            },

            getUnreadMsgNum: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/getunreadmsgnum?uid=' + data
                });
            },

            readMsg: function(userId, msgType) {
                return $http({
                    method: 'PUT',
                    url: Host + '/api/msgs/' + userId + '/' + msgType
                });
            },

            getContact: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/contacts?this=' + data.this + '&that=' + data.that
                });
            }


        };
    }
]);


/***************************祝福墙服务**********************/
app.factory('BlessService', ['$http',
    function($http) {
        return {

            getBlesses: function(page, perPage, searchArea, searchSort) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/blesses?page=' + page + '&perPage=' + perPage + '&area=' + searchArea + '&sort=' + searchSort
                });
            },

            makePraise: function(data) {
                return $http({
                    method: 'PUT',
                    url: Host + '/api/blesses/' + data.blessId,
                    data: data
                });
            },

            putBless: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/api/blesses',
                    data: data
                });
            },

            getBless: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/blesses/' + data.blessId
                });
            },

            getUserBless: function(data) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/blesses/user/' + data.userId
                });
            },

            deleteBless: function(data) {
                return $http({
                    method: 'DELETE',
                    url: Host + '/api/blesses/' + data._id
                });
            },
        };
    }
]);


/***************************微信服务************************/

//根据code获取网页授权access_token及用户资料
app.factory('WeChatService', ['$http',
    function($http) {
        return {

            getWeChatInfo: function(code) {
                return $http({
                    method: 'GET',
                    url: Host + '/api/wechat/info'
                });
            },

            getSignature: function(data) {
                return $http({
                    method: 'POST',
                    url: Host + '/api/wechat/signature',
                    data: data
                });
            },
        };
    }
]);


/****************定义各种共享的数据******************/
app.factory('WishData', function() {
    return {
        user: '',
        username: '',
        wishType: '',
        wish: ''
    };
});

app.factory('BlessData', function() {
    return {
        user: '',
        username: '',
        bless: ''
    };
});

app.factory('SearchConfig', function() {
    return {
        search_area: '',
        search_wishtype: '',
        bless_search_area: '',
        search_sort: '',
        searchinput: ''
    };
});