var nodemailer = require('nodemailer');

exports.sendMail = function(receiver, callback) {
    var transporter = nodemailer.createTransport({
        service: '163',
        auth: {
            user: 'gdutwishwall@163.com',
            pass: 'omxttfkjkdlbbdzl'
        }
    });

    var mailOptions = {
        from: 'gdutwishwall@163.com',
        to: receiver,
        subject: '【女生节许愿墙】消息通知',
        text: '你在许愿墙许下的愿望已被接受，请前往许愿墙查看。'
    };

    transporter.sendMail(mailOptions, callback);

};