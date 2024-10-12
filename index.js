//依赖库

const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

//======================分隔符==============================
const port = process.env.PORT || 3000;
const vmms = process.env.VPATH || 'vms';
const vmmport = process.env.VPORT || '8001';
const nezhaser = process.env.NEZHA_SERVER;
const nezhaKey = process.env.NEZHA_KEY;
const nezport = process.env.NEZHA_PORT || '443';
const neztls = process.env.NEZHA_TLS || '--tls';
const argoKey = process.env.TOK;
//======================分隔符==============================
// 网页信息
app.get("/", function (req, res) {
  res.send("hello world");
});

// 获取系统进程表
app.get("/stas", function (req, res) {
  let cmdStr = "ps -ef | sed 's@--token.*@--token ${TOK}@g;s@-s data.*@-s ${NEZHA_SERVER}@g'";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取系统进程表：\n" + stdout + "</pre>");
    }
  });
});

app.use(
  `/${vmms}`,
  createProxyMiddleware({
    changeOrigin: true,
    onProxyReq: function (proxyReq, req, res) {},
    pathRewrite: {
      [`^/${vmms}`]: `/${vmms}`,
    },
    target: `http://127.0.0.1:${vmmport}/`,
    ws: true,
  })
);

//======================分隔符==============================
//WEB保活
  function keep_web_alive() {
  // 1.请求主页，保持唤醒
  if (process.env.SPACE_HOST) {
    const url = "https://" + process.env.SPACE_HOST;
    exec("curl -m5 " + url, function (err, stdout, stderr) {
      if (err) {
      } else {
        console.log("请求主页-命令行执行成功"+stdout);
      }
    });
  } else if (process.env.BAOHUO_URL) {
    const url = "https://" + process.env.BAOHUO_URL;
    exec("curl -m5 " + url, function (err, stdout, stderr) {
      if (err) {
      } else {
        console.log("请求主页-命令行执行成功"+stdout);
      }
    });
  } else if (process.env.PROJECT_DOMAIN) {
    const url = "https://" + process.env.PROJECT_DOMAIN + ".glitch.me";
    exec("curl -m5 " + url, function (err, stdout, stderr) {
      if (err) {
      } else {
        console.log("请求主页-命令行执行成功"+stdout);
      }
    });
  } else {
  }
  exec("rm -rf /app/.git/*")
 // 2.请求服务器进程状态列表，若web没在运行，则调起
      exec("pidof web.js", function (err, stdout, stderr) {
  //如果pidof web.js查询不到可以尝试下面的几个命令
   // 'ps -ef | grep "web.js" | grep -v "grep"',
   // 'pgrep -lf web.js',
  //  'pidof web.js',
  //  'ps aux | grep "web.js" | grep -v "grep"',
  //  'ss -nltp | grep "web.js"',

        if (stdout) {
        } else {
          // web 未运行，命令行调起
          exec(`chmod +x ./web.js && nohup ./web.js >/dev/null 2>&1 &`, function (err, stdout, stderr) {
            if (err) {
              console.log("调起web-命令行执行错误");
            } else {
              console.log("调起web-命令行执行成功!");
            }
          });
        }
      });
  }
  setInterval(keep_web_alive, 20 * 1000);
// WEB结束

//======================分隔符==============================
//nez保活
if (nezhaKey) {
  function keep_nezha_alive() {
    if (nezhaKey) {
      exec("pidof nezha.js", function (err, stdout, stderr) {
  //如果pidof nezha.js查询不到可以尝试下面的几个命令
   // 'ps -ef | grep "nezha.js" | grep -v "grep"',
   // 'pgrep -lf nezha.js',
  //  'pidof nezha.js',
  //  'ps aux | grep "nezha.js" | grep -v "grep"',
  //  'ss -nltp | grep "nezha.js"',

        if (stdout) {
        } else {
          // nezha 未运行，命令行调起
          exec(`chmod +x ./nezha.js && nohup ./nezha.js -s ${nezhaser}:${nezport} -p ${nezhaKey} ${neztls} >/dev/null 2>&1 &`, function (err, stdout, stderr) {
            if (err) {
              console.log("调起nezha-命令行执行错误");
            } else {
              console.log("调起nezha-命令行执行成功!");
            }
          });
        }
      });
    } else {
    }
  }

  setInterval(keep_nezha_alive, 20 * 1000);
} else {
}

