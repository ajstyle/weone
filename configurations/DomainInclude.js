global.domain = {}

//domain.Address = require("../application/models/Address.js");
domain.User = require("../application/models/User.js");
domain.User_Phonebook_History = require("../application/models/User_Phonebook_History.js");
domain.Authentication_Token = require("../application/models/Authentication_Token.js");
domain.Verification_Token = require("../application/models/Verification_Token.js");
domain.Registration_Token = require("../application/models/Registration_Token.js");
domain.Account_Transaction_Bucket = require("../application/models/Account_Transaction_Bucket.js");
domain.Ad_View_History = require("../application/models/Adv_View_History.js");
domain.Ad_Click_History = require("../application/models/Adv_Click_History.js");
domain.Advert = require("../application/models/Advert.js");
domain.Chat_Bucket = require("../application/models/Chat_Bucket.js");
domain.Chat_Channel = require("../application/models/Chat_Channel.js");
domain.Chat_History = require("../application/models/Chat_History.js");
domain.Master_Reward = require("../application/models/Master_Reward.js");
domain.MLM = require("../application/models/MLM.js");
domain.User_Earning_Bucket = require("../application/models/User_Earning_PerDay.js");
domain.Admin_Account_Detail = require("../application/models/Admin_Account_Detail.js");
domain.SMS_OTP = require("../application/models/SMS_OTP.js");
domain.Transcoding_Profile = require("../application/models/Transcoding_Pofile.js");
domain.Transcoding_Flavour = require("../application/models/Transcoding_Flavour.js");
domain.Video_Upload_Token = require("../application/models/Video_Upload_Token.js");
domain.Like_History = require("../application/models/Like_Histroy.js");
domain.Comment_History = require("../application/models/Comment_History.js");
domain.User_Network_details = require("../application/models/User_Network_details.js");
domain.Client_Charge_Per_Day = require('../application/models/Client_Charge_PerDay.js');
domain.Notification_History = require('../application/models/Notification_History.js');
domain.User_Account_Details = require('../application/models/User_Account_Details.js');
domain.Excel_History = require('../application/models/Excel_History.js');
domain.DeleteRequests = require('../application/models/DeleteRequests.js');
domain.Contact_Us = require('../application/models/Contact_Us.js');
domain.UserRequests = require('../application/models/UserRequests.js');
domain.MLMv2 = require('../application/models/MLMv2.js');
domain.Voucher = require('../application/models/Voucher.js');
domain.User_Network_Detailsv2 = require('../application/models/User_Network_Detailsv2.js');
domain.Admin_Earning_Details = require('../application/models/AdminEarningDetails.js');
domain.Admin_Earning_Bucket = require('../application/models/Admin_Earning_PerDay.js');
domain.User_Network_Tree = require('../application/models/User_Network_Tree.js');
domain.Sequence = require('../application/models/Sequence.js');
domain.MLMv3 = require('../application/models/MLMv3.js');
domain.User_Device_Details = require("../application/models/User_Device_Details.js");
domain.Pincode = require("../application/models/Pincode.js");
domain.App_Version_Details = require("../application/models/App_Version_Details.js");

//weone-advertiser module models
domain.Advertiser = require("../application/models/Advertiser.js");
domain.Activity = require("../application/models/Activity.js");
domain.Activity_Price = require("../application/models/Activity_Price.js");

module.exports = domain
