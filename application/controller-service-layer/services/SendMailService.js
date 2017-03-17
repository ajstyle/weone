var BaseService = require('./BaseService');

SendMailService = function (app) {
	this.app = app;
};

SendMailService.prototype = new BaseService();
/*This service is used to send email link when user forget their password
@verificationToken:Token is embedded in the link
@email:email id where we sent the link
@username:name of the person embedded in the link
*/
SendMailService.prototype.forgetPasswordMail = function(next, verificationToken, email,username){
        var from =  'noreply@weoneapp.com';
        var subject = 'Reset Password';
				var link = ''
					link = configurationHolder.config.resetPasswordLink
        var text = 'Hello '+ username +' Click here ' +link+ '/' + verificationToken+'/'+username + '\n\n' +
          'to reset password.\n';
        configurationHolder.EmailUtil.email(from, email, subject, text);
        next(null,email);
}
/*This service is used to send verify email link.
@verificationToken:Token is embedded in the link
@email:email id where we sent the link
@username:name of the person embedded in the link
*/
SendMailService.prototype.verificationTokenMail=function(name,verificationToken,email){
    //Logger.info("control in the sent verificationTokenMail service");
     var from =  'noreply@weoneapp.com';
     var subject = 'Verify Email to active account';
    var link = ''
    link = configurationHolder.config.verifyPasswordLink;
        var text = 'Hello '+ name +' Click here ' +link+ '/' + verificationToken + '\n\n' +
          'to verify you account .\n';
        configurationHolder.EmailUtil.email(from, email, subject, text);
        //Logger.info("your verfication email is sent");
}

SendMailService.prototype.sendOTPForEmailUpdate=function(name,otp,email){
     var from =  'noreply@weoneapp.com';
     var subject = 'OTP for Email Update';
     var text = 'Hello '+ name +", \nYour One Time Password is: "+otp;
     configurationHolder.EmailUtil.email(from, email, subject, text);
     //Logger.info("The OTP mail is sent");
}

SendMailService.prototype.sendMailForSuspiciousActivity=function(name,email,data){
		 console.log("sending mail",name,email,data);
		 SendSMS.generalMessage(918826363799,"Suspicious Activity frm ph:"+data.phonenumber+"genuine,entered:"+data.originalAmount+","+data.amount+" v:"+data.voucherId);
     var from =  'noreply@weoneapp.com';
     var subject = 'Suspicious Activity Encountered';
     var text = 'Hello '+ name +", \nCase:Voucher Generation, user's phonenumber is: "+data.phonenumber+" and voucher id is: "+data.voucherId+" and amount tried:"+data.amount+" and original amount is"+data.originalAmount;
     configurationHolder.EmailUtil.email(from, email, subject, text);
     //Logger.info("The OTP mail is sent");
}
SendMailService.prototype.sendMailToCheckSmsCountryResponse=function(params,email){
     var from =  'noreply@weoneapp.com';
     var subject = 'sms country response';
     var text = 'Hello you are getting this response from sms country : \n\n'+params;
     configurationHolder.EmailUtil.email(from, email, subject, text);
     //Logger.info("The OTP mail is sent");
}

module.exports = function (app) {
	return new SendMailService(app);
};
