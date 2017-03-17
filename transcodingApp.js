/*
Transcoding app by Weone backend team
*/
//{video_codec:'mpeg4',audio_codec:'libmp3lame',audio_bitrate:'4000k',video_bitrate:'4000k',height:'',width:'',name:'demo'}
global.configurationHolder = require('./configurations/DependencyInclude.js')
global.Transcodeapp = module.exports = express();
global.domain = require('./configurations/DomainInclude.js');
var chokidar = require('chokidar');
Logger.info("Transcoding app is run in %s mode", Transcodeapp.settings.env);
var requiredFormat = ['144px', '360px', '240px'];
//var requiredFormat = ['144px'];
var folderToConversion = [];
var transcodingStatus = true;
var WeOneLogo = __dirname + "/view/images/logo.png";
var watcher = chokidar.watch(configurationHolder.config.advertisementPath, {
    ignored: /[\/\\]\./,
    persistent: true,
    ignoreInitial: true
});
/*
The watcher will see the new folder in given directory and fire the event according to that.The folder id unique for the advertisement.
It will find the ad and send to other methods for video transcoding and change the status of app according to that.
*/
watcher.on('addDir', function (path) {
    Logger.info("added", path);
    var allPath = path.split('/');
    function recurisve() {
        var ad_entry_id = allPath[allPath.length - 1];
        domain.Advert.findOne({
            'fileInformation.entry_id': ad_entry_id
        }, function (err, obj) {
            if (obj) {
                if (obj.advert_type == 'Video') {
                    folderToConversion.push(ad_entry_id);
                    if (transcodingStatus == true) {
                        Logger.info(folderToConversion)
                        var advertisment_entry_id = folderToConversion.pop();
                        getStanderedFormatData(advertisment_entry_id);
                    }
                } else {
                    Logger.info("advertisement  is image  no need to conversion");
                    addLogoInImage(obj.fileInformation.entry_id,obj.fileInformation.fileName,obj.fileInformation.extensions_name,"original");
                    addLogoInImage(obj.fileInformation.entry_id,obj.thumbnail,"jpg","thumbnail");
                    if (obj.schedule.start_date <= new Date()) {
                        domain.Advert.findOneAndUpdate({
                            'fileInformation.entry_id': ad_entry_id,
                            deleted: false
                        }, {
                            advert_status: 'ready',
                        }, null, function (err, obj) {
                            Logger.info("advertisment is ready for advertise")
                        })
                    } else {
                        domain.Advert.findOneAndUpdate({
                            'fileInformation.entry_id': ad_entry_id,
                            deleted: false
                        }, {
                            advert_status: 'schedule',
                        }, null, function (err, obj) {
                            Logger.info("advertisment is schedule for advertise")
                        })
                    }
                }
            } else
                recurisve();
        });
    }
    recurisve();
});
/*
This method is used to add the WeOne logo in the image or video.It will find the all ad_dimension and set the logo according to the size of the image or video.
@entry_id:ad unique id @fileName:name of the advertisement @type:extension type of advert @logo it is used to define the type of logo
*/
var addLogoInImage = function (entry_id, fileName, type,logo) {
    Logger.info(entry_id,"control in the add logo in image",type,fileName);
    ffmpeg.ffprobe(configurationHolder.config.advertisementPath + entry_id + "/" + fileName, function (err, metadata) {
        for (var i = 0; i < metadata.streams.length; i++) {
            if (metadata.streams[i].width != undefined) {
              widthOfVideo = metadata.streams[i].width + Math.abs(metadata.streams[i].width % 2);
              heightOfvideo = metadata.streams[i].height + Math.abs(metadata.streams[i].height % 2);
            }
        }
        Logger.info("width of image*", widthOfImage);
        var weOneLogoAfterImage = configurationHolder.config.advertisementPath + entry_id + "/" + entry_id + logo+".png";
        ffmpeg(WeOneLogo).addOption('-vf scale=' + widthOfImage + '*0.15:-1').saveToFile(weOneLogoAfterImage).on('error', function (err) {
            Logger.info("error in creating logo image");
            Logger.info(err);
        }).on('end', function () {
            Logger.info("logoimage is added");
            ffmpeg(configurationHolder.config.advertisementPath + entry_id + "/" + fileName).addOption('-vf', 'movie=' + weOneLogoAfterImage + ' [watermark]; [in] [watermark] overlay=main_w-overlay_w-10:10 [out]').saveToFile(configurationHolder.config.advertisementPath + entry_id + "/" + fileName).on('error', function (err) {
                Logger.info("error", err)
            });
        });
    });
}
/*
This method provides the standered format of data for transcoding ie 144px,256px,320px
@advertisment_entry_id:unique of entry id
*/
var getStanderedFormatData = function (advertisment_entry_id) {
        //it will change status
        transcodingStatus = false;
        Logger.info("control in the get standered format" + requiredFormat);
        domain.Transcoding_Flavour.find({
            name: {
                $in: requiredFormat
            },
            deleted: false
        }, function (err, obj) {
            Logger.info("standerdFormat", obj.length);
            convertVideoFormat(obj, advertisment_entry_id);
        });
    }
