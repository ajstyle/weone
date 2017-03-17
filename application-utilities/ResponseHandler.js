
var responseHandler = function(res,responseObject,message,error,status){
	res.status(status).send({
		"error":error,
		"message":message,
		"response":responseObject,
        "status":status
	})
    res.end()
}

module.exports.responseHandler = responseHandler;