<template>
  <div class="fixed bottom-2 left-1/2 z-5 -translate-x-1/2 pointer-events-none">
    <a
      href="https://beian.mps.gov.cn/#/query/webSearch?code=51012202002480"
      rel="noreferrer"
      target="_blank"
      class="inline-flex items-center gap-1 text-[12px] text-[var(--sd-text-caption)] no-underline pointer-events-auto hover:text-[var(--sd-text-body)]"
    >
      <img :src="beianIcon" alt="公安备案" class="w-[14px] h-auto object-contain mr-1" />
      川公网安备51012202002480号
    </a>
  </div>
</template>

<script setup lang="ts">
import beianIcon from '#sk-web/assets/images/beian-icon.png'
</script>
