<p align="center">
  <a href="https://github.com/whyour/qinglong">
    <img width="150" src="https://z3.ax1x.com/2021/11/18/I7MpAe.png">
  </a>
<img width="350" src="https://user-images.githubusercontent.com/25076827/150628013-3c861f75-5ae1-40a0-89fd-7e0437175946.png">
</p>

<h1 align="center">青龙面板 集成code server(vscode web编辑器)</h1>

<div align="center">

本项目整合了青龙面板和code server(vscode web), 便于随时随地写脚本。
  
需要手动打包docker 镜像然后部署.

</div>

```bash
git clone xxx
cd qinglong-vscode
docker build . -t qinglong-vscode:latest
```
```bash
docker run -dit \
  -e PUID=0 \
  -e PGID=0 \
  -e LC_ALL=C \
  -e TZ=Asia/Shanghai \
  -e PASSWORD=111111  \
  -e SUDO_PASSWORD=111111 \
    --shm-size 1G --log-opt max-size=10m \
  -v /disk2T/docker/qinglong/qlong/ql/config:/ql/config \
  -v /disk2T/docker/qinglong/qlong/ql/log:/ql/log \
  -v /disk2T/docker/qinglong/qlong/ql/db:/ql/db \
  -v /disk2T/docker/qinglong/qlong/ql/repo:/ql/repo \
  -v /disk2T/docker/qinglong/qlong/ql/raw:/ql/raw \
  -v /disk2T/docker/qinglong/qlong/ql/scripts:/ql/scripts \
  -p 5700:5700 \
  -p 8443:8443 \
  --name qinglongserver \
  --hostname tangzhiyong.picp.io \
  --restart unless-stopped \
    qinglongserver:latest
```


参数说明:
* 5700=> 面板访问端口<br/>
* 8443=> vscode 访问端口
* PUID=>vscode 登陆用户的PUID, 0是root
* PGID=>vscode 登陆用户的PUID, 0是root
* PASSWORD=>vscode 登陆密码



## 截图

![image](https://user-images.githubusercontent.com/25076827/150721735-50f78574-e821-4d55-a790-7864544a536a.png)

## 链接
- [qinglong](https://github.com/whyour/qinglong)
- [code server](https://github.com/coder/code-server)

