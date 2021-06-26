
const fs = require('fs')
const { sendEmail, parseTime, createHTML, hasUse, usePercentage } = require('./utils')
const config = require('./config')


async function init(){
  // 超过设定就发送邮件
  if( hasUse>=config.cpuMaxUse ){
    let fileData = fs.readFileSync('./data.json', 'utf8' )
    let nowData = JSON.parse(fileData)
    let now = parseTime(new Date(),'{y}-{m}-{d}')
    // 判断如果今天发过了就不处理，否则写进data.json并发送文件
    if(!nowData[now]){
      let tableHtml = await createHTML()
      let suggest = '<div>使用<code>kill  -9 pid</code>命令关闭进程<div>'
      const tipsHtml = `<div>cpu使用已经使用了<b>${usePercentage}</b>，请尽快处理</div> ${tableHtml}${suggest}`
      await sendEmail(usePercentage,tipsHtml)
      let nowContent = {
        [now]: true
      }
      let content = {...nowData,...nowContent}
      let strContent = JSON.stringify(content)
      fs.writeFileSync('./data.json', strContent)
    }
  }
}
init()
