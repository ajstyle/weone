/**
http://neo4j.com/docs/stable/query-predicates.html
./bin/neo4j start
 * Module dependencies.
 db.collection.createIndex( { "$**": "text" } )
 wowza
 ET1A4-tjrND-GTEPG-MdfFm-f8w4w-UTEPA-96WwH76Vfutd
 sudo service WowzaStreamingEngine start
 http://cdnsun.com/knowledgebase/tools/test-player
 */

const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length - 1;
console.log("numCPUsis...", numCPUs);
var multipart = require('connect-multiparty');
global.multipartMiddleware = multipart();
var mongoosemask = require('mongoosemask');
global.configurationHolder = require('./configurations/DependencyInclude.js')
var cors = require('cors');
global.sender = new gcm.Sender(configurationHolder.config.googleGCMKey);
global.app = module.exports = express();
app.use(bodyParser({
    limit: '50mb'
}));
app.use(errorHandler());
app.use(cors());
global.publicdir = __dirname;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/view'));
global.router = express.Router();
app.use(express.static(__dirname + '/public'));
//global.route = require('./configurations/routes');
global.domain = require('./configurations/DomainInclude.js');
global.neo4jDbConnection = new neo4j(configurationHolder.config.neo4jUrl);
//global.neo4jDbConnection=new neo4j('http://neo4j:weone@182.71.214.253:7474');
//removing fields from the response
app.use(mongoosemask(function(result, mask, done) {
    var masked = mask(result, []);
    if (masked.object) {
        //masked.object = mask(result.object, ['__v', 'salt', 'password']);
    }
    done(null, masked);
}));
app.get("/server/api/v1/password/reset/:token/:username", function(req, res) {
    //Logger.info("control in the reset password app.js")
    file.readFile(__dirname + '/view/reset.html', 'utf-8', function(error, content) {
        res.end(ejs.render(content, {
            serverSideCss: configurationHolder.config.serverCssFileName,
            nginxPath: configurationHolder.config.nginxPath
        }));
    })
    res.sendFile(path.join(__dirname + '/view/reset.html'));
});
Layers = require('./application-utilities/layers').Express;
var wiring = require('./configurations/UrlMapping');
new Layers(app, router, __dirname + '/application/controller-service-layer', wiring);
app.use('/', router)
    //Mqtt server app
    //var MqttServer= require("./mqttApp.js");
configurationHolder.Bootstrap.initApp();
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork().process
        console.log('worker %s started.', worker.pid);
    }
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });
} else {
    console.log("not master")
    http.createServer(app).listen(3000);
    // res.writeHead(200);
    // res.end('process ' + process.pid + ' says hello!');
    //  })
}
process.on('uncaughtException', function(err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
    console.error(err.stack)
    process.exit(1)
})
