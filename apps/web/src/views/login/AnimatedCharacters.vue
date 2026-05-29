<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import LoginPupil from './LoginPupil.vue'
import LoginEyeBall from './LoginEyeBall.vue'

const props = defineProps<{
  isTyping: boolean
  password: string
  showPassword: boolean
}>()

const mouseX = ref(0)
const mouseY = ref(0)
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)
const isLookingAtEachOther = ref(false)
const isPurplePeeking = ref(false)

const purpleRef = ref<HTMLDivElement | null>(null)
const blackRef = ref<HTMLDivElement | null>(null)
const yellowRef = ref<HTMLDivElement | null>(null)
const orangeRef = ref<HTMLDivElement | null>(null)

function onMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

function scheduleBlink(setter: (v: boolean) => void): () => void {
  let blinkTimeout: ReturnType<typeof setTimeout> | undefined
  let innerTimeout: ReturnType<typeof setTimeout> | undefined

  const run = () => {
    blinkTimeout = setTimeout(() => {
      setter(true)
      innerTimeout = setTimeout(() => {
        setter(false)
        run()
      }, 150)
    }, Math.random() * 4000 + 3000)
  }
  run()
  return () => {
    if (blinkTimeout) clearTimeout(blinkTimeout)
    if (innerTimeout) clearTimeout(innerTimeout)
  }
}

let stopPurpleBlink: (() => void) | undefined
let stopBlackBlink: (() => void) | undefined
let peekTimeout: ReturnType<typeof setTimeout> | undefined
let peekEndTimeout: ReturnType<typeof setTimeout> | undefined
let lookTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  stopPurpleBlink = scheduleBlink((v) => { isPurpleBlinking.value = v })
  stopBlackBlink = scheduleBlink((v) => { isBlackBlinking.value = v })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  stopPurpleBlink?.()
  stopBlackBlink?.()
  if (peekTimeout) clearTimeout(peekTimeout)
  if (peekEndTimeout) clearTimeout(peekEndTimeout)
  if (lookTimer) clearTimeout(lookTimer)
})

watch(
  () => props.isTyping,
  (typing) => {
    if (lookTimer) clearTimeout(lookTimer)
    if (typing) {
      isLookingAtEachOther.value = true
      lookTimer = setTimeout(() => {
        isLookingAtEachOther.value = false
      }, 800)
    } else {
      isLookingAtEachOther.value = false
    }
  },
)

function schedulePeek() {
  if (peekTimeout) clearTimeout(peekTimeout)
  if (peekEndTimeout) clearTimeout(peekEndTimeout)
  if (props.password.length > 0 && props.showPassword) {
    peekTimeout = setTimeout(() => {
      isPurplePeeking.value = true
      peekEndTimeout = setTimeout(() => {
        isPurplePeeking.value = false
        schedulePeek()
      }, 800)
    }, Math.random() * 3000 + 2000)
  } else {
    isPurplePeeking.value = false
  }
}

watch(
  () => [props.password, props.showPassword] as const,
  () => schedulePeek(),
  { immediate: true },
)

function calculatePosition(refEl: typeof purpleRef) {
  if (!refEl.value) return { faceX: 0, faceY: 0, bodySkew: 0 }
  const rect = refEl.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3
  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY
  return {
    faceX: Math.max(-15, Math.min(15, deltaX / 20)),
    faceY: Math.max(-10, Math.min(10, deltaY / 30)),
    bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
  }
}

function useCharacterPosition(refEl: typeof purpleRef) {
  return computed(() => {
    // 显式依赖鼠标坐标，确保每次移动都触发重算
    const x = mouseX.value
    const y = mouseY.value
    void x
    void y
    return calculatePosition(refEl)
  })
}

const passwordHidden = () => props.password.length > 0 && !props.showPassword
const passwordVisible = () => props.password.length > 0 && props.showPassword

const colors = {
  tall: 'rgb(36,192,127)',
  slim: '#404947',
  round: '#e8956f',
  curved: '#e8d5a3',
  pupil: '#2d3436',
}

const purplePos = useCharacterPosition(purpleRef)
const blackPos = useCharacterPosition(blackRef)
const orangePos = useCharacterPosition(orangeRef)
const yellowPos = useCharacterPosition(yellowRef)
</script>

