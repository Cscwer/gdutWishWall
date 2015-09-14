//主页控制器
app.controller('IndexCtrl', ['$scope', 'GetUnpickedWish',
    function($scope, GetUnpickedWish) {

        //愿望列表
        $scope.wishes = [];

        //获取在主页显示的愿望
        // GetUnpickedWish.getWishes()
        //     .success(function(data) {
        //         $scope.wishes = data.wishes;
        //     });

        //加载下一页的内容，只有登录的人才能查看
        $scope.page = 1; //当前页数
        $scope.per_page = 5; //每页显示数目
        $scope.isLoading = false;
        $scope.nextpage = function(page, per_page) {
            $scope.isLoading = true;
            GetUnpickedWish.getWishes(page, per_page)
                .success(function(data, status) {
                    if (status === 200) {
                        // alert(data.wishes.length);
                        for (var i = 0; i < data.wishes.length; i++) {
                            $scope.wishes.push(data.wishes[i]);
                        }
                        $scope.page++;
                        $scope.isLoading = false;
                    }
                });
        };

        $scope.nextpage(1, 5);


    }
]);

//导航栏控制器
app.controller('HeaderCtrl', ['$scope', '$rootScope', '$state', '$location', '$http', 'MsgService', 'WeChatService',

    function($scope, $rootScope, $state, $location, $http, MsgService, WeChatService) {


        //获取微信用户信息
        var code = $location.search().code;
        WeChatService.getWeChatInfo(code)
            .success(function(data, status) {
                if (status === 200) {
                    if (!data.errmsg) {
                        $rootScope.user = data.data;
                        sessionStorage.setItem('uid', $rootScope.user._id);
                        sessionStorage.setItem('username', $rootScope.user.nickname);
                    } else {
                        $rootScope.user = null;
                        // alert("登录出错");
                    }
                }
            });

        //登录保护
        $rootScope.$on('$stateChangeStart', function(event, toState) {

            if ($rootScope.user === null) {
                event.preventDefault();
                $state.go('index');
            }

        });

        //系统消息队列
        $rootScope.SystemMsg = [];

        //基于 socket.io 的消息推送
        $scope.hasNewMsg = false;
        $rootScope.isConnected = false;
        $rootScope.socket = io.connect('http://gdutgirl.duapp.com');
        $rootScope.socket.on('open', function() {
            $rootScope.isConnected = true;
            console.log('连接成功');
        });


        $rootScope.socket.on('Msg_res', function(msg) {
            console.log(msg);
            //处理系统消息
            if (msg.receiver === sessionStorage.getItem('uid')) {
                $scope.$apply(function() {
                    $scope.hasNewMsg = true;
                });
            }
        });

        //检查有无未阅读的消息
        // if (sessionStorage.getItem('uid')) {
        var msgData = {
            userId: sessionStorage.getItem('uid')
        };
        MsgService.getMsg(msgData)
            .success(function(data, status) {
                if (status === 200) {
                    console.log(data);
                    for (var i = 0; i < data.msgs.length; i++) {
                        if (data.msgs[i].hadread === 0) {
                            // $scope.$apply(function() {
                            $scope.hasNewMsg = true;
                            // });
                        }
                    }
                }
            });
        // }


        $scope.cancelMsgCount = function() {
            $scope.hasNewMsg = false;
            MsgService.readMsg(sessionStorage.getItem('uid'))
                .success(function(data, status) {
                    if (status === 200) {
                        console.log("清楚消息");
                    }
                });
        };

    }
]);

//用户信息控制器
app.controller('UserInfoCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'GetUserInfoService',
    function($scope, $rootScope, $state, $stateParams, GetUserInfoService) {
        $scope.isSelf = ($stateParams.userId === sessionStorage.getItem('uid'))
        var data = {
            userId: $stateParams.userId
            // userId: sessionStorage.getItem('uid')
        };
        GetUserInfoService.getUserInfo(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.user = data.user;
                }
            });
    }
]);


