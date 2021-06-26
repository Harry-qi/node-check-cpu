const nodemailer = require("nodemailer");
const os = require('os');
const config = require('../config')
var ps = require('current-processes');
const sortby = require('lodash.sortby')
// 发送邮件
async function sendEmail(cpu,tipsHtml) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    service: config.service,
    port: 465,
    secureConnection: true,
    auth: config.auth,
  });

  let info = await transporter.sendMail({
    from: '"cmq" <674816588@qq.com>', // sender address
    to: config.to, // list of receivers
    subject: "cpu使用预警", // Subject line
    text: "cpu使用预警：：：：", // plain text body
    html: tipsHtml, // html body
  });
}
// 格式化时间戳
function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        time = parseInt(time)
      } else {
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}
// 邮件内容
function createHTML(){
  return new Promise(resolve => {
    ps.get(function(err, processes) {
      const sorted = sortby(processes, 'cpu');
      const topArr  = sorted.reverse().splice(0, 3);
      let trStr = `<tr>
       <th>pid</th>
       <th>name</th>
       <th>cpu</th>
    </tr>`
      topArr.forEach(item=>{
        trStr+=`<tr>
        <th>${item.pid}</th>
        <th>${item.name}</th>
        <th>${item.cpu}</th>
      </tr>`
      })
      resolve(`<table border="1" style=" border-collapse: collapse"> ${trStr} </table> `)
    })
  })

}
// cpu已经使用了多少
const hasUse = ( (os.totalmem()-  os.freemem()) / os.totalmem() ) * 100  
// cpu使用百分比
const usePercentage = (hasUse).toFixed(2) + '%' 
module.exports = {
  sendEmail,
  parseTime,
  createHTML,
  usePercentage,
  hasUse
}