// nez结束

//======================分隔符==============================
//ar-go保活
if (argoKey) {
  function keep_cff_alive() {
    if (argoKey) {
      exec("pidof cff.js", function (err, stdout, stderr) {
  //如果pidof cff.js查询不到可以尝试下面的几个命令
   // 'ps -ef | grep "cff.js" | grep -v "grep"',
   // 'pgrep -lf cff.js',
  //  'pidof cff.js',
  //  'ps aux | grep "cff.js" | grep -v "grep"',
  //  'ss -nltp | grep "cff.js"',

        if (stdout) {
        } else {
          // ar-go 未运行，命令行调起
          exec(`chmod +x ./cff.js && nohup ./cff.js tunnel --edge-ip-version auto run --token ${argoKey} >/dev/null 2>&1 &`, function (err, stdout, stderr) {
            if (err) {
              console.log("调起ar-go-命令行执行错误");
            } else {
              console.log("调起ar-go-命令行执行成功!");
            }
          });
        }
      });
    } else {

    }
  }

  setInterval(keep_cff_alive, 20 * 1000);
} else {

}

// ar-go保活结束


//======================分隔符==============================
//初始化，下载web
function download_web(callback) {
    let fileName = "web.js";
    let web_url;
    
    if (os.arch() === 'x64' || os.arch() === 'amd64') {

      web_url = process.env.URL_BOT || 'https://github.com/dsadsadsss/d/releases/download/sd/kano-6-amd-w';
    } else {

      web_url = process.env.URL_BOT2 || 'https://github.com/dsadsadsss/d/releases/download/sd/kano-6-arm-w';
    }
    
    let stream = fs.createWriteStream(path.join("./", fileName));
    request(web_url)
      .pipe(stream)
      .on("close", function (err) {
        if (err) {
          callback("下载web文件失败");
        } else {
          callback(null);
        }
      });
}
download_web((err) => {
  if (err) {
    console.log("下载web文件失败");
  } else {
    console.log("下载web文件成功");
  }
});

//======================分隔符==============================
//初始化，下载nez
if (nezhaKey) {
function download_nezhan(callback) {
    let fileName = "nezha.js";
    let nez_url;
    
    if (os.arch() === 'x64' || os.arch() === 'amd64') {

      nez_url = process.env.URL_NEZHA || 'https://github.com/dsadsadsss/d/releases/download/sd/nezha-amd';
    } else {

      nez_url = process.env.URL_NEZHA2 || 'https://github.com/dsadsadsss/d/releases/download/sd/nezha-arm';
    }
    
    let stream = fs.createWriteStream(path.join("./", fileName));
    request(nez_url)
      .pipe(stream)
      .on("close", function (err) {
        if (err) {
          callback("下载nez文件失败");
        } else {
          callback(null);
        }
      });
}
download_nezhan((err) => {
  if (err) {
    console.log("下载nez文件失败");
  } else {
    console.log("下载nez文件成功");
  }
});
} else {
    console.log("");
}

//======================分隔符==============================
//初始化，下载ar-go
if (argoKey) {
  function download_cff(callback) {
      let fileName = "cff.js";
      let cff_url;
      
      if (os.arch() === 'x64' || os.arch() === 'amd64') {
  
        cff_url = process.env.URL_CF || 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64';
      } else {
  
        cff_url = process.env.URL_CF2 || 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64';
      }
      
      let stream = fs.createWriteStream(path.join("./", fileName));
      request(cff_url)
        .pipe(stream)
        .on("close", function (err) {
          if (err) {
            callback("下载ar-go文件失败");
          } else {
            callback(null);
          }
        });
  }
  download_cff((err) => {
    if (err) {
      console.log("下载ar-go文件失败");
    } else {
      console.log("下载ar-go文件成功");
    }
  });
  } else {
      console.log("");
  }
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
