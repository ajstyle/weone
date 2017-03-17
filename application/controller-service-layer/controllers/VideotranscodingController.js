/* @author Himanshu Goyal
This is just only for testing purpose the main code not use it
*/
module.exports = function () {
        //  var im = require('imagemagick');
        //var ffmpeg = require('ffmpeg');
        /* var gm = require('gm').subClass({
             imageMagick: true
         });*/

        var videoConvert = function (req, res, callback) {
            //Logger.info("control in the video convert");
            /*var serverpath1 = '/opt/Weone/test2.mp4'
            var serverpath2 = '/opt/Weone/1457951936428.png' //1457951936428.mp4'
            var serverpath4 = '/opt/Weone/log.jpg'
            var serverpath3 = '/opt/Weone/1457949716736.jpg'
            var destPath = '/opt/Weone/convertvideo';
            var logo = publicdir + "/view/images/logo.png";
            var widthOfVideo = '';
            var heightOfvideo = '';*/
            /*var parseXlsx = require('excel');

            parseXlsx(publicdir + '/AMAZING SBI BULK INTER BANK TRANSACTION (RTGS-NEFT) UPLOAD FORMAT.xlsx', function (err, data) {
                if (err)
                    //Logger.info("error", err);

                //Logger.info("data", data);
            });*/
         /*   var Excel = require('exceljs');
            var workbook = new Excel.Workbook();
            workbook.xlsx.readFile(publicdir + '/AMAZING SBI BULK INTER BANK TRANSACTION (RTGS-NEFT) UPLOAD FORMAT.xlsx')
                .then(function (data) {
                   //Logger.info("dddd",data)
                });*/




        }
        return {
            videoConvert: videoConvert
        }
    }
    //  .addOption('-filter_complex', '[0:v][1:v]overlay=main_w-overlay_w-0:30[watermark]')main_w-overlay_w-10:10

//ffmpeg -i watermark.png -y -v quiet -vf scale=1280*0.15:-1 scaled.png


//    ffprobe -v quiet -show_entries stream=width,height -of default=noprint_wrappers=1 1457951936428.mp4


/*ffmpeg.ffprobe(serverpath3, function(err, metadata) {
                //Logger.info("metadta is..."+JSON.stringify(metadata));
            for(var i=0;i<metadata.streams.length;i++){
                //Logger.info("loop"+metadata.streams[i].width);
                if(metadata.streams[i].width!=undefined ){
                    //Logger.info("set width.."+i);
                    widthOfVideo=metadata.streams[i].width
                    heightOfvideo = metadata.streams[i].height
                }
            }


    ////console.dir("sadsadsad...."+JSON.stringify(metadata.streams[1].width));

                    //Logger.info("wiggggg****",widthOfVideo);
               ffmpeg(logo).addOption('-vf scale='+widthOfVideo+'*0.15:-1').saveToFile(serverpath2).on('error', function (err) {
                //Logger.info(err);

            }).on('end', function () {
                //Logger.info("logoimage is added");
                   ffmpeg(serverpath3).addOption('-vf', 'movie='+serverpath2+' [watermark]; [in] [watermark] overlay=main_w-overlay_w-10:10 [out]').saveToFile(serverpath4).on('error', function (err) {
                //Logger.info(err);
});

              })
        //    //Logger.info("serverpath2 is...."+serverpath2);

            });*/
/* ffmpeg.ffprobe(serverpath1, function (err, metadata) {
     //Logger.info("meta deta",serverpath2);

     //Logger.info(metadata);

 });*/
/* gm(serverPath).quality(10).write(configurationHolder.config.chatImagePath + '/' + timeStamp + '_thumbnail.png', function (err) {
          if (err) {
              //Logger.info('error in thumbnail for image', err);
          } else {
              //Logger.info('ddddd')
              responseFile = {};
              responseFile.type = 'image';
              responseFile.imageUrl = configurationHolder.config.imageUrl + 'chatimage/' + fileName;
              responseFile.thumbnailUrl = configurationHolder.config.imageUrl + 'chatimage/' + timeStamp + '_thumbnail.png';
              callback(err, SetResponse.setSuccess(configurationHolder.Message.Success.fileUpload, responseFile));
          }
      });*/

/* ffmpeg(serverpath3).size('10%').save(configurationHolder.config.chatImagePath + '/' + 'himanshu1' + '_thumbnail.png').on('end', function () {
             //Logger.info("thumbnail generated successfully and save into the object")
         }).on('error', function (error) {
             //Logger.info("errror in ffmpeg");
             //Logger.info(error);
         });*/


/*gm('/opt/Weone/ppng.png')
    .write('/opt/Weone/aaa700.jpg', function (err) {
        if (!err) //Logger.info('done');
    });*/


/* gm(['/opt/Weone/1455081301893.png', '-background white', '/opt/Weone/aaa496.jpg'],
function(err, stdout){
  if (err) throw err;
  //Logger.info('stdout:', stdout);
});*/

/*ffmpeg(serverpath1).withInputFps(1).autopad([color='white']) .save('/opt/Weone/aaa495.jpg').on('error', function (err) {
               //Logger.info('error in video transcoding');
               //Logger.info(err);
           }).on('end', function () {

//Logger.info("end function..***********8");
})
     */