<template>
  <div class="relative flex flex-col justify-between h-full p-12 text-white overflow-hidden login-panel-left">
    <div class="relative z-20">
      <div class="flex items-center gap-4 text-lg font-semibold">
        <div class="size-10 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <slot name="logo-icon" />
        </div>
        <span class="text-[20px]"><slot name="brand">Speed Knowledge</slot></span>
      </div>
    </div>

    <div class="relative z-20 flex items-end justify-center h-[500px]">
      <div class="relative characters-stage">
        <div
          ref="purpleRef"
          class="absolute bottom-0 character-body"
          :class="{ 'character-body--state-change': passwordVisible() || isTyping || passwordHidden() }"
          :style="{
            left: '70px',
            width: '180px',
            height: (isTyping || passwordHidden()) ? '440px' : '400px',
            backgroundColor: colors.tall,
            borderRadius: '10px 10px 0 0',
            zIndex: 1,
            transform: passwordVisible()
              ? 'skewX(0deg)'
              : (isTyping || passwordHidden())
                ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
                : `skewX(${purplePos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }"
        >
          <div
            class="absolute flex gap-8 eye-group"
            :class="{ 'eye-group--animated': passwordVisible() || isLookingAtEachOther }"
            :style="{
              left: passwordVisible() ? '20px' : isLookingAtEachOther ? '55px' : `${45 + purplePos.faceX}px`,
              top: passwordVisible() ? '35px' : isLookingAtEachOther ? '65px' : `${40 + purplePos.faceY}px`,
            }"
          >
            <LoginEyeBall
              :size="18" :pupil-size="7" :max-distance="5"
              :pupil-color="colors.pupil"
              :is-blinking="isPurpleBlinking"
              :mouse-x="mouseX"
              :mouse-y="mouseY"
              :force-look-x="passwordVisible() ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined"
              :force-look-y="passwordVisible() ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined"
            />
            <LoginEyeBall
              :size="18" :pupil-size="7" :max-distance="5"
              :pupil-color="colors.pupil"
              :is-blinking="isPurpleBlinking"
              :mouse-x="mouseX"
              :mouse-y="mouseY"
              :force-look-x="passwordVisible() ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined"
              :force-look-y="passwordVisible() ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined"
            />
          </div>
        </div>

        <div
          ref="blackRef"
          class="absolute bottom-0 character-body"
          :class="{ 'character-body--state-change': passwordVisible() || isTyping || passwordHidden() }"
          :style="{
            left: '240px',
            width: '120px',
            height: '310px',
            backgroundColor: colors.slim,
            borderRadius: '8px 8px 0 0',
            zIndex: 2,
            transform: passwordVisible()
              ? 'skewX(0deg)'
              : isLookingAtEachOther
                ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
                : (isTyping || passwordHidden())
                  ? `skewX(${blackPos.bodySkew * 1.5}deg)`
                  : `skewX(${blackPos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }"
        >
          <div
            class="absolute flex gap-6 eye-group"
            :class="{ 'eye-group--animated': passwordVisible() || isLookingAtEachOther }"
            :style="{
              left: passwordVisible() ? '10px' : isLookingAtEachOther ? '32px' : `${26 + blackPos.faceX}px`,
              top: passwordVisible() ? '28px' : isLookingAtEachOther ? '12px' : `${32 + blackPos.faceY}px`,
            }"
          >
            <LoginEyeBall
              :size="16" :pupil-size="6" :max-distance="4"
              :pupil-color="colors.pupil"
              :mouse-x="mouseX"
              :mouse-y="mouseY"
              :is-blinking="isBlackBlinking"
              :force-look-x="passwordVisible() ? -4 : isLookingAtEachOther ? 0 : undefined"
              :force-look-y="passwordVisible() ? -4 : isLookingAtEachOther ? -4 : undefined"
            />
            <LoginEyeBall
              :size="16" :pupil-size="6" :max-distance="4"
              :pupil-color="colors.pupil"
              :mouse-x="mouseX"
              :mouse-y="mouseY"
              :is-blinking="isBlackBlinking"
              :force-look-x="passwordVisible() ? -4 : isLookingAtEachOther ? 0 : undefined"
              :force-look-y="passwordVisible() ? -4 : isLookingAtEachOther ? -4 : undefined"
            />
          </div>
        </div>

        <div
          ref="orangeRef"
          class="absolute bottom-0 character-body"
          :class="{ 'character-body--state-change': passwordVisible() || isTyping || passwordHidden() }"
          :style="{
            left: '0px',
            width: '240px',
            height: '200px',
            zIndex: 3,
            backgroundColor: colors.round,
            borderRadius: '120px 120px 0 0',
            transform: passwordVisible() ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }"
        >
          <div
            class="absolute flex gap-8 eye-group"
            :style="{
              left: passwordVisible() ? '50px' : `${82 + orangePos.faceX}px`,
              top: passwordVisible() ? '85px' : `${90 + orangePos.faceY}px`,
            }"
          >
            <LoginPupil :pupil-color="colors.pupil" :mouse-x="mouseX" :mouse-y="mouseY" :force-look-x="passwordVisible() ? -5 : undefined" :force-look-y="passwordVisible() ? -4 : undefined" />
            <LoginPupil :pupil-color="colors.pupil" :mouse-x="mouseX" :mouse-y="mouseY" :force-look-x="passwordVisible() ? -5 : undefined" :force-look-y="passwordVisible() ? -4 : undefined" />
          </div>
        </div>

        <div
          ref="yellowRef"
          class="absolute bottom-0 character-body"
          :class="{ 'character-body--state-change': passwordVisible() || isTyping || passwordHidden() }"
          :style="{
            left: '310px',
            width: '140px',
            height: '230px',
            backgroundColor: colors.curved,
            borderRadius: '70px 70px 0 0',
            zIndex: 4,
            transform: passwordVisible() ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew}deg)`,
            transformOrigin: 'bottom center',
          }"
        >
          <div
            class="absolute flex gap-6 eye-group"
            :style="{
              left: passwordVisible() ? '20px' : `${52 + yellowPos.faceX}px`,
              top: passwordVisible() ? '35px' : `${40 + yellowPos.faceY}px`,
            }"
          >
            <LoginPupil :pupil-color="colors.pupil" :mouse-x="mouseX" :mouse-y="mouseY" :force-look-x="passwordVisible() ? -5 : undefined" :force-look-y="passwordVisible() ? -4 : undefined" />
            <LoginPupil :pupil-color="colors.pupil" :mouse-x="mouseX" :mouse-y="mouseY" :force-look-x="passwordVisible() ? -5 : undefined" :force-look-y="passwordVisible() ? -4 : undefined" />
          </div>
          <div
            class="absolute w-20 h-1 rounded-full eye-group"
            :style="{
              backgroundColor: colors.pupil,
              left: passwordVisible() ? '10px' : `${40 + yellowPos.faceX}px`,
              top: passwordVisible() ? '88px' : `${88 + yellowPos.faceY}px`,
            }"
          />
        </div>
      </div>
    </div>

    <div class="relative z-20 flex items-center gap-8 text-sm text-white/60">
      <!-- <a href="#" class="hover:text-white transition-colors">Privacy Policy</a> -->
      <!-- <a href="#" class="hover:text-white transition-colors">Terms of Service</a> -->
      <!-- <a href="#" class="hover:text-white transition-colors">Contact</a> -->
    </div>

    <div class="login-panel-glow login-panel-glow--top" />
    <div class="login-panel-glow login-panel-glow--bottom" />
  </div>
</template>

<style scoped>
.login-panel-left {
  background: linear-gradient(160deg, #2b302e 0%, #1e2321 45%, #161918 100%);
}

.characters-stage {
  width: 550px;
  height: 400px;
}

/* 状态切换（高度）保留缓动；transform/位置跟鼠标时不加 transition */
.character-body {
  transition: height 700ms ease-in-out;
}

.character-body--state-change {
  transition: height 700ms ease-in-out, transform 700ms ease-in-out;
}

.eye-group--animated {
  transition: left 700ms ease-in-out, top 700ms ease-in-out;
}

.login-panel-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  pointer-events: none;
}

.login-panel-glow--top {
  top: 30%;
  right: 15%;
  width: 14rem;
  height: 14rem;
  background: rgba(0, 185, 107, 0.1);
}

.login-panel-glow--bottom {
  bottom: 10%;
  left: 30%;
  width: 20rem;
  height: 20rem;
  background: rgba(255, 255, 255, 0.03);
}
</style>
