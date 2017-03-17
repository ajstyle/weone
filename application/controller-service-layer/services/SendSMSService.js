/*
 * @author Parveen yadav
 * This service responsible for sending SMS for both first time user registration and in case of sending invite using SMSCountry.
 *
 */
var Client = require('node-rest-client').Client;
var client = new Client();
SendSMS = function () {

SendSMS.sendOTPService= function (desMobilenumber,OTP) {
var messageBody = configurationHolder.Message.Success.OTPCodeMessageStr1 +OTP +configurationHolder.Message.Success.OTPCodeMessageStr2;
   Logger.info("sendOTPService body is...",messageBody);

    client.get("http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=deepteshverma&passwd=Deepteshweone6&mobilenumber="+desMobilenumber+"&"+"message="+messageBody+"&"+"sid=SMSCountry&mtype=N&DR=Y", "GET", function (data, response) {
	// parsed response body as js object

	// raw response
	//Logger.info("raw response data...",response);
});
}

SendSMS.generalMessage= function (desMobilenumber,message) {
var messageBody = message;
   Logger.info("sendOTPService body is...",messageBody);

    client.get("http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=deepteshverma&passwd=Deepteshweone6&mobilenumber="+desMobilenumber+"&"+"message="+messageBody+"&"+"sid=SMSCountry&mtype=N&DR=Y", "GET", function (data, response) {
	// parsed response body as js object

	// raw response
	//Logger.info("raw response data...",response);
});
}

SendSMS.sendInvitationService=function(desMobilenumber,messageBody){
     Logger.info("SendMulitpleSMS message body is...",messageBody);
    client.get("http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=deepteshverma&passwd=Deepteshweone6&mobilenumber="+desMobilenumber+"&"+"message="+messageBody+"&"+"sid=SMSCountry&mtype=N&DR=Y", "GET", function (data, response) {
	// parsed response body as js object
	//Logger.info("parsed response data..",data);
});
}
};

SendSMS.send_otp= function (desMobilenumber,OTP) {
var messageBody = configurationHolder.Message.Success.OTPCodeMessageStr1 +OTP +configurationHolder.Message.Success.OTPCodeMessageStr2;
   Logger.info("sendOTPService body is...",messageBody);

    client.get("http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=deepteshverma&passwd=Deepteshweone6&mobilenumber="+desMobilenumber+"&"+"message="+messageBody+"&"+"sid=SMSCountry&mtype=N&DR=Y", "GET", function (data, response) {
	    //  Logger.info("the response is",data,response);
});
}

module.exports=SendSMS;
