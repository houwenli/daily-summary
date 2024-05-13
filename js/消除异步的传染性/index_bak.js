

async function userInfo() {
    // 假设这里是借口请求
    return await (await fetch('./index.json')).json()
}

async function getUser() {
    let user = await userInfo()
    return user
}

async function m1() {
    let user = await getUser()
    return user
}

async function main() {
    let user = await getUser()
    return user
}

main().then(ret => {
    console.log(ret)
})
