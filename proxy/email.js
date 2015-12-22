var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: '424432317@qq.com',
        pass: 'tbbjxodmlcepbiei'
        // hzrbwvoapzqybggd
    }
});

exports.sendMail = function(receiver, callback) {

    var mailOptions = {
        from: '424432317@qq.com',
        to: receiver,
        subject: '【女生节许愿墙】消息通知',
        text: '你在许愿墙许下的愿望已被接受，请前往许愿墙查看。意见或者反馈可以直接回复此邮件。'
    };

    transporter.sendMail(mailOptions, callback);

};

exports.completeWishMail = function(receiver, sendername, callback) {
        var mailOptions = {
            from: '424432317@qq.com',
            to: receiver,
            subject: '【女生节许愿墙】消息通知',
            text: '你接受的 ' + sendername + ' 的愿望已被对方确认完成，请前往许愿墙查看。意见或者反馈可以直接回复此邮件。'
        };
        transporter.sendMail(mailOptions, callback);
};

exports.loverMatchEmail = function(receiver, callback) {
    var mailOptions = {
        from: '424432317@qq.com',
        to: receiver,
        subject: '【女生节许愿墙】消息通知',
        text: '暗恋匹配成功！快去虐狗吧！请叫我们雷锋。意见或者反馈可以直接回复此邮件。'
    };
    transporter.sendMail(mailOptions, callback);
};