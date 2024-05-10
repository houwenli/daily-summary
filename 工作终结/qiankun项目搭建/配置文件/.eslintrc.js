module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['plugin:vue/essential', 'plugin:prettier/recommended', 'prettier'],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // 'vue/script-indent': ['error', 4, { 'baseIndent': 1 }],
        // "quotes": [2, "single", { "avoidEscape": true }],
        // 使用prettier来替换eslint的规则
        'prettier/prettier': 'error',
        'no-var': 2, //禁用var，用let和const代替
        'no-unused-vars': [2, { args: 'none' }], //消除未使用的变量  不检查函数的参数
        'no-redeclare': 2, //禁止多次声明同一变量
        'no-dupe-keys': 2, //在创建对象字面量时不允许键重复
        eqeqeq: ['error', 'always', { null: 'ignore' }], // 强制使用全等
        'vue/multi-word-component-names': 0
    },
    parserOptions: {
        parser: '@babel/eslint-parser',
        ecmaVersion: 6,
        sourceType: 'module'
    }
}
