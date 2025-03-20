<template>
  <VDialog
    v-model="isDialogVisible"
    width="500"
  >
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        :disabled="isLoading"
        class="ms-4"
      >
        {{ $t('Send mail.Send btn') }}
        <VProgressCircular
          v-if="isLoading"
          indeterminate
          color="secondary"
          :size="20"
          width="3"
          class="ml-2"
        />
      </VBtn>
    </template>

    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

    <VCard :title="$t('Send mail.Title')">
      <VCardText>
        <VForm ref="form">
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="selectedMails"
                :items="users"
                item-title="email"
                item-value="email"
                :label="$t('Send mail.Choice mails')"
                :placeholder="$t('Send mail.Choice mails')"
                :rules="[requiredValidator]"
                multiple
                chips
                closable-chips
                :return-object="false"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="send">
          {{ $t('Send mail.Send btn') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useUserStore } from "@/stores"

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['sendMails'])
const userStore = useUserStore()
const { users } = storeToRefs(userStore)
const isDialogVisible = ref(false)
const selectedMails = ref([])
const form = ref()

onMounted(() => {
  userStore.getDTUsers()
})

function send(){
  form.value.validate().then(async ({ valid }) => {
    if (!valid) return
    emits('sendMails', selectedMails.value)
    isDialogVisible.value = false
    selectedMails.value = []
  })
}
</script>
