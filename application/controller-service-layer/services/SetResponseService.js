SetResponse = function() {
    SetResponse.setSuccess = function(message, object) {
        var response = {}
        response.message = message;
        response.object = object
        return response;
    }
    SetResponse.setError = function(message, statusCode) {
        var error = new Error(message);
        error.status = statusCode;
        return error;
    }

}

module.exports = SetResponse;
