<template>
  <div class="flex justify-center">
    <div
      ref="divRef"
      class="h-[calc(100vw-2rem)] bg-(--ui-bg) sm:h-[50vh]"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="onClick"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
// import {
//   Scene,
//   WebGLRenderer,
//   PerspectiveCamera,
//   SphereGeometry,
//   ShaderMaterial,
//   Color,
//   Mesh,
//   MeshBasicMaterial,
//   SpriteMaterial,
//   Sprite,
//   CanvasTexture,
//   Vector2,
//   Vector3,
//   Quaternion,
//   Euler,
//   Raycaster,
//   AmbientLight,
//   DirectionalLight,
//   FrontSide,
//   NormalBlending,
//   LinearFilter,
//   RepeatWrapping,
//   ClampToEdgeWrapping
// } from 'three'
import { onMounted, useTemplateRef } from 'vue'
import { getRandomProfilesAPI } from '@/apis/profile'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

let renderer = null
let camera = null
let sphere = null
let raycaster = null
let mouse = null
let currentAngularVelocity = null
let autoRotationAxis = null
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
let lastDragDelta = { x: 0, y: 0 }
const size = { width: 0, height: 0 }
const smallBalls = []
const labelSprites = []
// @ts-ignore
const textSpeed = 0.002
const autoRotationSpeed = 0.0005
const decayRate = 0.92
const increaseRate = 1.02
const scene = new THREE.Scene()
const maxWidth = 160
const radius = 8
const sphereRadius = radius - 0.15
const planetRadius = 0.5
const fontSize = 50
const textColor = '#fff'
const backgroundColor = 'transparent'
const divRef = useTemplateRef('divRef')
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const colors = [
  '#ff6467',
  '#ff8904',
  '#ffba00',
  '#fcc800',
  '#9ae600',
  '#05df72',
  '#00d492',
  '#00d5be',
  '#00d3f2',
  '#00bcff',
  '#51a2ff',
  '#7c86ff',
  '#a684ff',
  '#c27aff',
  '#ed6bff',
  '#fb64b6',
  '#ff637e'
]

const initRender = () => {
  const { width, height } = size
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0)
  divRef.value.appendChild(renderer.domElement)
}

const initCamera = () => {
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.set(0, 0, 14)
  camera.lookAt(0, 0, 0)
}

