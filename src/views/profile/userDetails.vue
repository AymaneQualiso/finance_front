<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="user">
        <VCardText class="text-center pt-12">
          <VAvatar
            rounded
            :size="100"
            :color="!avatar ? 'primary' : undefined"
            :variant="!avatar ? 'tonal' : undefined"
          >
          
            <VImg :src="avatar || 'error'">
              <template #error>
                <VIcon size="100" icon="tabler-user" />
                <span
                  class="text-5xl font-weight-medium"
                >
                  {{ avatarText(user.name) }}
                </span>
              </template>
            </VImg>
        
            <!-- <VImg
              v-if="avatar"
              :src="avatar"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(user.prenom) }} 
            </span>-->
          </VAvatar> 

          <h5 class="text-h5 mt-4">
            {{ user?.name }}
          </h5>
        </VCardText>

        <VCardText>
          <h5 class="text-h5">
            {{ t('Details') }}
          </h5>

          <VDivider class="my-4" />

          <VList
            class="card-list mt-2"
            style="overflow: inherit;"
          >
            <VRow>
              <VCol
                cols="6"
                md="4"
                class="d-flex justify-end px-0"
              >
                <h6 class="text-h6">
                  {{ t('full_name') }}:
                </h6>
              </VCol>
              <VCol
                cols="6"
                md="6"
              >
                <div class="d-inline-block text-body-1">
                  {{ user?.name }}
                </div>
              </VCol>
            </VRow>

            <VRow>
              <VCol
                cols="6"
                md="4"
                class="d-flex justify-end px-0"
              >
                <h6 class="text-h6">
                  {{ t('Email') }} :
                </h6>
              </VCol>
              <VCol
                cols="6"
                md="6"
              >
                <div class="d-inline-block text-body-1">
                  {{ user?.email }}
                </div>
              </VCol>
            </VRow>

            <VRow>
              <VCol
                cols="6"
                md="4"
                class="d-flex justify-end px-0"
              >
                <h6 class="text-h6">
                  {{ t('Role') }} :
                </h6>
              </VCol>
              <VCol
                cols="6"
                md="6"
              >
                <div class="d-inline-block text-body-1">
                  {{ user?.roles[0] }}
                </div>
              </VCol>
            </VRow>

            <VRow>
              <VCol
                cols="6"
                md="4"
                class="d-flex justify-end px-0"
              >
                <h6 class="text-h6">
                  {{ t('Phone') }} :
                </h6>
              </VCol>
              <VCol
                cols="6"
                md="6"
              >
                <div class="d-inline-block text-body-1">
                  {{ user?.phone }}
                </div>
              </VCol>
            </VRow>
          </VList>
        </VCardText>

        <VCardText class="d-flex justify-center gap-x-4">
          <VBtn
            variant="elevated"
            :disabled="isUserLoading"
            :loading="isUserLoading"
            @click="isEditDialogVisible = true"
          >
            {{ t('Edit') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <UserUpdate 
      v-model:isDialogVisible="isEditDialogVisible"
      :user-data="user"
      @update:is-dialog-visible="isEditDialogVisible = $event"
      @submit="handleUserUpdate"
    />
  </VRow>
</template>

<script setup>
import { isEmpty } from "@/@core/utils/helpers"
import { useProfile } from "@/composables/profile"
import UserUpdate from './userUpdate.vue'

const t = inject("t")
const showSnackbar = inject("showSnackbar")

const {
  user,
  authStore,
  isUserLoading,
  isEditDialogVisible,
  handleUserUpdate,
} = useProfile(t, showSnackbar)

const { avatar } = storeToRefs(authStore)

onMounted(async() => {
  if (isEmpty(user.value)) await authStore.loadAuth()
})
</script>
