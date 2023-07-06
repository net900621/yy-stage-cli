#!/usr/bin/env node

const process = require('process')
const { program } = require('commander')
const download = require('download-git-repo')
const { execSync, exec } = require('child_process')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const handlebars = require('handlebars')
const ora = require('ora')
const chalk = require('chalk')
const shell = require('shelljs')

const continueToInstall = {
  type: 'confirm',
  name: 'next',
  message: '是否安装依赖项目',
  default: true,
}
const installTool = {
  name: 'tool',
  type: 'list',
  message: '请选择打包工具',
  choices: ['npm', 'yarn'],
  default: 'npm',
}

let spinner = null

program.version('1.0.4')

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
      message: '请输入offline接口域名',
      default: 'https://baidu.com',
    },
    {
      name: 'online',
      message: '请输入线上接口域名',
      default: 'https://baidu.com',
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
    {
      name: 'cdn',
      message: '请输入cdn前缀',
      default: '/aurora/fe_qn-im',
    },
  ])
  .then(
    ({
      name,
      description,
      author,
      dev,
      online,
      title,
      desc,
      aid,
      pid,
      cdn,
    }) => {
      const downloadPath = path.join(process.cwd(), name)
      spinner = ora('正在下载模板, 请稍后...')
      spinner.start()

      download(
        'github:net900621/back-stages-system#master',
        downloadPath,
        // { clone: true },
        (err) => {
          if (!err) {
            // 写package.json
            const packagePath = path.join(downloadPath, 'package.json')
            // 判断是否有package.json, 要把输入的数据回填到模板中
            if (fs.existsSync(packagePath)) {
              const content = fs.readFileSync(packagePath).toString()
              // handlebars 模板处理引擎
              const template = handlebars.compile(content)
              const result = template({ name, description, author, cdn })
              fs.writeFileSync(packagePath, result)
            } else {
              console.log('failed! no package.json')
            }

            // modern.config.ts
            const modernPath = path.join(downloadPath, 'modern.config.ts')
            // 写jupiter.config.js, 要把输入的数据回填到模板中
            if (fs.existsSync(modernPath)) {
              const content = fs.readFileSync(modernPath).toString()
              // handlebars 模板处理引擎
              const template = handlebars.compile(content)
              const result = template({ title: name, description, dev })
              fs.writeFileSync(modernPath, result)
            } else {
              console.log('failed! no modern.config.ts')
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

            // // 写login.ts
            // const loginPath = path.join(downloadPath, 'src/config/login.ts')
            // // 判断是否有login.ts, 要把输入的数据回填到模板中
            // if (fs.existsSync(loginPath)) {
            //   const content = fs.readFileSync(loginPath).toString()
            //   // handlebars 模板处理引擎
            //   const template = handlebars.compile(content)
            //   const result = template({ aid, pid, name })
            //   fs.writeFileSync(loginPath, result)
            // } else {
            //   console.log('failed! no login.ts')
            // }

            // // 写环境变量
            // const envofflinePath = path.join(downloadPath, 'env/.env.development')
            // const envOnlinePath = path.join(downloadPath, 'env/.env.product')
            // // 判断是否有login.ts, 要把输入的数据回填到模板中
            // if (fs.existsSync(envofflinePath)) {
            //   const content = fs.readFileSync(envofflinePath).toString()
            //   // handlebars 模板处理引擎
            //   const template = handlebars.compile(content)
            //   const result = template({ dev })
            //   fs.writeFileSync(envofflinePath, result)
            // } else {
            //   console.log('failed! no login.ts')
            // }
            // if (fs.existsSync(envOnlinePath)) {
            //   const content = fs.readFileSync(envOnlinePath).toString()
            //   // handlebars 模板处理引擎
            //   const template = handlebars.compile(content)
            //   const result = template({ online })
            //   fs.writeFileSync(envOnlinePath, result)
            // } else {
            //   console.log('failed! no login.ts')
            // }

            spinner.succeed('模板拉取完成')
            // 删除依赖锁
            execSync(`rm ./${name}/yarn.lock`)
            installDependency(() => {
              console.log(chalk.green('success! 项目初始化成功！'))
              console.log(
                chalk.greenBright('开启项目') +
                  '\n' +
                  chalk.greenBright('cd ' + name) +
                  '\n' +
                  chalk.greenBright('start to dvelop~~~!')
              )
            }, name)
          } else {
            console.log(err)
            spinner.fail()
          }
        }
      )
    }
  )

const installDependency = async (cbk, name) => {
  const { next } = await inquirer.prompt(continueToInstall)
  if (next) {
    const { tool } = await inquirer.prompt(installTool)
    shell.cd(name)
    spinner = ora('正在安装依赖, 请稍后...')
    exec(`${tool} install`, (err) => {
      if (err) {
        console.log(err)
        spinner.fail()
      } else {
        spinner.succeed('依赖安装完成')
        cbk()
      }
    })
  }
}

program.parse(process.argv)
