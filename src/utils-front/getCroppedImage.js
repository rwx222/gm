const RESULT_MIMETYPE = 'image/jpeg'

const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {object} croppedAreaObj - croppedAreaObj Object provided by react-easy-crop
 * @param {string} asBase64 - If true, the returned value will be a base64 string
 * @returns {Promise<string | Blob>}
 */
export default async function getCroppedImage(
  imageSrc,
  croppedAreaObj,
  asBase64 = false
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = croppedAreaObj.width
  canvas.height = croppedAreaObj.height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(
    image,
    croppedAreaObj.x,
    croppedAreaObj.y,
    croppedAreaObj.width,
    croppedAreaObj.height,
    0,
    0,
    croppedAreaObj.width,
    croppedAreaObj.height
  )

  if (asBase64) {
    // As Base64 string
    return canvas.toDataURL(RESULT_MIMETYPE)
  }

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file)
    }, RESULT_MIMETYPE)
  })
}
