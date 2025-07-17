const { move, readdir, rename } = require('fs-extra')
const { join, resolve } = require('path')

const moveFiles = async () => {
  const base = join(resolve(__dirname), '../docs/.vitepress/dist')
  const dirs = await readdir(base)

  for (let i = 0, l = dirs.length; i < l; i++) {
    const dir = dirs[i]
    const src = `${base}/${dir}`

    if (dir === 'assets') {
      const _dirs = await readdir(src)

      for (let i = 0, l = _dirs.length; i < l; i++) {
        const _dir = _dirs[i]
        const _src = `${src}/${_dir}`
        await move(_src, resolve(__dirname, `../dist/assets/${_dir}`))
      }
    } else if (dir !== '404.html') {
      // 404.html 会导致单页面路由刷新时去 vitepress 中找，会找不到直接 404
      await move(src, resolve(__dirname, `../dist/${dir}`))
    }
  }
}

moveFiles()
