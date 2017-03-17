/*
 * @author Abhimanyu
 * This program includes all the function which are required to  initialize before the application start
 */

 //call all the function which are required to perform the require initialization before server will start

var  initApp = function(){
    //Logger.info("config" +configurationHolder.config.accessLevels["anonymous"] );
    createSuperAdmin()
 } 


function createSuperAdmin(){
    var saltString  = uuid.v1()
    var password = crypto.createHmac('sha1',saltString).update("weone").digest('hex')
    domain.User.findOne({name:'SuperAdmin'}, function (err, doc) {
        Logger.info("document === "+doc);
        if(!doc){
            
             var superAdminUser  = new domain.User({
        name:'SuperAdmin',
        email:'noreply@weoneapp.com',
        salt:saltString,
        password:password,
        role:'ROLE_ADMIN',
        accountLocked:false,
        isAccountActive : true,
        phonenumber:12122,
        gender:'male',
        date_of_birth:new Date(),
        age:21
    });
    
    superAdminUser.save(function (err,user) {
        if (err){  //Logger.error(err)
                }else{
                        bootApplication()
                        //Logger.info(user)
                }
      })
        }else{
          bootApplication()
        }
       /* //Logger.error(err)
        if(!doc){
        
        }*/
    });
   
    
}

// code to start the server
function bootApplication() {
   /* app.listen(configurationHolder.config.port, function () {
        //console.log("Express server listening on port %d in %s mode", configurationHolder.config.port, app.settings.env);
    });*/
    var path = configurationHolder.config.advertisementPath;
    var chatImagePath = configurationHolder.config.chatImagePath;
    var chatVideoFolder=configurationHolder.config.chatVideoPath;
    var excelFileFolder=configurationHolder.config.excelFilePath;
    try {
        file.mkdirSync(path);
        //Logger.info('advertisement video folder created sucessfully');
    } catch (e) {
    }
    try{
      file.mkdirSync(chatImagePath);
      //Logger.info("chatimage folder created");
    }catch(e){   
    }
    try{
        file.mkdirSync(chatVideoFolder);
        //Logger.info("chat video folder created");
    }catch(e){
    }
    try{
        file.mkdirSync(excelFileFolder);
        //Logger.info("excel file folder created");
    }catch(E){
        
    }
}
module.exports.initApp = initApp
