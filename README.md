# ws-nodejs

特点:支持ws直连，支持固定隧道，节点需要按照一下配置手搓

手搓节点:
```
类型 vmess
地址 cf优选域名或ip,如ip.sb
端口 443
用户ID UUID值,默认fd80f56e-93f3-4c85-b2a8-c77216c509a7
传输协议 ws tls
加密方式 auto
path MPATH值，默认vms?ed=2048
host 隧道域名或直连域名
SNI  隧道域名或直连域名
```
