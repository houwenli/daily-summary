

function userInfo() {
    // 假设这里是借口请求
    return fetch('./index.json')
}

function getUser() {
    let user = userInfo()
    return user
}

function m1() {
    let user = getUser()
    return user
}

function main() {
    let user = m1()
    console.log(user)
}

// 代数效应
// 核心思想从根源解决问题，把fetch变成同步的就可以了
// 思路：
// 使用缓存，如果请求有缓存那么直接读取往后执行
// 如果没有缓存，抛出一个异常，在外面捕获异常，重新执行入口函数。当前函数继续请求结果，并缓存下来


// 这里就只考虑一个请求的情况
let oriFetch = window.fetch
let cache = {
    status: 'pending',
    value: null
}
window.fetch = function(...args) {
    if (cache.status === 'fullfilled') {
        return cache.value
    }
    if (cache.status === 'reject') {
        throw cache.value
    }

    let prom = oriFetch(...args).then(ret=> ret.json()).then(ret => {
        cache.status = 'fullfilled'
        cache.value = ret
    }).catch(err => {
        cache.status = 'reject'
        cache.value = err
    })

    throw prom
}

function run(func) {
    try {
        func()
    } catch(err) {
        if (err instanceof Promise) {
            err.then(func, func).finally(() => {
                window.fetch = oriFetch
                cache.status = 'pending'
                cache.value = null
            })
        }
        
    }
}

run(main)
