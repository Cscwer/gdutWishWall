//主页控制器
app.controller('IndexCtrl', ['$scope', 'GetUnpickedWish',
    function($scope, GetUnpickedWish) {
        GetUnpickedWish.getWishes()
            .success(function(data) {
                $scope.wishes = data.wishes;
            });
    }
]);

//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope', '$state', 'LogoutService',
    function($scope, $rootScope, $state, LogoutService) {
        //系统消息队列
        $rootScope.SystemMsg = JSON.parse(localStorage.getItem('SystemMsg')) || [];

        //判断用户是否登录以及性别
        var updateLoginState = function() {
            if (sessionStorage.getItem('uid')) {
                $rootScope.isLogined = true;
                $rootScope.username = sessionStorage.getItem('username');
                $rootScope.userId = sessionStorage.getItem('uid');
                $rootScope.sex = sessionStorage.getItem('sex');
            } else {
                $rootScope.isLogined = false;
                $rootScope.username = '';
                $rootScope.userId = '';
                // $rootScope.email = '';
                $rootScope.sex = '';
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
        // $rootScope.socket = io.connect('http://gdutgirl.duapp.com');
        $rootScope.socket = io.connect('localhost:18080');
        $rootScope.socket.on('open', function() {
            $rootScope.isConnected = true;
            console.log('连接成功');
        });
        $rootScope.socket.on('msg', function(msg) {
            if (msg.receiver === sessionStorage.getItem('uid') || msg.sender === sessionStorage.getItem('uid')) {

                $scope.$apply(function() {
                    $rootScope.SystemMsg.push(msg);
                });
                if (msg.receiver === sessionStorage.getItem('uid')) {
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
                        $scope.user = data.user;
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
                        //路由状态跳转
                        $state.go('index');
                    }
                });
        };
    }
]);

//女生控制器
app.controller('FemaleCtrl', ['$scope', '$state', 'PutWishService', 'WishData', 'GetUserInfoService', 'UpdateInfoService',
    function($scope, $state, PutWishService, WishData, GetUserInfoService, UpdateInfoService) {

        if (sessionStorage.getItem('username')) {

            var data = {
                userId: sessionStorage.getItem('uid')
            };
            GetUserInfoService.getUserInfo(data)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.school_area = data.user.school_area;
                        $scope.college_name = data.user.college_name;
                        $scope.real_name = data.user.real_name;
                        $scope.long_tel = data.user.long_tel;
                        $scope.short_tel = data.user.short_tel;
                    }
                });

            $scope.setUserInfo = function() {

                //组装愿望数据包
                WishData.user = sessionStorage.getItem('uid');
                WishData.username = sessionStorage.getItem('username');
                WishData.wishType = $scope.wish_type;
                WishData.wish = $scope.wish;

                $state.go('user.writeinfo');

            };


            $scope.publicWish = function() {

                //组装个人信息数据包
                $scope.InfoData = {
                    user: sessionStorage.getItem('uid'),
                    real_name: $scope.real_name,
                    school_area: $scope.school_area,
                    college_name: $scope.college_name,
                    long_tel: $scope.long_tel,
                    short_tel: $scope.short_tel
                };
                WishData.school_area = $scope.school_area;
                console.log(WishData);
                //发布愿望
                PutWishService.putWish(WishData)
                    .success(function(data, status) {
                        if (status === 200) {
                            //更新个人信息
                            UpdateInfoService.updateInfo($scope.InfoData)
                                .success(function(data, status) {
                                    if (status === 200) {
                                        alert('许愿成功');
                                        $state.go('index');
                                    }
                                })
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
        console.log($rootScope.SystemMsg);
        $scope.clearMsg = function() {
            localStorage.removeItem('SystemMsg');
            $rootScope.SystemMsg = [];
        };
    }
]);

//用户联系控制器
app.controller('ContactCtrl', ['$scope', '$rootScope', '$stateParams',
    function($scope, $rootScope, $stateParams) {
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
app.controller('WishCtrl', ['$scope', '$state', '$stateParams', 'FindWishService', 'UpdateWishService',
    function($scope, $state, $stateParams, FindWishService, UpdateWishService) {
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

                if (confirm('确定领取该愿望?')) {
                    var data = {
                        type: 1,
                        wishId: $scope.wish._id,
                        wishPicker: sessionStorage.getItem('uid'),
                        wishPickerName: sessionStorage.getItem('username')
                    };

                    UpdateWishService.updateWishState(data)
                        .success(function(data, status) {
                            if (status === 200) {
                                alert('您的领取申请已经发送，请等待对方确认你的请求');
                                $state.go('index');
                            }
                        });

                }

            } else {
                $state.go('user.login');
            }
        };

        //修改愿望
        $scope.refreshWish = function(wish) {
            var data = {
                wishId: wish._id,
                wishType: wish.wishType,
                wish: wish.wish
            };
            UpdateWishService.updateWish(data)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('修改成功');
                        $state.go('index');
                    }
                });
        };
    }
]);

