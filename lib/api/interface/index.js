const axios = require('../api.request');
const { gitUserName } = require('../../dictionary/base')
// 获取git个人所有repo
const getRepoList = params => {
	return axios.request({
		url: `https://api.github.com/users/${gitUserName}/repos`,
		params,
		method: 'get'
	})
}

module.exports = {
	getRepoList
}