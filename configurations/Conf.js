//add Roles in the system
var roles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_DELEGATED_ADMIN', 'ROLE_CLIENT']

// Add different accessLevels
var accessLevels = {
    'client': ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_CLIENT'],
    'user': ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_DELEGATED_ADMIN'],
    'admin': ['ROLE_ADMIN'],
    'delegatedAdmin': ['ROLE_ADMIN', 'ROLE_DELEGATED_ADMIN']
}


var configVariables = function () {
     var localIP = 'http://192.168.2.25';
    switch (process.env.NODE_ENV) {
    case 'development':
        var config = {
            port: 3000,
            host: 'http://localhost:3000/',
            verificationUrl: 'http://localhost:3000/verify/',
            awsAccessKeyId: '',
            awsSecretAccessKey: '',
            bucketname: '',
            resetPasswordLink: 'http://localhost:3000/server/api/v1/password/reset',
            verifyPasswordLink: 'http://localhost:3000/server/api/v1/verify',
           // imageUrl: 'http://192.168.2.225:8595/',
             imageUrl: localIP +':8595/',
             videoUrl: localIP + ':8595/video/',
            /*  emailFrom:'deepteshverma@weoneapp.com',
              emailPassword:'Deepteshweone6',*/
            emailFrom: 'noreply@weoneapp.com',
            emailPassword: 'emailweone9',
            verificationEmailSubject: 'Welcome To Weone !',
            TWILIO_ACCOUNT_SID: '',
            TWILIO_AUTH_TOKEN: '',
            advertisementPath: '/opt/Weone/video/',
            //smile_URL: 'http://192.168.2.225:1935/vod/_definst_/',
              smile_URL: localIP+':1935/vod/_definst_/',
            smile_RTMP: 'rtmp://192.168.2.25:1935/vod/_definst_',
            //thumbnail_URL: 'http://192.168.2.225:8595/video/',
            thumbnail_URL: localIP+':8595/video/',
            androidapplink: 'bit.ly/2au484x',
            iosapplink: 'apple.co/1TseiCS',
            // androidapplink: "bit.ly/20mo3X2.",
            // iosapplink: 'apple.co/1TseiCS',
            googleGCMKey: 'AIzaSyDgUeyA52r4AFmATEBiVXZeZogCZIDWIqY',
            mqttUrl: 'tcp://localhost:1883',
            neo4jUrl: 'http://neo4j:weone@localhost:7474',
            chatImagePath: '/opt/Weone/chatimage',
            chatVideoPath: '/opt/Weone/chatvideo',
            apnsCertificate: "./WEONE_DEVELOPMENT_APNS_Certificates.p12",
            isApnsProduction: "false",
            gateWayApns: 'gateway.sandbox.push.apple.com',
            OTPExpiryTime: 21600000,
            excelFilePath:'/opt/Weone/excelfiles',
           // excelFileLink:"http://192.168.2.225:8595/excelfiles/"
             excelFileLink: localIP +':8595/excelfiles/',
             serverCssFileName:"http://localhost:8000/assets/serverAssests/reset.css",
            serverSideLogoPath:"http://localhost:8000/assets/serverAssests/images/logo.png",
            nginxPath:"http://localhost:8000/",
            redisConf: {
              host: '127.0.0.1', // The redis's server ip
              port: '6379'
              // pass: 'theredispass'
            },
            redisClusterConf: {
              host: '127.0.0.1', // The redis's server ip
              port: '6379'
            },
            cacheOptions:{
              cache: true,
              expires: 10800,
              prefix: 'weone'
            },
            serverStatus:false
        }
        config.roles = roles
        config.accessLevels = accessLevels
        return config;


    case 'staging':
        var config = {
            port: 3000,
            host: 'http://staging.weoneapp.com:3000/',
            verificationUrl: 'http://staging.weoneapp.com:3000/verify/',
            resetPasswordLink: 'http://staging.weoneapp.com:3000/api/v1/password/reset',
            verifyPasswordLink: 'http://staging.weoneapp.com:80/server/api/v1/verify',
            imageUrl: 'http://staging.weoneapp.com:2086/',
            videoUrl: 'http://staging.weoneapp.com:2086/video/',
            awsAccessKeyId: '',
            awsSecretAccessKey: '',
            bucketname: '',
            emailFrom: 'noreply@weoneapp.com',
            emailPassword: 'emailweone9',
            verificationEmailSubject: 'Welcome To Weone !',
            advertisementPath: '/opt/Weone/video/',
            smile_URL: 'http://staging.weoneapp.com:2052/vod/_definst_/',
            smile_RTMP: 'rtmp://staging.weoneapp.com:2052/vod/_definst_',
            thumbnail_URL: 'http://staging.weoneapp.com:2086/video/',
            googleGCMKey: 'AIzaSyDgUeyA52r4AFmATEBiVXZeZogCZIDWIqY',
            androidapplink: 'bit.ly/2au484x',
            iosapplink: 'apple.co/1TseiCS',
            mqttUrl: 'tcp://staging.weoneapp.com:1883',
            chatImagePath: '/opt/Weone/chatimage',
            chatVideoPath: '/opt/Weone/chatvideo',
            apnsCertificate: "./WEONE_DEVELOPMENT_APNS_Certificates.p12",
            isApnsProduction: "false",
            gateWayApns: 'gateway.sandbox.push.apple.com',
            /*apnsCertificate: "./WeOne_APNS_Production.p12",
            isApnsProduction: "true",
            gateWayApns: 'gateway.push.apple.com',*/
            neo4jUrl: 'http://neo4j:weone@localhost:7474',
            OTPExpiryTime: 21600000,
            excelFilePath: '/opt/Weone/excelfiles',
            excelFileLink: "http://staging.weoneapp.com:2086/excelfiles/",
            serverCssFileName: "http://staging.weoneapp.com:80/assets/serverAssests/reset.css",
            serverSideLogoPath: "http://staging.weoneapp.com:80/assets/serverAssests/images/logo.png",
            nginxPath:"http://staging.weoneapp.com:80/",
            redisConf: {
              host: '127.0.0.1', // The redis's server ip
              port: '6379'
              // pass: 'theredispass'
            },
            redisClusterConf: {
              host: '127.0.0.1', // The redis's server ip
              port: '6379'
            },
            cacheOptions:{
              cache: true,
              expires: 10800,
              prefix: 'weone'
            },
            serverStatus:false
        }
        config.roles = roles
        config.accessLevels = accessLevels
        return config;

        case 'production':
            var config = {
              port: 3000,
              host: 'http://api.weoneapp.com:3000/',
              //host: 'http://weone-prod-ext-elb-1068682743.ap-south-1.elb.amazonaws.com:3000',
              verificationUrl: 'http://api.weoneapp.com:80/verify/',
              //verificationUrl: 'http://weone-prod-ext-elb-1068682743.ap-south-1.elb.amazonaws.com:80/verify/',

              resetPasswordLink: 'http://api.weoneapp.com:80/server/api/v1/password/reset',
              //resetPasswordLink: 'http://weone-prod-ext-elb-1068682743.ap-south-1.elb.amazonaws.com:80/server/api/v1/password/reset',

              verifyPasswordLink: 'http://api.weoneapp.com:80/server/api/v1/verify',
              //verifyPasswordLink: 'http://weone-prod-ext-elb-1068682743.ap-south-1.elb.amazonaws.com:80/server/api/v1/verify',
              imageUrl: 'http://52.66.101.222:8595/',
              videoUrl: 'http://52.66.101.222:8595/video/',
              //imageUrl: 'http://10.10.90.203:8595/'
              awsAccessKeyId: '',
              awsSecretAccessKey: '',
              bucketname: '',
              emailFrom: 'noreply@weoneapp.com',
              emailPassword: 'emailweone9',
              verificationEmailSubject: 'Welcome To Weone !',
              advertisementPath: '/opt/Weone/video/',
               // smile_URL: 'http://api.weoneapp.com:1935/vod/_definst_/',
              smile_URL: 'http://52.66.101.222:1935/vod/_definst_/',
              //smile_RTMP: 'rtmp://api.weoneapp.com:1935/vod/_definst_',
              smile_RTMP: 'rtmp://52.66.101.222:1935/vod/_definst_',
              //  thumbnail_URL: 'http://api.weoneapp.com:8595/video/',
              thumbnail_URL: 'http://52.66.101.222:8595/video/',
              androidapplink: "bit.ly/2au484x",
              //iosapplink: 'goo.gl/Ywhhlf',
              // androidapplink: "bit.ly/20mo3X2.",
              iosapplink: 'apple.co/1TseiCS',
              googleGCMKey: 'AIzaSyDgUeyA52r4AFmATEBiVXZeZogCZIDWIqY',
              mqttUrl: 'tcp://chat.weoneapp.com:1883',
              //mqttUrl: 'tcp://api.weoneapp.com:1883',

              // neo4jUrl: 'http://neo4j:weone@api.weoneapp.com:7474',
              neo4jUrl: 'http://neo4j:weone@10.10.70.21:7474',

              chatImagePath: '/opt/Weone/chatimage',
              chatVideoPath: '/opt/Weone/chatvideo',
              excelFilePath: '/opt/Weone/excelfiles',
              apnsCertificate: "./WeOne_APNS_Production.p12",
              isApnsProduction: "true",
              gateWayApns: 'gateway.push.apple.com',
              OTPExpiryTime: 21600000,
              //excelFilePath: '/opt/Weone/excelfiles',
              //   excelFileLink: "http://api.weoneapp.com:8595/excelfiles/",
              excelFileLink: "http://52.66.101.222:8595/excelfiles/",

              serverCssFileName: "http://api.weoneapp.com:80/assets/serverAssests/reset.css",
              //serverCssFileName: "http://weone-prod-ext-elb-1068682743.ap-south-1.elb.amazonaws.com:80/assets/serverAssests/reset.css"
              serverSideLogoPath: "http://api.weoneapp.com:80/assets/serverAssests/images/logo.png",
              //serverSideLogoPath:'http://weone-prod-ext-elb-1068682743.ap-south-1.elb.amazonaws.com:80/assets/serverAssests/images/logo.png'
              nginxPath:"http://api.weoneapp.com:80/",
              redisConf: {
                //unclustered
                host:'rediscache-3gb-001.cdbzje.0001.aps1.cache.amazonaws.com',
                //clustered
                //host:'redis-3clusters.cdbzje.clustercfg.aps1.cache.amazonaws.com', // The redis's server ip
                port:'6379'
              },
              redisSlaveConf: {
                //unclustered
                host:'rediscache-3gb-002.cdbzje.0001.aps1.cache.amazonaws.com',
                //clustered
                //host:'redis-3clusters.cdbzje.clustercfg.aps1.cache.amazonaws.com', // The redis's server ip
                port:'6379'
              },
              cacheOptions: {
                cache: true,
                expires: 43200, //seconds
                prefix: 'weone'
              },
              serverStatus:false
        }

        config.roles = roles
        config.accessLevels = accessLevels
        return config;

    case 'test':
        var config = {
            port: 80,
            host: 'http://localhost:3000/',
            verificationUrl: 'http://localhost:3000/verify/',
            awsAccessKeyId: '',
            awsSecretAccessKey: '',
            bucketname: '',
            emailFrom: 'abhimanyu.singh@oodlestechnologies.com',
            emailPassword: '!abhimanyu@oodles',
            verificationEmailSubject: 'Welcome To OodlesStudio !'

        }

        config.roles = roles
        config.accessLevels = accessLevels
        return config;


    }
}


module.exports.configVariables = configVariables;