//女生愿望控制器
app.controller('FemaleWishCtrl', ['$scope', '$state', 'GetFemaleWishService', 'UpdateWishService',
    function($scope, $state, GetFemaleWishService, UpdateWishService) {
        $scope.UnpickWishes = [];
        $scope.PickedWishes = [];
        $scope.ApplyToPickWishes = [];
        $scope.CompletedWishes = [];
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
                            $scope.ApplyToPickWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 2) {
                            $scope.PickedWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 3) {
                            $scope.CompletedWishes.push(data.wishes[i]);
                        }
                    }
                }
            });

        //允许领取愿望
        $scope.allowPick = function(wish) {
            if (confirm('确定允许吗？')) {
                var data = {
                    type: 2,
                    wishId: wish._id,
                    wishPicker: wish.wishpicker,
                    wishPickerName: wish.wishpickername
                };
                UpdateWishService.updateWishState(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            alert('状态更新成功');
                            $state.go('wish.femalewish', {}, {
                                reload: true
                            });
                        }
                    });
            }
        };

        //拒绝领取愿望
        $scope.refusePick = function(wish) {
            var data = {
                type: 0,
                wishId: wish._id,
                wishPicker: '',
                wishPickerName: ''
            };
            UpdateWishService.updateWishState(data)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('状态更新成功');
                        $state.go('wish.femalewish', {}, {
                            reload: true
                        });
                    }
                });
        };

        //删除愿望
        $scope.deleteWish = function(wish) {
            if (confirm('确定要删除吗？')) {
                var data = {
                    wishId: wish._id
                };
                UpdateWishService.deleteWish(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            alert('删除成功');
                            $state.go('wish.femalewish', {}, {
                                reload: true
                            });
                        }
                    });
            }

        };

        //确认完成愿望
        $scope.completeWish = function(wish) {
            if (confirm('确定要完成吗？')) {
                var data = {
                    type: 3,
                    wishId: wish._id,
                    wishPicker: wish.wishpicker,
                    wishPickerName: wish.wishpickername
                };
                UpdateWishService.updateWishState(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            $state.go('wish.femalewish', {}, {
                                reload: true
                            });
                        }
                    });
            }
        };

    }
]);

//男生愿望控制器
app.controller('MaleWishCtrl', ['$scope', '$state', 'GetMaleWishService',
    function($scope, $state, GetMaleWishService) {
        $scope.ApplyToPickWishes = [];
        $scope.CompletedWishes = [];
        $scope.PickedWishes = [];
        var data = {
            pickerId: sessionStorage.getItem('uid')
        };
        GetMaleWishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    for (var i = 0; i < data.wishes.length; i++) {
                        if (data.wishes[i].ispicked === 1) {
                            $scope.ApplyToPickWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 2) {
                            $scope.PickedWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 3) {
                            $scope.CompletedWishes.push(data.wishes[i]);
                        }
                    }
                    $scope.wishes = data.wishes;
                }
            })
    }
]);