/* gm(serverpath1).quality(4).write('/opt/Weone/video/ILTQq.png1',function(err){
     //Logger.info('convertsion');
     //Logger.info(err);

 })*/

/* try {
    var process = new ffmpeg1(serverpath1);
    process.then(function (video) {
        // Callback mode .addCommand('-strict','experimental')
            video.fnAddWatermark('/opt/Weone/1455105778990.png', '/opt/Weone/convert12112.mp4',{
            position : 'SE'
        }, function (error, file) {
            if (!error)
                //Logger.info('New video file: ' + file);
            else
             //Logger.info('eeeeee');
             //Logger.info(error);
             //Logger.info('finshi')
        });
    }, function (err) {
        //Logger.info('Error: ' + err);
    }).addCommand('-strict','experimental');
} catch (e) {
    //Logger.info('eeeeerrrrre');
    //Logger.info(e)
    //Logger.info(e.code);
    //Logger.info(e.msg);
} */

/* ffmpeg().mergeAdd('/opt/Weone/1455105778990.png').mergeAdd(serverpath1).on('error', function (err) {
         //Logger.info('error is occure');
         //Logger.info(err);
     }).on('end', function () {
         //Logger.info('processing is finished');
     }).mergeToFile('/opt/Weone/convert1211.mp4');*/
/*.videoFilters([{
          filter:'overlay',
          options:'25:25'
        }])*/
/* try {
    var process = new ffmpeg(serverpath1);
    process.then(function (video) {
        //Logger.info('The video is ready to be processed');
 video.setVideoCodec('mpeg4').setVideoBitRate(102444).setVideoFrameRate(25).setAudioCodec('libfaac').setAudioBitRate(128).save('/home/parveen/aaa.mp4', function (error, file) {
            if (!error)
                //Logger.info('Video file: ' + file);
        });

    }, function (err) {
        //Logger.info('Error: ' + err);
    });
} catch (e) {
    //Logger.info(e.code);
    //Logger.info(e.msg);)
}*/


/* try {
    new ffmpeg(serverpath1, function (err, video) {
        if (!err) {
            //Logger.info('The video is ready to be processed');
            video.setVideoCodec('mpeg4').setVideoBitRate(102444).setVideoFrameRate(25).setAudioCodec('libfaac').setAudioBitRate(128).save('/home/parveen/aaa.mp4', function (error, file) {
            if (!error)
                //Logger.info('Video file: ' + file);
        });



        } else {
            //Logger.info('Error: ' + err);
        }
    });
} catch (e) {
    //Logger.info(e.code);
    //Logger.info(e.msg);
}*/



//}

/*  //Logger.info("control in the video convert controller");
        var serverPath = '/opt/Weone/Block Manpreet .mp4';
    //    var serverpath1 = '/opt/Weone/I Am Single.mp4'
        var destPath = '/opt/Weone/convertvideo';

        //save trasncdoing object Transcoding_Flavour
        var object1 = new domain.Transcoding_Flavour({
            video_codec: 'libx264',
            audio_codec: 'aac',
            audio_bitrate: '128k',
            video_bitrate: '360k',
            height: 480,
            width: 360,
            name: '360px'
        });
        object1.save(function (err, object) {
            //Logger.info(object);
            //Logger.info("object saved");
        })*/
//*/
/*ffmpeg.ffprobe(destPath+'/convert1.mp4',function(err,metadata){
   //Logger.info("error",err);
    //Logger.info('metadata');
    //Logger.info(metadata);
});*/
/*ffmpeg(serverPath).on('filenames',function(filenames){
    //Logger.info('will generate'+filenames.join(','));
}).on('end',function(){
    //Logger.info('screen short are taken');
}).screenshots({
    count:1,
    folder:destPath,
    filename:'test.png'
})*/
/*ffmpeg(serverPath).input(serverpath1).on('error',function(error){
    //Logger.info("error is occure",error);
}).on('end',function(result){
    //Logger.info('merge finish',result);
}).mergeToFile(destPath+'/merged.mp4','/opt/Weone/video');*/


/*ffmpeg(serverpath1).videoCodec('mpeg4').videoBitrate('4000k')
                    .audioCodec('libmp3lame').audioBitrate('4000k').audioChannels(1).on('error', function (err) {
                        //Logger.info('error is occure');
                        //Logger.info(err);
                    }).on('end', function () {
                        //Logger.info('processing is finished');
                    }).save(destPath + '/convert7.mp4');
*/

/* ffmpeg(serverpath1).videoCodec('libx264')
     .audioCodec('libfdk-aac').on('error', function (err) {
         //Logger.info('error is occure');
         //Logger.info(err);
     }).on('end', function () {
         //Logger.info('processing is finished');
     }).save(destPath + '/prabjot.mp4');

 */

/*ffmpeg(serverpath1).noVideo().save(destPath + '/noVideo.mp4').on('error', function (error) {
    //Logger.info('error', error);
}).on('end', function () {
    //Logger.info('finish converting');
}).on('progress', function (progress) {
    //Logger.info('progress')
    //Logger.info(progress);
    //Logger.info(progress.percent + '%')
})*/