// 内部放置了一个半透明的黑色小球来实现背面小球变暗
const initSphere = () => {
  // 第一个参数表示球体的半径，决定球的大小
  // 第二个参数表示水平分段数，即经线数，数值越大球体越圆滑
  // 第三个参数表示垂直分段数，即纬线数，数值越大球体越圆滑
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16)
  const sphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x0f172b) },
      opacity: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    // 为了使小球从正面转动的背面的过程中可以平滑的变暗，需要把半透明小球的边沿处理成
    // 高斯模糊，使用 GLSL 的插值函数 smoothstep，
    fragmentShader: `
      uniform vec3 color;
      uniform float opacity;
      varying vec3 vNormal;
      void main() {
        float alpha = opacity * smoothstep(0.5, 1.0, vNormal.z);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    // 需要关闭小球的深度测试，否则会遮挡小球
    side: THREE.FrontSide,
    depthWrite: false
  })
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphere)
}

// @ts-ignore
const createTextTexture = text => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const fontFace =
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
  context.font = `${fontSize}px ${fontFace}`
  const textMetrics = context.measureText(text)
  const textWidth = Math.ceil(textMetrics.width)
  const textHeight = fontSize * 1.2
  // 超出长度的标签采用贴图采样位移来实现跑马灯效果
  const needMarquee = textWidth > maxWidth

  let canvasWidth = maxWidth
  if (needMarquee) {
    canvasWidth = textWidth + 60
  }

  canvas.width = canvasWidth
  canvas.height = textHeight
  context.font = `${fontSize}px ${fontFace}`
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = backgroundColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = textColor
  context.textAlign = needMarquee ? 'left' : 'center'
  context.textBaseline = 'middle'

  if (needMarquee) {
    context.fillText(text, 0, canvas.height / 2)
  } else {
    context.fillText(text, maxWidth / 2, canvas.height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  if (needMarquee) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.x = maxWidth / canvas.width
  } else {
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
  }

  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return { texture, needMarquee, HWRate: textHeight / maxWidth }
}

const initPlanets = planets => {
  const smallBallGeometry = new THREE.SphereGeometry(planetRadius, 16, 16)
  const numPoints = 20
  // 黄金分割率
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  // 创建射线投射器
  raycaster = new THREE.Raycaster()
  // 使用射线拾取来实现点击交互
  mouse = new THREE.Vector2()

  for (let i = 0, l = planets.length; i < l; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    // 使用黄金分割数螺旋分配使小球在球表面均匀分布
    const theta = (2 * Math.PI * i) / goldenRatio
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY
    const { profile, user } = planets[i]
    const smallBallMaterial = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      // color:
      //   profile.gender === 'male'
      //     ? '#2b7fff'
      //     : profile.gender === 'female'
      //       ? '#f6339a'
      //       : '#71717b',
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide
    })
    const smallBall = new THREE.Mesh(smallBallGeometry, smallBallMaterial)
    smallBall.userData.index = i
    smallBall.position.set(x * radius, y * radius, z * radius)
    sphere.add(smallBall)
    smallBalls.push(smallBall)
    labelSprites.push({
      profile,
      id: user._id
    })

    // const { texture, needMarquee, HWRate } = createTextTexture(profile.nickname)
    // // 创建小球标签
    // const spriteMaterial = new THREE.SpriteMaterial({
    //   map: texture,
    //   transparent: true,
    //   depthWrite: true,
    //   depthTest: true,
    //   blending: THREE.NormalBlending
    // })
    // const sprite = new THREE.Sprite(spriteMaterial)
    // sprite.scale.set(1, HWRate)
    // labelSprites.push({
    //   sprite,
    //   smallBall,
    //   texture,
    //   needMarquee,
    //   profile,
    //   id: user._id
    // })
    // scene.add(sprite)
  }
}

const initLight = () => {
  const light = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(light)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)
}

// 自动旋转需要保持上一次滚动的方向
const animate = () => {
  requestAnimationFrame(animate)

  if (!isDragging) {
    const deltaQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        currentAngularVelocity.x,
        currentAngularVelocity.y,
        currentAngularVelocity.z,
        'XYZ'
      )
    )
    sphere.quaternion.multiplyQuaternions(deltaQuat, sphere.quaternion)

    const currentSpeed = currentAngularVelocity.length()

    if (currentSpeed > autoRotationSpeed) {
      currentAngularVelocity.multiplyScalar(decayRate)

      if (currentAngularVelocity.length() < autoRotationSpeed) {
        currentAngularVelocity
          .copy(autoRotationAxis)
          .multiplyScalar(autoRotationSpeed)
      }
    } else if (currentSpeed < autoRotationSpeed) {
      currentAngularVelocity.multiplyScalar(increaseRate)

      if (currentAngularVelocity.length() > autoRotationSpeed) {
        currentAngularVelocity
          .copy(autoRotationAxis)
          .multiplyScalar(autoRotationSpeed)
      }
    } else {
      currentAngularVelocity
        .copy(autoRotationAxis)
        .multiplyScalar(autoRotationSpeed)
    }
  }

  // 更新标签的位置和跑马灯效果
  // labelSprites.forEach(({ sprite, smallBall, texture, needMarquee }) => {
  //   smallBall.updateMatrixWorld()
  //   const smallBallWorldPos = new THREE.Vector3()
  //   smallBall.getWorldPosition(smallBallWorldPos)
  //   // 标签偏移
  //   const upOffset = new THREE.Vector3(0, 0.8, 0)

  //   sprite.position.copy(smallBallWorldPos).add(upOffset)

  //   if (needMarquee) {
  //     texture.offset.x += textSpeed

  //     if (texture.offset.x > 1) {
  //       texture.offset.x = 0
  //     }
  //   }
  // })

  renderer.render(scene, camera)
}

const onClick = event => {
  event.preventDefault()
  const { left, top, width, height } =
    divRef.value.children[0].getBoundingClientRect()
  mouse.x = ((event.clientX - left) / width) * 2 - 1
  mouse.y = -((event.clientY - top) / height) * 2 + 1
  checkIntersection()
}

const checkIntersection = () => {
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(smallBalls)

  if (intersects.length > 0) {
    const { id, profile } = labelSprites[intersects[0].object.userData.index]
    profileSpaceOverlay.open({
      targetId: id,
      targetProfile: profile
    })
  }
}

// 鼠标事件处理
const onMouseDown = event => {
  isDragging = true
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  }
}

// 滚动阻尼，鼠标转动球体之后速度能衰减到转动旋转的速率
const onMouseMove = event => {
  if (isDragging) {
    const deltaX = event.clientX - previousMousePosition.x
    const deltaY = event.clientY - previousMousePosition.y

    lastDragDelta = { x: deltaX, y: deltaY }

    const rotationFactor = 0.005

    const angleY = deltaX * rotationFactor
    const angleX = deltaY * rotationFactor

    const quaternionY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angleY
    )
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      angleX
    )

    const deltaQuat = new THREE.Quaternion().multiplyQuaternions(
      quaternionY,
      quaternionX
    )

    sphere.quaternion.multiplyQuaternions(deltaQuat, sphere.quaternion)

    const dragRotationAxis = new THREE.Vector3(deltaY, deltaX, 0).normalize()
    const dragRotationSpeed =
      Math.sqrt(deltaX * deltaX + deltaY * deltaY) * rotationFactor

    if (dragRotationAxis.length() > 0) {
      currentAngularVelocity
        .copy(dragRotationAxis)
        .multiplyScalar(dragRotationSpeed)
    }

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }
}

const onMouseUp = () => {
  if (isDragging) {
    isDragging = false

    const deltaX = lastDragDelta.x
    const deltaY = lastDragDelta.y

    if (deltaX !== 0 || deltaY !== 0) {
      const newAxis = new THREE.Vector3(deltaY, deltaX, 0).normalize()
      if (newAxis.length() > 0) {
        autoRotationAxis.copy(newAxis)
      }

      const dragSpeed = currentAngularVelocity.length()
      if (dragSpeed > autoRotationSpeed) {
        // 维持当前旋转速度
      } else {
        currentAngularVelocity
          .copy(autoRotationAxis)
          .multiplyScalar(autoRotationSpeed)
      }
    }
  }
}

// 触摸事件处理
const onTouchStart = event => {
  isDragging = true
  const touch = event.touches[0]
  previousMousePosition = {
    x: touch.clientX,
    y: touch.clientY
  }
}

const onTouchMove = event => {
  event.preventDefault()
  if (isDragging) {
    const touch = event.touches[0]
    const deltaX = touch.clientX - previousMousePosition.x
    const deltaY = touch.clientY - previousMousePosition.y

    lastDragDelta = { x: deltaX, y: deltaY }

    const rotationFactor = 0.002

    const angleY = deltaX * rotationFactor
    const angleX = deltaY * rotationFactor

    const quaternionY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angleY
    )
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      angleX
    )

    const deltaQuat = new THREE.Quaternion().multiplyQuaternions(
      quaternionY,
      quaternionX
    )

    sphere.quaternion.multiplyQuaternions(deltaQuat, sphere.quaternion)

    const dragRotationAxis = new THREE.Vector3(deltaY, deltaX, 0).normalize()
    const dragRotationSpeed =
      Math.sqrt(deltaX * deltaX + deltaY * deltaY) * rotationFactor

    if (dragRotationAxis.length() > 0) {
      currentAngularVelocity
        .copy(dragRotationAxis)
        .multiplyScalar(dragRotationSpeed)
    }

    previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    }
  }
}

const onTouchEnd = event => {
  if (isDragging) {
    isDragging = false

    const deltaX = lastDragDelta.x
    const deltaY = lastDragDelta.y

    if (deltaX !== 0 || deltaY !== 0) {
      const newAxis = new THREE.Vector3(deltaY, deltaX, 0).normalize()
      if (newAxis.length() > 0) {
        autoRotationAxis.copy(newAxis)
      }

      const dragSpeed = currentAngularVelocity.length()
      if (dragSpeed > autoRotationSpeed) {
        // 维持当前旋转速度
      } else {
        currentAngularVelocity
          .copy(autoRotationAxis)
          .multiplyScalar(autoRotationSpeed)
      }
    }
  }

  // 检查点击事件
  if (event.changedTouches.length > 0) {
    const touch = event.changedTouches[0]
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
    checkIntersection()
  }
}

const initAutoRotation = () => {
  // 定义自动旋转速度和轴
  autoRotationAxis = new THREE.Vector3(0, 1, 0).normalize()
  currentAngularVelocity = autoRotationAxis
    .clone()
    .multiplyScalar(autoRotationSpeed)
}

const initEvents = () => {
  // 禁止双指缩放，旋转等复合手势操作
  document.addEventListener('gesturestart', e => {
    e.preventDefault()
  })
  // 处理窗口大小调整
  window.addEventListener('resize', async () => {
    initSize()
    const { width, height } = size
    // 相机视锥体的宽高比，应设置为画布的宽度除以高度，由于宽高总是相等，因此不做处理
    // camera.aspect = window.innerWidth / window.innerHeight
    // 修改后需调用
    // camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
}

const initSize = () => {
  const { clientHeight } = divRef.value
  size.width = clientHeight
  size.height = clientHeight
}

onMounted(async () => {
  const { data: planets } = await getRandomProfilesAPI()
  initSize()
  initCamera()
  initRender()
  initSphere()
  initPlanets(planets)
  initLight()
  initAutoRotation()
  initEvents()
  animate()
})
</script>
