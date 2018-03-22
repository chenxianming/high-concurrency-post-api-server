var express = require('express');
var router = express.Router();

const uuidv4 = require('uuid/v4');

var simpleKey = require('simple-key');

var NodeRSA = require('node-rsa');

var rsaGenerator = require('rsa-generator'),
    size = 1024;

var mapKey = 'y1jxfs8k7udn3i5qctavpm2lg9b4erwz60oh',
    mapPramas = '49230712';

const mapKeyFn = () => {
    var str = 'qwertyuiopasdfghjklzxcvbnm1234567890';

    var arr = str.split('');

    var results = [];

    while( results.length < arr.length ){

            var type = arr[~~( Math.random() * arr.length )];

            ( results.indexOf(type) < 0 ) && results.push(type);

    }

    return results.join('');
}

const getCodeByGuid = (guid,mapKey,mapPramas) => {
    var results = [],
        guid = guid.toLocaleLowerCase(),
        arr = guid.split('');
    
    var arr2 = mapPramas.split('');
    
    arr2.forEach( (data) => {
        results.push(guid.indexOf(data));
    } );
    
    var str = results.join('');
    
    return str.replace(/-/g,'');
}

router.get('/', function(req, res, next) {
    res.json(req.session);
});

router.get('/getclient', function(req, res, next) {
    var guid = uuidv4(),
        code = getCodeByGuid(guid,mapKey,mapPramas);
    
    req.session.userData = {
        guid:guid
    };
    
    res.json({
        code:code,
        guid:guid
    });
});

router.post('/getresult',function(req, res, next){ //like the middleware
    
    var guid = null,
        code = null,
        requestBody = null,
        params = req.body.params || null;
    
    try{
        guid = req.body.guid;
        code = getCodeByGuid(guid,mapKey,mapPramas);
    }catch(e){}
    
    if(guid != req.session.userData.guid){
        return res.json({
            msg:'验证过期'
        });
    }
    
    if(!guid || !code || !params){
        return res.json({
            msg:'缺少必填参数'
        });
    }
    
    try{
        requestBody = JSON.parse( simpleKey.decode(params,code) );
    }catch(e){
        console.log(e);
    }
    
    if(!requestBody){
        return res.json({
            msg:'密钥验证失败'
        });
    }
    
    req.session.requestBody = requestBody;
    
    next();
});

router.post('/getresult',function(req, res, next){ //pass filter
    res.json(req.session.requestBody);
});


router.post('/getrsakey',function(req, res, next){ //like the middleware
    
    var guid = null,
        code = null,
        requestBody = null,
        params = req.body.params || null;
    
    try{
        guid = req.body.guid;
        code = getCodeByGuid(guid,mapKey,mapPramas);
    }catch(e){}
    
    if(guid != req.session.userData.guid){
        return res.json({
            msg:'验证过期'
        });
    }
    
    if(!guid || !code || !params){
        return res.json({
            msg:'缺少必填参数'
        });
    }
    
    try{
        requestBody = JSON.parse( simpleKey.decode(params,code) );
    }catch(e){
        console.log(e);
    }
    
    if(!requestBody){
        return res.json({
            msg:'密钥验证失败'
        });
    }
    
    req.session.requestBody = requestBody;
    
    next();
});

router.post('/getrsakey',function(req, res, next){ //pass filter
    
    var guid = uuidv4(),
        code = getCodeByGuid(guid,mapKey,mapPramas);
    
    req.session.userData = {
        guid:guid
    };
    
    rsaGenerator.generator(size,(data) => {
        
        req.session.requestBody.rsaKey = data;
        
        res.json({
            publicKey:data.public,
            guid:guid,
            code:code
        });
        
    });
});


//decode rsa key
router.post('/decodersakey',function(req, res, next){ //pass filter
    
    var guid = null,
        code = null,
        requestBody = null,
        params = req.body.params || null;
    
    try{
        guid = req.body.guid;
        code = getCodeByGuid(guid,mapKey,mapPramas);
    }catch(e){}
    
    if(guid != req.session.userData.guid){
        return res.json({
            msg:'验证过期'
        });
    }
    
    if(!guid || !code || !params){
        return res.json({
            msg:'缺少必填参数'
        });
    }
    
    try{
        var rsaStr = simpleKey.decode(params,code);
        
        var key = new NodeRSA(req.session.requestBody.rsaKey.private);

        key.setOptions({encryptionScheme: 'pkcs1'});

        var decrypted = key.decrypt(rsaStr, 'utf8');
        
        requestBody = JSON.parse( decrypted );
        
    }catch(e){
        console.log(e);
    }
    
    if(!requestBody){
        return res.json({
            msg:'密钥验证失败'
        });
    }
    
    res.json( requestBody );
    
});


module.exports = router;
