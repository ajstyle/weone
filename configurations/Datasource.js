/**
 @author: Abhimanyu
 configuration is define to make connection with the database for the different environment.
*/

var getDbConnection = function() {
        switch (process.env.NODE_ENV) {
            case 'development': //182.71.214.253 192.168.2.225

                var db = mongoose.connect('mongodb://admin:admin@localhost:27017/Weone');
                return checkMongooseConnection(db)
            case 'staging':
                var db = mongoose.connect('mongodb://admin:admin@localhost:27017/Weone');
                return checkMongooseConnection(db)
            case 'production':
                var db = mongoose.connect('mongodb://qwertyr:UnQP_s3dZd@10.10.50.253:27017/Weone');
                return checkMongooseConnection(db)
            case 'test':
                var db = mongoose.connect('mongodb://admin:admin@10.10.50.130:27017/Weone');
                return checkMongooseConnection(db)
        }
    }
    //function to check connection to database server
function checkMongooseConnection(db) {
    mongoose.connection.on('open', function(ref) {
        configurationHolder.config.serverStatus = true;
        var redis_cluster = [];
        var cacheOptions = {
            cache: true,
            expires: 6000,
            prefix: 'weone'
        };
        redis_cluster['master'] = redis.createClient(configurationHolder.config.redisConf);
        redis_cluster['slave'] = redis.createClient(configurationHolder.config.redisSlaveConf);

        redis_cluster['master'].on('connect', function() {
            console.log('Connected to redis master.');
        });
        redis_cluster['master'].on('error', function() {
            console.log('Some error');
        });

        redis_cluster['slave'].on('connect', function() {
            console.log('-------------------------Connected to redis slave.=====================');
        });
        redis_cluster['slave'].on('error', function() {
            console.log('Some error in connecting the slave');
        });

        MongooseRedis(mongoose, redis_cluster, cacheOptions);
        Logger.info('Connected to mongo server.');
        return db
    });
    mongoose.connection.on('error', function(err) {
        configurationHolder.config.serverStatus = false;
        Logger.error('Could not connect to mongo server!');
        Logger.error(err);
    });
}



module.exports.getDbConnection = getDbConnection;
