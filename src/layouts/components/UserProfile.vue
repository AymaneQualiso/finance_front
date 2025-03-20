<script setup>
import { useAuthStore } from '@/stores'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const logout = async () => {

  await authStore.logout()

  // Redirect to login page
  await router.push({ name: 'login' })
}

const userProfileList = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'tabler-user',
    title: 'Profile',
    to: {
      name: 'profile-list',

      // name: 'profile',
      // params: { id: 21 },
    },
  },
  {
    type: 'navItem',
    icon: 'tabler-settings',
    title: 'Settings',
    to: {
      name: 'settings-parent',

      // name: 'pages-account-settings-tab',
      // params: { tab: 'account' },
    },
  },
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'tabler-logout',
    title: 'Logout',
    onClick: logout,
  },
]
</script>

<template>
  <VBadge
    v-if="user"
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      :color="!(user && user.avatar) ? 'primary' : undefined"
      :variant="!(user && user.avatar) ? 'tonal' : undefined"
    >
      <VImg
        v-if="user && user.avatar"
        :src="user.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="!(user && user.avatar) ? 'primary' : undefined"
                    :variant="!(user && user.avatar) ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="user && user.avatar"
                      :src="user.avatar"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-medium">
              {{ user.name || user.email }}
            </VListItemTitle>
            <VListItemSubtitle>{{ user.roles?.[0] }}</VListItemSubtitle>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                @click="item.onClick && item.onClick()"
              >
                <template #prepend>
                  <VIcon
                    class="me-2"
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.badgeProps"
                  #append
                >
                  <VBadge v-bind="item.badgeProps" />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