/*This method will be used to transcode the advert into different flavours like 144px,256px,320px and set the resolution,width,height etc.
it will also store the transcoding version into the advertisements.
@formatData:it will contains the different formating information
@advertisement_entry_id:unique advertisement id
*/
var convertVideoFormat = function (formatData, advertisment_entry_id) {
    Logger.info("control in the convert video format", advertisment_entry_id);
    async.each(formatData, function (data, callback) {
        var transcodingProfile = {};
        transcodingProfile.transcoding_flavour_id = new Date().getTime() + Math.floor(Math.random() * 10000);
        transcodingProfile.meta_data = data;
        transcodingProfile.transcoding_flavour_name = transcodingProfile.transcoding_flavour_id + '_' + data.name + '.mp4';
        transcodingProfile.flavour_id = data._id;
        transcodingProfile.advertisment_entry_id = advertisment_entry_id;
        var transcoding_profiles = new domain.Transcoding_Profile(transcodingProfile);
        transcoding_profiles.save(function (err, transcodingProfileSaveObject) {
            Logger.info("transcoding object saved");
        });

        function recurisve() {
            domain.Advert.findOne({
                'fileInformation.entry_id': advertisment_entry_id,
                deleted: false
            }, function (err, advertisementObject) {
                if (advertisementObject) {
                    Logger.info("advertsimentObject find");
                    var widthOfVideo = '';
                    var WeOneLogoAfterVideo = configurationHolder.config.advertisementPath + advertisment_entry_id + "/" + transcodingProfile.transcoding_flavour_id + "_logo.png"
                    ffmpeg.ffprobe(configurationHolder.config.advertisementPath + advertisment_entry_id + "/" + advertisementObject.fileInformation.fileName, function (err, metadata) {
                        for (var i = 0; i < metadata.streams.length; i++) {
                            Logger.info("loop" + metadata.streams[i].width);
                            if (metadata.streams[i].width != undefined) {
                              widthOfVideo = metadata.streams[i].width + Math.abs(metadata.streams[i].width % 2);
                              heightOfvideo = metadata.streams[i].height + Math.abs(metadata.streams[i].height % 2);
                            }
                        }
                        Logger.info("widthOfVideo is", widthOfVideo);
                        ffmpeg(WeOneLogo).addOption('-vf scale=' + widthOfVideo + '*0.15:-1').saveToFile(WeOneLogoAfterVideo).on('error', function (err) {
                            Logger.info(err);

                        }).on('end', function () {
                            Logger.info("logoimage is created");
                            ffmpeg(configurationHolder.config.advertisementPath + advertisment_entry_id + "/" + advertisementObject.fileInformation.fileName).fps(25).size(data.height + 'x' + data.width).videoCodec(data.video_codec).addOption('-strict', 'experimental').addOption('-s',data.height+'x'+data.width).addOption('-vf', 'movie=' + WeOneLogoAfterVideo + ' [watermark]; [in] [watermark] overlay=main_w-overlay_w-10:10 [out]').videoBitrate(data.video_bitrate).audioCodec(data.audio_codec).audioBitrate(data.audio_bitrate).on('error', function (err) {
                                Logger.info('error in video transcoding', transcodingProfile.transcoding_flavour_name);
                                Logger.info(err);
                            }).on('end', function () {
                                file.chmod(configurationHolder.config.advertisementPath + advertisment_entry_id + "/" + transcodingProfile.transcoding_flavour_name, 0777);
                                Logger.info(' transcdoing processing is finished');
                                domain.Transcoding_Profile.findOneAndUpdate({
                                    transcoding_flavour_id: transcodingProfile.transcoding_flavour_id,
                                    deleted: false
                                }, {
                                    transcoding_status: 'transcoded'
                                }, null, function (err, oldObject) {
                                    Logger.info("transcoding status changed", oldObject._id);
                                    domain.Advert.findOneAndUpdate({
                                        'fileInformation.entry_id': advertisment_entry_id,
                                        deleted: false
                                    }, {
                                        $push: {
                                            advert_flavor_available: oldObject._id
                                        }
                                    }, null, function (err, object) {
                                        Logger.info("flavour is added in advertisment");
                                        callback();
                                    });
                                })
                            }).save(configurationHolder.config.advertisementPath + advertisment_entry_id + "/" + transcodingProfile.transcoding_flavour_name);
                        })
                    });
                } else {
                    Logger.info("No advertisement object found error is somewhere");
                    recurisve();
                }
            });
        }
        recurisve();
    }, function (err) {
        changetheStatusOfAdvertisement(err, advertisment_entry_id);
    });
}
/*
This function is used to change the status of advertisement after the video transcoding and also generate the SMIL file with different
flavour and SMIL is used for vide streaming with different flavours.
*/
var changetheStatusOfAdvertisement = function (err, advertisment_entry_id) {
    Logger.info("folder are remaining to transcode", folderToConversion.length);
    if (folderToConversion.length != 0) {
        var advertisment_entry_id1 = folderToConversion.pop();
        getStanderedFormatData(advertisment_entry_id1);
    } else {
        transcodingStatus = true;
    }
    if (err)
        Logger.info("error is occure in async call")
    else {
        Logger.info("control successfully executed")
        domain.Advert.findOne({
            'fileInformation.entry_id': advertisment_entry_id,
            deleted: false
        }).populate('advert_flavor_available').exec(function (err, advertObj) {
            var totalnoflavour = advertObj.advert_flavor_available.length;
            var smilefile = "<?xml version='1.0' encoding='UTF-8'?><smil><head><meta base='" + configurationHolder.config.smile_RTMP + "'/></head><body><switch>";
            for (var i = 0; i <totalnoflavour; i++) {
                smilefile = smilefile + "<video src='" + advertObj.advert_flavor_available[i].transcoding_flavour_name + "'><param name='videoBitrate' value='" + advertObj.advert_flavor_available[i].meta_data.video_bitrate.substring(0, advertObj.advert_flavor_available[i].meta_data.video_bitrate.length - 1) + "000' valuetype='data'></param></video>";
            }
            smilefile = smilefile + "</switch></body></smil>";
            var smil_file_name = advertObj.fileInformation.entry_id + ".smil";
            file.writeFile(configurationHolder.config.advertisementPath + advertObj.fileInformation.entry_id + "/" + smil_file_name, smilefile, function (err) {
                if (err) {
                    Logger.info("error in create smil file");
                    Logger.info(err);
                } else {
                    file.chmod(configurationHolder.config.advertisementPath + advertObj.fileInformation.entry_id + "/" + smil_file_name, 0777);
                    Logger.info("smil file created successfully");
                    if (advertObj.schedule.start_date <= new Date()) {
                        domain.Advert.findOneAndUpdate({
                            'fileInformation.entry_id': advertisment_entry_id,
                            deleted: false
                        }, {
                            advert_status: 'ready',
                            smil_file_name: smil_file_name
                        }, null, function (err, obj) {
                            Logger.info("advertisment is ready for advertise")
                        })
                    } else {
                        domain.Advert.findOneAndUpdate({
                            'fileInformation.entry_id': advertisment_entry_id,
                            deleted: false
                        }, {
                            advert_status: 'schedule',
                            smil_file_name: smil_file_name
                        }, null, function (err, obj) {
                            Logger.info("advertisment is schedule in to different flavour")
                        })
                    };
                }
            });
        });
    }
}

Transcodeapp.listen(3001);

