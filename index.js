#!/usr/bin/env node

const process = require('process')
const { program } = require('commander')
const download = require('download-git-repo')
const { exec } = require('child_process')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const handlebars = require('handlebars')

program.version('1.0.0')

inquirer
  .prompt([
    {
      name: 'name',
      message: '请输入项目名称（英文）',
      default: 'back-stage-system',
    },
    {
      name: 'description',
      message: '请输入项目描述',
      default: '后台系统',
    },
    {
      name: 'author',
      message: '请输入项目作者',
      default: 'robot',
    },
    {
      name: 'dev',
      message: '请输入boe接口域名',
      default: 'https://onlinehospital.bytedance.net',
    },
    {
      name: 'online',
      message: '请输入线上接口域名',
      default: 'https://onlinehospital.lvsongguo.com',
    },
    {
      name: 'title',
      message: '请输入平台title',
      default: '后台系统',
    },
    {
      name: 'desc',
      message: '请输入平台描述',
      default: '后台系统',
    },
    {
      name: 'aid',
      message: '请输入aid',
      default: 6717,
    },
    {
      name: 'pid',
      message: '请输入product_id',
      default: '418',
    },
  ])
  .then(({ name, description, author, dev, online, title, desc, aid, pid }) => {
    const downloadPath = path.join(process.cwd(), name)
    // const spinner = ora('正在下载模板, 请稍后...')
    // spinner.start()

    download(
      'direct:git@code.byted.org:aurora/fe_back-stage-temp.git#dev',
      downloadPath,
      { clone: true },
      (err) => {
        if (!err) {
          // 写package.json
          const packagePath = path.join(downloadPath, 'package.json')
          // 判断是否有package.json, 要把输入的数据回填到模板中
          if (fs.existsSync(packagePath)) {
            const content = fs.readFileSync(packagePath).toString()
            // handlebars 模板处理引擎
            const template = handlebars.compile(content)
            const result = template({ name, description, author })
            fs.writeFileSync(packagePath, result)
          } else {
            console.log('failed! no package.json')
          }

          // 写jupiter.config.js
          const jupiterPath = path.join(downloadPath, 'jupiter.config.js')
          // 写jupiter.config.js, 要把输入的数据回填到模板中
          if (fs.existsSync(jupiterPath)) {
            const content = fs.readFileSync(jupiterPath).toString()
            // handlebars 模板处理引擎
            const template = handlebars.compile(content)
            const result = template({ title: name, description, dev })
            fs.writeFileSync(jupiterPath, result)
          } else {
            console.log('failed! no jupiter.config.js')
          }

          // 写config.ts
          const configPath = path.join(downloadPath, 'src/api/config.ts')
          // 判断是否有config.ts, 要把输入的数据回填到模板中
          if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath).toString()
            // handlebars 模板处理引擎
            const template = handlebars.compile(content)
            const result = template({ online })
            fs.writeFileSync(configPath, result)
          } else {
            console.log('failed! no config.ts')
          }

          // 写base.ts
          const basePath = path.join(downloadPath, 'src/config/base.ts')
          // 判断是否有base.ts, 要把输入的数据回填到模板中
          if (fs.existsSync(basePath)) {
            const content = fs.readFileSync(basePath).toString()
            // handlebars 模板处理引擎
            const template = handlebars.compile(content)
            const result = template({ online, title, desc })
            fs.writeFileSync(basePath, result)
          } else {
            console.log('failed! no base.ts')
          }

          // 写login.ts
          const loginPath = path.join(downloadPath, 'src/config/login.ts')
          // 判断是否有login.ts, 要把输入的数据回填到模板中
          if (fs.existsSync(loginPath)) {
            const content = fs.readFileSync(loginPath).toString()
            // handlebars 模板处理引擎
            const template = handlebars.compile(content)
            const result = template({ aid, pid, name })
            fs.writeFileSync(loginPath, result)
          } else {
            console.log('failed! no login.ts')
          }

          // 删除依赖锁
          exec('rm ./tmp/package-lock.json ./tmp/yarn.lock')
        }
      }
    )
  })

program.parse(process.argv)
