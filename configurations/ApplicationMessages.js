var Message = {

    Error: {
        failedLogin: "You have entered wrong email or password.",
        failedAuthorization: "You are not authorized.",
        unique: "Email or username is not unique. Please try with different username or email.",
        notPermit: "You are not authorized to perform this action.",
        invalidOTP: "Please enter valid OTP code.",
        ExpiredOTP: "OTP has been expired.Please create a new OTP.",
        userRegister: "Your registration process is failed. Please try again.",
        alreadyRegistered: "Email is already registered with Weone.Please try again with another email.",
        incorrectEmail: "Email not found.",
        internalServer: "Something went wrong.",
        locked: "Your account is locked please contact support.",
        tokenVerify: "You have entered wrong token.",
        mobileNoChanged: "Mobile number change request failed. Please try again.",
        emailVerfiyError:"Your token is expired. Please try again",
        confirmPasswordNotMatch: "Your password doesn't match. Please try again.",
        unauthorize:"You are not authorized.",
        invalidvideoToken:"Your video uploading token has been expired",
        alreadyRegisteredPhoneNumber:"User is already registered,please try with a different number."
    },
    Success: {
        validOTP: "Your mobile number verification completed.",
        userRegister: "You have been registered as WeOne user.",
        otpSuccess: "Your OTP code is sent to your mobile number.",
        otpSuccess1:"Your OTP code is sent to your mobile number.",
        forgotPasswordLink: "A verification link is sent to your email. Please see email for details.",
        passwordUpdate: "You have successfully updated your password.",
        userLogout: "You have successfully logged out",
        mobileNoChanged: "Your mobile number has been updated.",
        loginSuccess: "Welcome to WeOne.",
        fileUpload: "Profile image is updated.",
        advertismentUpload:"Advertisement is uploaded.",
        advertismentUpdate:"Advertisement is updated.",
        userDelete: 'User is deleted.',
        userUpdate: 'You have successfully updated your profile.',
        emailVerfiySuccess:'Your WeOne account is activated successfully.',
        accountDeleted:"Your Account has been deleted successfully.",
        OTPCodeMessageStr1:"Your OTP code for WeOne is ",
        OTPCodeMessageStr2:" .Please use this to verify your mobile number.",
        UserAdv:"Advtersiments available for you are",
        UserNoAdv:"No advertisement is available for you.",
        UserNoAdvInPaggination:"No more advertisement is available for you.",
        sendInvitationMsgBody1:"Have you tried WeOne yet ? Install it from here ",
        sendInvitationMsgBody2:" and earn Money",
        sendInvitationSuccess:"Invitation to your friend sent successfully",
        clickAgain:"User clicked again",
        clicked:'User click on AD link',
        viewAgain:'User view again',
        viewed:'User start viewing',
        completeView:'user completed his view',
        completeviewAgain:'you already complete the view',
        NoNetworkTree:'Welcome to WeOne. It seems like your tree is empty.Please visit FAQs section to know how the user tree works.',
        userConatctList:'Contact List is uploaded successfully',
        userConatctListUpdated:'Conatct list updated successfully',
        userFriendsAdded : "user friends added successfully",
        userFriendsList: "You have following friends on Weone",
        applicationStatus:"Your application status change",
        homeScreenData:"HomeScreen data is as follows",
        rewardNotificationMessage:"Congratulations you have received new reward",
        newVideoToWatch:"Video yet to watch",
        accountDetailsUpdate:'Account details updated successfully',
        beneficiaryExport:'Beneficiary exports successfully',
        beneficiaryListAddSuccess:'Beneficiary List is imported successfully',
        transactionExport:'Transaction exports successfully',
        transactionImport:"Transaction excel sheet import succeessfully",
        minInvite:"Please invite atleast two people to connect to the network."
    }

}
module.exports.Message = Message
