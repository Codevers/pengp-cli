const path = require("path");
const fs = require("fs-extra");
const Inquirer = require("inquirer");
const chalk= require('chalk');
const cwd = process.cwd();
const figlet = require('figlet');
// loading效果
const ora = require('ora');
// 获取git请求实例
const api = require('./api/interface/index');
// 借助node util模块将download-git-repo支持promise
const util = require('util');
// 模板下载
const downloadGitRepo = require('download-git-repo');
const { isOverwriteList } = require('./dictionary/prompt')
const { gitUserName } = require('./dictionary/base')
class Creator {
    constructor(projectName, options) {
        this.projectName = projectName;
        this.options = options;
        // downloadGitRepo转化为promise方法
        /* download-git-repo
         * download-git-repo 不支持 Promise
         * @param {String} repo 仓库地址
         * @param {String} dest 仓库下载后存放路径
         * @param {Object} opts 配置参数
         * @param {Function} fn 回调函数
         */
        this.downloadGitRepo = util.promisify(downloadGitRepo)
    }
    // 创建-启动
    async create() {
        const isOverwrite = await this.handleDirectory();
        if(!isOverwrite) return;
        // 默认执行创建时||覆盖时
        await this.getCollectRepo()
    }
    // 创建-处理是否有相同目录
    async handleDirectory() {
        const targetDirectory = path.join(cwd, this.projectName);
        // 如果目录中存在了需要创建的目录
        if (fs.existsSync(targetDirectory)) {
            if (this.options.force) {
                await fs.remove(targetDirectory);
            } else {
                let { isOverwrite } = await new Inquirer.prompt(isOverwriteList);
                if (isOverwrite) {
                    await fs.remove(targetDirectory);
                } else {
                    console.log(chalk.red.bold('不覆盖文件夹，创建终止'));
                    return false;
                }
            }
        };
        return true;
    }
    // 获取可拉取的仓库列表
    async getCollectRepo() {
        const loading = ora('正在获取模版信息...');
        loading.start();
        const {data: list} = await api.getRepoList({per_page: 100});
        loading.succeed();
        const collectTemplateNameList = list.filter(item => item.topics.includes('template')).map(item => item.name);
        // console.log('collectTemplateNameList',collectTemplateNameList)
        let { choiceTemplateName } = await new Inquirer.prompt([
            {
                name: 'choiceTemplateName',
                type: 'list',
                message: '请选择模版',
                choices: collectTemplateNameList
            }
        ]);
        // console.log('选择了模版：' + choiceTemplateName);
        // 拉取模板
        this.downloadTemplate(choiceTemplateName);
    }
    // 下载仓库
    async downloadTemplate(choiceTemplateName) {
        const templateUrl = `${gitUserName}/${choiceTemplateName}`;
        // const templateUrl = `gitlab:git.dev.ft:pengp/fs-hooks`;
        const loading = ora('正在拉取模版...');
        loading.start();
        await this.downloadGitRepo(templateUrl, path.join(cwd, this.projectName));
        loading.succeed();
        this.showTemplateHelp()
    }
    // 下载成功，模版使用提示
    showTemplateHelp() {
        console.log(`\r\n Successfully created project ${chalk.cyan(this.projectName)} 🎉`);
        console.log(`\r\n  cd ${chalk.cyan(this.projectName)}\r\n`);
        console.log("  yarn add");
        console.log("  yarn dev\r\n");
        console.log(`
            ${chalk.green.bold(
                figlet.textSync("Pengp-cli", {
                    font: "isometric4",
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    width: 80,
                    whitespaceBreak: true,
                  })
            )}
        `)
    }
}
module.exports = async function (projectName, options) {
    const creator = new Creator(projectName, options);
    await creator.create();
}