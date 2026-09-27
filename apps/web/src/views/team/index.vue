<template>
  <div class="team-view-root h-full">
    <TeamDetail v-if="teamSlug" :key="teamSlug" />
    <TeamList v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TeamList from './TeamList.vue'
import TeamDetail from './TeamDetail.vue'

const route = useRoute()
const teamSlug = computed(() => route.params.team_slug as string | undefined)
</script>

<style scoped>
.team-view-root {
  width: 100%;
  height: 100%;
}
</style>