//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'PutWishService', 'WishData', 'GetUserInfoService', 'UpdateInfoService', 'UpdateWishService', 'WeChatService',
    function($scope, $rootScope, $state, $stateParams, PutWishService, WishData, GetUserInfoService, UpdateInfoService, UpdateWishService, WeChatService) {

        $scope.isRewrite = $stateParams.rewrite;

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


        // JS_Api 初始化函数
        $scope.apiConfig = function(signature) {
            wx.config({
                debug: true,
                appId: signature.appId,
                timestamp: signature.timestamp_ticket,
                nonceStr: signature.noncestr,
                signature: signature.signature,
                jsApiList: ['chooseImage']
            });
            wx.error(function(res) {
                // alert(res);
            });
        };

        //获取微信 AccessToken 以及 ApiTicket (女生才需要)
            WeChatService.getAccessToken(data)
                .success(function(data, status) {
                    if (status === 200) {
                        var token = data.token.token;
                        WeChatService.getApiTicket(token)
                            .success(function(data, status) {
                                if (status === 200) {
                                    //获取 Signature
                                    $scope.signature = data;
                                    $scope.apiConfig($scope.signature);
                                }
                            });
                    }
                });

        $scope.imgSrc = [];
        $scope.chooseImage = function() {
            wx.chooseImage({
                count: 9,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: function(res) {
                    $scope.imgSrc = res.localIds;
                    alert($scope.imgSrc.length);
                }
            });
        };



        $scope.setUserInfo = function() {

            //组装愿望数据包
            WishData.user = sessionStorage.getItem('uid');
            WishData.username = sessionStorage.getItem('username');
            WishData.wishType = $scope.wish_type;
            WishData.wish = $scope.wish;

            $state.go('user.writeinfo');



        };

        //发布愿望
        $scope.publicWish = function() {

            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };
            WishData.school_area = $scope.school_area;
            //发布愿望
            PutWishService.putWish(WishData)
                .success(function(data, status) {
                    if (status === 200) {
                        //更新个人信息
                        UpdateInfoService.updateInfo(InfoData)
                            .success(function(data, status) {
                                if (status === 200) {
                                    alert('许愿成功');
                                    $state.go('index');
                                }
                            });
                    }
                });

        };

        //领取愿望动作
        $scope.pickWish = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };

            // if (confirm('确定领取该愿望?')) {
            var data = {
                type: 1,
                wishId: WishData._id,
                wishPicker: sessionStorage.getItem('uid'),
                wishPickerName: sessionStorage.getItem('username')
            };
            UpdateWishService.updateWishState(data)
                .success(function(data, status) {
                    if (status === 200) {
                        //更新个人信息
                        UpdateInfoService.updateInfo(InfoData)
                            .success(function(data, status) {
                                if (status === 200) {
                                    var msg = {
                                        msg_type: 'System',
                                        sender: sessionStorage.getItem('uid'),
                                        sender_name: sessionStorage.getItem('username'),
                                        receiver: WishData.user,
                                        receiver_name: WishData.username,
                                        msg: '领取了你的愿望'
                                    };
                                    $rootScope.socket.emit('Msg', msg);
                                    alert('领取成功！');
                                    $state.go('wish.malewish');
                                }
                            });
                    }
                });
            // }
        };

        //修改个人信息
        $scope.rewrite = function() {
            //组装个人信息数据包
            var InfoData = {
                user: sessionStorage.getItem('uid'),
                real_name: $scope.real_name,
                school_area: $scope.school_area,
                college_name: $scope.college_name,
                long_tel: $scope.long_tel,
                short_tel: $scope.short_tel
            };

            //更新个人信息
            UpdateInfoService.updateInfo(InfoData)
                .success(function(data, status) {
                    if (status === 200) {
                        alert('修改成功');
                        $state.go('user.info', {
                            userId: InfoData.user
                        });
                    }
                });


        };



    }
]);

//消息控制器
app.controller('MsgCtrl', ['$scope', '$rootScope', '$state', 'MsgService',
    function($scope, $rootScope, $state, MsgService) {
        $scope.SystemMsg = [];
        $scope.UserMsg = [];
        var data = {
            userId: $rootScope.user._id
        };
        MsgService.getMsg(data)
            .success(function(data, status) {
                if (status === 200) {
                    console.log(data.msgs);
                    for (var i = 0; i < data.msgs.length; i++) {
                        if (data.msgs[i].msg_type === 'System') {
                            $scope.SystemMsg.push(data.msgs[i]);
                        }
                        if (data.msgs[i].msg_type === 'User') {
                            $scope.UserMsg.push(data.msgs[i]);
                        }
                    }
                }
            });
    }
]);

//用户联系控制器
app.controller('ContactCtrl', ['$scope', '$rootScope', '$stateParams', 'ContactService',
    function($scope, $rootScope, $stateParams, ContactService) {
        $scope.thisUser = $rootScope.user._id;
        $scope.thatUser = $stateParams.userId;
        var contact = {
            this: sessionStorage.getItem('uid'),
            that: $stateParams.userId
        };
        var updateContact = function() {

            ContactService.getContact(contact)
                .success(function(data, status) {
                    if (status === 200) {
                        $scope.contacts = data.contacts;
                        console.log(data.contacts);
                    }
                });
        };

        updateContact();
        $rootScope.socket.on('Msg_res', function(msg) {
            updateContact();
        });
        $scope.sendMsg = function() {
            var msg = {
                msg_type: 'User',
                msg: $scope.contact_msg,
                receiver: $stateParams.userId,
                receiver_name: $stateParams.username,
                sender: sessionStorage.getItem('uid'),
                sender_name: sessionStorage.getItem('username')
            };
            $scope.contact_msg = '';
            $rootScope.socket.emit('Msg', msg);
            $rootScope.socket.on('Msg_res', function(msg) {
                updateContact();
            });
        };
    }
]);


