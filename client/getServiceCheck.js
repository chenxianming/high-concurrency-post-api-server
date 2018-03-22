
var request = require('request'),
    async = require('async');

var simpleKey = require('simple-key');

var arr = new Float32Array(500000);

async.eachLimit(arr,200,(item,callback) => {
    var jar = request.jar();
    
    ( () => new Promise( (resolve,reject) => {
        request({
            url:'http://192.168.3.150/getclient',
            method:'get',
            timeout:6000,
            jar:jar
        },(err,data) => {

            try{

                var json = JSON.parse(data.body);

                resolve(json);

            }catch(e){
                resolve(null);
            }

        });

    } ) )().then( (json) => new Promise( (resolve,reject) => {

        if(!json){
            return callback();
        }

        var obj = {a:123,b:456};

        var params = simpleKey.encode(JSON.stringify(obj),json.code);

        request({
            url:'http://192.168.3.150/getresult',
            method:'post',
            jar:jar,
            timeout:6000,
            form:{
                params:params,
                guid:json.guid
            }
        },(err,data) => {

            try{
                console.log(data.body);
            }catch(e){}

            callback();
        });

    } ) ).catch( (e) => {

        callback();
        
    } );
    
    
},() => {

});


