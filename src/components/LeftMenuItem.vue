<template>
  <q-item
    dark
    clickable

    tag="a"
    :href="link"
    @click="$emit('click')"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" class="text-green" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-accent">{{ title }}
        <q-badge color="yellow unread" text-color="black" v-if="unread">{{unread}}</q-badge>
      </q-item-label>
      <q-item-label caption class="text-green">
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LeftMenuItem',
  props: {
    title: {
      type: String,
      required: true
    },
    unread: {
      type: Number,
      required: false
    },
    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: null
    },

    icon: {
      type: String,
      default: ''
    }
  }
})
</script>
<style scoped>
.unread {
  margin-left: 20px;
}
</style>
