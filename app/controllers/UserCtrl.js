//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope', '$state', 'LogoutService',
    function($scope, $rootScope, $state, LogoutService) {
        //系统消息队列
        $rootScope.SystemMsg = JSON.parse(localStorage.getItem('SystemMsg')) || [];

        //判断用户是否登录以及性别
        var updateLoginState = function() {
            if (sessionStorage.getItem('uid')) {
                $scope.isLogined = true;
                $scope.username = sessionStorage.getItem('username');
                $scope.userId = sessionStorage.getItem('uid');
                $scope.email = sessionStorage.getItem('email');
                if (sessionStorage.getItem('sex') == 'male') {
                    $scope.sex = 'male';
                }
                if (sessionStorage.getItem('sex') == 'female') {
                    $scope.sex = 'female';
                }
            } else {
                $scope.isLogined = false;
                $scope.username = '';
                $scope.userId = '';
                $scope.email = '';
                $scope.sex = '';
            }
        };


        //注销登录
        $scope.doLogout = function() {
            LogoutService.doLogout()
                .success(function() {
                    sessionStorage.removeItem('username');
                    sessionStorage.removeItem('sex');
                    sessionStorage.removeItem('uid');
                    $state.go('index');
                });

        };

        updateLoginState();
        //监听路由跳转事件，跳转后自动更新登录状态
        $rootScope.$on('$stateChangeStart', function() {
            updateLoginState();
        })

        //基于 socket.io 的消息推送
        $scope.hasNewMsg = false;
        $rootScope.isConnected = false;
        $rootScope.socket = io.connect('http://gdutgirl.duapp.com');
        $rootScope.socket.on('open', function() {
            $rootScope.isConnected = true;
            console.log('连接成功');
        });
        $rootScope.socket.on('msg', function(msg) {
            if (msg.receiver === sessionStorage.getItem('uid') || msg.sender === sessionStorage.getItem('uid')) {

                $scope.$apply(function() {
                    $rootScope.SystemMsg.push(msg);
                });
                if(msg.receiver === sessionStorage.getItem('uid')) {
                  $scope.$apply(function() {
                    $scope.hasNewMsg = true;
                  });
                }

                localStorage.setItem('SystemMsg', JSON.stringify($rootScope.SystemMsg));
            }

        });

        $scope.cancelMsgCount = function() {
            $scope.hasNewMsg = false;
        };

    }
]);

//用户信息控制器
app.controller('UserInfoCtrl', ['$scope', '$state', '$stateParams', 'GetUserInfoService',
    function($scope, $state, $stateParams, GetUserInfoService) {
        if (sessionStorage.getItem('uid')) {
            var data = {
                userId: $stateParams.userId
            };
            GetUserInfoService.getUserInfo(data)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.username = data.user.username;
                        $scope.email = data.user.email;
                        $scope.sex = data.user.sex;
                    }
                });
        } else {
            $state.go('user.login');
        }
    }
]);

//登录控制器
app.controller('LoginCtrl', ['$scope', '$state', 'LoginService',
    function($scope, $state, LoginService) {

        //登录动作函数
        $scope.doLogin = function() {

            //获取表单中的用户信息
            var data = {
                username: $scope.username,
                password: $scope.password
            };

            //调用登录服务
            LoginService.doLogin(data)
                .success(function(data, status) {
                    if (status === 200) {
                        //如果登录成功,则进行会话存储
                        sessionStorage.setItem('username', data.user.username);
                        sessionStorage.setItem('uid', data.user._id);
                        sessionStorage.setItem('sex', data.user.sex);
                        sessionStorage.setItem('email', data.user.email);
                        //路由状态跳转
                        $state.go('index');
                    }
                });
        };
    }
]);

