let model = null

const useNSFW = async files => {
  return true

  if (!model) {
    // const nsfwjs = await import('nsfwjs')
    // model = await nsfwjs.load('/nsfw-model/model.json', {
    //   size: 299
    // })
  }

  const promises = files.map(file => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      img.onload = async () => {
        const scores: {
          Hentai: number
          Drawing: number
          Porn: number
          Neutral: number
          Sexy: number
        } = {} as any
        const predictions = await model.classify(img)

        for (let i = 0, l = predictions.length; i < l; i++) {
          const { className, probability } = predictions[i]
          scores[className] = probability
        }

        const { Hentai, Porn, Sexy } = scores
        // Porn / Hentai 权重为 1，Sexy 权重为 0.5
        const score = Porn + Hentai + 0.5 * Sexy

        // 违规图片
        if (Porn >= 0.6 || Hentai >= 0.6 || score >= 0.75) {
          return reject()
        }

        // 人工复核
        if (score >= 0.45) {
          return reject()
        }

        // 通过
        resolve(null)
      }
      img.src = URL.createObjectURL(file)
    })
  })

  return Promise.all(promises)
}

export default useNSFW
