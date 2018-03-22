# high-concurrency-post-api-server
nodejs搭建的高并发服务器集群 测试方式有普通post以及rsa加密


测试环境

<p>
- Ubuntu server 12.04(KVM)
- 内存 84.4GiB
- CPU Intel Xeon(R) X5570 @2.93GHz x 16
- 硬盘 128G SSD
<br />
- 每台kvm 4核8g内存
- lvs dir x1 rr轮询
- lvs Real server x4 (4 core 8g)
- redis cluster x4 (每台3个节点)
</p>

