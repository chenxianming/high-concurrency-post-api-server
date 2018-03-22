# high-concurrency-post-api-server
nodejs搭建的高并发服务器集群 测试方式有普通post以及rsa加密


# 测试环境

<p>
    - Ubuntu server 12.04(KVM)<br />
    - 内存 84.4GiB<br />
    - CPU Intel Xeon(R) X5570 @2.93GHz x 16<br />
    - 硬盘 128G SSD
<br />
    - 每台kvm 4核8g内存<br />
    - lvs dir x1 rr轮询<br />
    - lvs Real server x4 (4 core 8g)<br />
    - redis cluster x4 (每台3个节点)
    - 每台 lvs Real server 通过pm2运行服务端文件,8 cluster mode
</p>


# service

<p>
    服务端基于express,放在lvs real server,每个相同,session存储在redis集群<br />
    服务端有验证中间件,通过第一次访问返回guid值以及加密code，客户端AES加密post数据，中间件解析该加密字符串再转json,同时验证cookie,过期时间为5分钟，每返回一次数据重新生成新的code,guid,返回用户,写入cookie<br />
</p>

# client
<p>
    访问post接口,用第一查询返回的数据进行AES加密,发送请求时发送加密code,guid,以及cookie,如以下案例(nodejs request模拟)
</p>

普通post数据

    //以下是nodejs模拟路由层向后端POST请求数据的过程
    const request = require('request');
    const jar = request.jar(); //声明一个cookie jar，用于模拟cookie
    const simpleKey = require('simple-key'); //用于AES加密的库

    ( () => new Promise( (resolve,reject) => {

        //上一个接口或者登录后返回token以及guid
        request({
            url:'http://192.168.0.150/getclient',
            method:'get',
            timeout:6000,
            jar:jar
        },(err,data) => {
            try{

                var screctObj = JSON.parse(data.body);
                //返回一个加密对象 
                //{"code":"91101615272110","guid":"f965a89a-4262-4032-ad15-b5570465251b"}
                resolve(screctObj); 

            }catch(e){
                resolve(null);
            }
        });

    } ) )().then( (screctObj) => new Promise( (resolve,reject) => {

        //获得guid以及code
        if(!screctObj){
            return res.json({
                msg:'err'
            });
        }

        var postObj = {a:123,b:456}; //用于传输的真实数据

        var params = simpleKey.encode(JSON.stringify(obj),screctObj.code);
        //真实数据加密后的字符串参数

        request({
            url:'http://192.168.0.150/getresult',
            method:'post',
            jar:jar,
            timeout:6000,
            form:{
                params:params,
                guid:screctObj.guid
            }
        },(err,data) => {

            //获得服务器返回的最终结果
            //{result:'done.'}

        });


    } ) ).catch( (e) => {

        res.json({
            msg:'err'
        });

    } );


POST验证之后的rsa加密数据参考client目录下的 getServiceRsaCheck.js


# Perfomance

以下是局域网客户端模拟请求访问情况<br />
客户端局域网 pm2 cluster mode 8线程post访问,单线程为200并发(8 * 200)<br />
<br />
![post](http://coldnoir.com/testing/post.png)
<br />
服务端性能状况<br />
![post](http://coldnoir.com/testing/1.png)

客户端局域网 pm2 cluster mode 8线程post访问验证后返回rsa公钥,后端解密rsa字符串,每次调用500毫秒延迟回调,单线程为200并发(8 * 200)<br />
![post](http://coldnoir.com/testing/rsa.png)<br /><br />

服务端性能状况<br />
![rsa](http://coldnoir.com/testing/2.png)<br /><br />


# installation

    git clone https://github.com/chenxianming/high-concurrency-post-api-server.git
    
    
## service

    cd service
    
    npm install
    
    
修改 app.js下的

    var cluster = new Redis.Cluster([{
      port: 7000,
      host: '192.168.0.184'
    }, {
      port: 7001,
      host: '192.168.0.184'
    },{
      port: 7002,
      host: '192.168.0.184'
    },{
      port: 7003,
      host: '192.168.0.185'
    },{
      port: 7004,
      host: '192.168.0.185'
    },{
      port: 7005,
      host: '192.168.0.185'
    },{
      port: 7006,
      host: '192.168.0.186'
    },{
      port: 7007,
      host: '192.168.0.186'
    },{
      port: 7008,
      host: '192.168.0.186'
    }
    ]);
    
为redis集群列表

搭好lvs集群，如虚拟ip为192.168.3.150

## client

    cd client
    
    npm install
    
    
<p>
    修改及运行 getServiceCheck.js, getServiceRsaCheck.js 中的ip地址 http://192.168.3.150 为您的lvs虚拟ip运行即可<br />
    getServiceCheck为服务端post接口<br />
    getServiceRsaCheck为验证服务端post接口后rsa加密再二次验证<br />
</p>

    
    
# Solution


<p>
    该方案类似于node上的csrf库，不同的地方是
</p>
<p>
   - 每次res结果重新生成新code,guid <br />
   - 加密code可由guid通过自定义映射串生成映射生成 <br />
   - 没有验证headers模式(post表单文件上传)
   - 验证
</p>
<p>
    可用于借鉴，不过没有写成中间件模式，以及没有验证headers(文件上传),所以供于环境集群测试,借鉴<br />
    因此在此解决方案下直接搭建服务后端需要做一些修改<br />
    我们以后会开源稳定可直接用的方案
</p>
