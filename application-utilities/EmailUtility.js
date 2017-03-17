var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: configurationHolder.config.emailFrom,
        pass: configurationHolder.config.emailPassword
    }
});

module.exports.email = function (fromEmail, toEmail, subject, emailBody) {
    transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: subject,
        text: emailBody
    })
}