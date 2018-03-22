
var request = require('request'),
    async = require('async');

var simpleKey = require('simple-key');

var NodeRSA = require('node-rsa');
var key = new NodeRSA({b: 512});

var arr = new Float32Array(500000);

async.eachLimit(arr,1,(item,callback) => {

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

        var obj = {a:123,b:456};

        var params = simpleKey.encode(JSON.stringify(obj),json.code);

        request({
            url:'http://192.168.3.150/getrsakey',
            method:'post',
            jar:jar,
            timeout:6000,
            form:{
                params:params,
                guid:json.guid
            }
        },(err,data) => {

            try{

                var json = JSON.parse(data.body);

                resolve(json);

            }catch(e){
                resolve(null);
            }
            
        });

    } ) ).then( (json) => new Promise( (resolve,reject) => {
        
        var key = new NodeRSA(json.publicKey);
        
        var obj = {a:123,b:456};
        
        key.setOptions({encryptionScheme: 'pkcs1'});
    
        var rsaStr = key.encrypt(obj, 'base64');
        
        var params = simpleKey.encode(rsaStr,json.code);
        
        request({
            url:'http://192.168.3.150/decodersakey',
            method:'post',
            jar:jar,
            timeout:6000,
            form:{
                params:params,
                guid:json.guid
            }
        },(err,data) => {

            try{

                var json = JSON.parse(data.body);

                console.log( json );

            }catch(e){
                console.log( e );
            }
            
            callback();
            
        });
        
        
    } ) ).catch( (e) => {
    
        callback();

    } );
    
    
},() => {

});