//愿望控制器
app.controller('WishCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'FindWishService', 'UpdateWishService', 'WishData',
    function($scope, $rootScope, $state, $stateParams, FindWishService, UpdateWishService, WishData) {

        //获取指定愿望的信息
        var data = {
            wishId: $stateParams.wishId
        };
        FindWishService.findWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    $scope.wish = data.wish;
                    WishData._id = data.wish._id;
                    WishData.user = data.wish.user;
                    WishData.username = data.wish.username;
                }
            });



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
                        $state.go('wish.femalewish');
                    }
                });
        };
    }
]);

//女生愿望控制器
app.controller('FemaleWishCtrl', ['$scope', '$rootScope', '$state', 'GetFemaleWishService', 'UpdateWishService', 'MsgService',
    function($scope, $rootScope, $state, GetFemaleWishService, UpdateWishService, MsgService) {
        $scope.UnpickWishes = [];
        $scope.PickedWishes = [];
        // $scope.ApplyToPickWishes = [];
        $scope.CompletedWishes = [];
        //获取女生自己的愿望
        var data = {
            userId: sessionStorage.getItem('uid')
        };
        GetFemaleWishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    console.log(data.wishes);
                    //筛选出已被领取和未被领取的愿望
                    for (var i = 0; i < data.wishes.length; i++) {
                        if (data.wishes[i].ispicked === 0) {
                            $scope.UnpickWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 1) {
                            $scope.PickedWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 2) {
                            $scope.CompletedWishes.push(data.wishes[i]);
                        }
                        // if (data.wishes[i].ispicked === 3) {
                        //     $scope.CompletedWishes.push(data.wishes[i]);
                        // }
                    }
                }
            });

        //允许领取愿望
        // $scope.allowPick = function(wish) {
        //     if (confirm('确定允许吗？')) {
        //         var data = {
        //             type: 2,
        //             wishId: wish._id,
        //             wishPicker: wish.wishpicker,
        //             wishPickerName: wish.wishpickername
        //         };
        //         var msg = {
        //             msg_type: 'System',
        //             sender: sessionStorage.getItem('uid'),
        //             sender_name: sessionStorage.getItem('username'),
        //             receiver: wish.wishpicker,
        //             receiver_name: wish.wishpickername,
        //             msg: '接受了你的领取请求，请及时处理'
        //             // time: new Date()
        //         };
        //         UpdateWishService.updateWishState(data)
        //             .success(function(data, status) {
        //                 if (status === 200) {
        //                     $rootScope.socket.emit('Msg', msg);
        //                     alert('状态更新成功');
        //                     $state.go('wish.femalewish', {}, {
        //                         reload: true
        //                     });
        //                 }
        //             });
        //     }
        // };

        //拒绝领取愿望
        // $scope.refusePick = function(wish) {
        //     var data = {
        //         type: 0,
        //         wishId: wish._id,
        //         wishPicker: '',
        //         wishPickerName: ''
        //     };
        //     var msg = {
        //         msg_type: 'System',
        //         sender: sessionStorage.getItem('uid'),
        //         sender_name: sessionStorage.getItem('username'),
        //         receiver: wish.wishpicker,
        //         receiver_name: wish.wishpickername,
        //         msg: '拒绝了你的领取请求'
        //         // time: new Date()
        //     };
        //     UpdateWishService.updateWishState(data)
        //         .success(function(data, status) {
        //             if (status === 200) {
        //                 $rootScope.socket.emit('Msg', msg);
        //                 alert('状态更新成功');
        //                 $state.go('wish.femalewish', {}, {
        //                     reload: true
        //                 });
        //             }
        //         });
        // };

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
                    type: 2,
                    wishId: wish._id,
                    wishPicker: wish.wishpicker,
                    wishPickerName: wish.wishpickername
                };
                var msg = {
                    msg_type: 'System',
                    sender: sessionStorage.getItem('uid'),
                    sender_name: sessionStorage.getItem('username'),
                    receiver: wish.wishpicker,
                    receiver_name: wish.wishpickername,
                    msg: '确认完成了你领取的愿望'
                };
                UpdateWishService.updateWishState(data)
                    .success(function(data, status) {
                        if (status === 200) {
                            $rootScope.socket.emit('Msg', msg);
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
        // $scope.ApplyToPickWishes = [];
        $scope.CompletedWishes = [];
        $scope.PickedWishes = [];
        var data = {
            pickerId: sessionStorage.getItem('uid')
        };
        GetMaleWishService.getWish(data)
            .success(function(data, status) {
                if (status === 200) {
                    for (var i = 0; i < data.wishes.length; i++) {
                        // if (data.wishes[i].ispicked === 1) {
                        //     $scope.ApplyToPickWishes.push(data.wishes[i]);
                        // }
                        if (data.wishes[i].ispicked === 1) {
                            $scope.PickedWishes.push(data.wishes[i]);
                        }
                        if (data.wishes[i].ispicked === 2) {
                            $scope.CompletedWishes.push(data.wishes[i]);
                        }
                    }
                    $scope.wishes = data.wishes;
                }
            })
    }
]);