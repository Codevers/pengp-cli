const isOverwriteList=[{
		name: 'isOverwrite',
		type: 'list',
		message: '是否强制覆盖已存在的同名目录？',
		choices: [
			{
				name: '覆盖',
				value: true
			},
			{
				name: '不覆盖',
				value: false
			}
		]
}]

module.exports = {
	isOverwriteList
}