//女生控制器
app.controller('FemaleCtrl', ['$scope', '$state', 'PutWishService',
    function($scope, $state, PutWishService) {

        if (sessionStorage.getItem('username')) {

            //女生许愿
            $scope.putwish = function() {

                //组装愿望数据包
                var data = {
                    user: sessionStorage.getItem('uid'),
                    username: sessionStorage.getItem('username'),
                    wishType: $scope.wish_type,
                    wish: $scope.wish
                };
                console.log(data);

                PutWishService.putWish(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            alert('许愿成功');
                            $state.go('index');
                        }
                    });

            };


        } else {
            $state.go('user.login');
        }

    }
]);

//消息控制器
app.controller('MsgCtrl', ['$scope', '$rootScope', '$state',
    function($scope, $rootScope, $state) {
        $scope.thisUser = sessionStorage.getItem('uid');
        // $rootScope.SystemMsg = JSON.parse(localStorage.getItem('SystemMsg')) || [];
        console.log($rootScope.SystemMsg);
        $scope.clearMsg = function() {
            localStorage.removeItem('SystemMsg');
            $rootScope.SystemMsg = [];
            // $state.reload('user.message');
        };
    }
]);

//用户联系控制器
app.controller('ContactCtrl', ['$scope', '$rootScope', '$stateParams',
    function($scope, $rootScope, $stateParams) {
        // $rootScope.isConnected = false;

        // $scope.myMsg = [];
        // for(msg of SystemMsg) {
        // 	if(msg.receiver === $stateParams.userId) {
        // 		$scope.myMsg.push(msg);
        // 	}
        // 	if(msg.sender === sessionStorage.getItem('uid')) {

        // 	}
        // }
        $scope.thatUser = $stateParams.userId;
        $scope.thisUser = sessionStorage.getItem('uid');
        $scope.sendMsg = function() {
            var now = new Date();
            var msg = {
                msg: $scope.contact_msg,
                receiver: $stateParams.userId,
                sender: sessionStorage.getItem('uid'),
                sender_name: sessionStorage.getItem('username'),
                time: now.getTime()
            };
            $rootScope.socket.emit('message', msg);
        };
    }
]);


//愿望控制器
app.controller('WishCtrl', ['$scope', '$state', '$stateParams', 'FindWishService', 'PickWishService',
    function($scope, $state, $stateParams, FindWishService, PickWishService) {
        var data = {
            wishId: $stateParams.wishId
        };
        FindWishService.findWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.wish = data.wish;
                }
            });

        $scope.pickWish = function() {

            if (sessionStorage.getItem('username')) {
                if (sessionStorage.getItem('sex') === 'male') {
                    var data = {
                        wish: $scope.wish,
                        wishPicker: sessionStorage.getItem('uid'),
                        wishPickerName: sessionStorage.getItem('username')
                    };
                    PickWishService.pickWish(data)
                        .success(function(data, status) {
                            if (status === 200) {
                                alert('领取成功');
                                $state.go('index');
                            }
                        });
                } else {
                    alert('只有男生才能领取愿望!');
                    $state.go('index');
                }
            } else {
                $state.go('user.login');
            }
        };
    }
]);

//女生愿望控制器
app.controller('FemaleWishCtrl', ['$scope', '$state', 'GetFemaleWishService',
    function($scope, $state, GetFemaleWishService) {
        $scope.UnpickWishes = [];
        $scope.PickedWishes = [];
        //获取女生自己的愿望
        var data = {
            userId: sessionStorage.getItem('uid')
        };
        GetFemaleWishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    // $scope.UnpickWishes = data.wishes;
                    console.log(data.wishes);
                    //筛选出已被领取和未被领取的愿望
                    for (var i = 0; i < data.wishes.length; i++) {
                        if (data.wishes[i].ispicked === 0) {
                            $scope.UnpickWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 1) {
                            $scope.PickedWishes.push(data.wishes[i]);
                        }
                    }
                }
            });

    }
]);

//男生愿望控制器
app.controller('MaleWishCtrl', ['$scope', '$state', 'GetMaleWishService',
    function($scope, $state, GetMaleWishService) {
        var data = {
            pickerId: sessionStorage.getItem('uid')
        };
        GetMaleWishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.wishes = data.wishes;
                }
            })
    }
]);