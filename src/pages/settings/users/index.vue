<template>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <DialogCloseBtn :disabled="isUserLoading" @click="closeModal" />
    <VCard title="Confirmer" :loading="isUserLoading" :disabled="isUserLoading">
      <VCardText>
        <VRow>
          <VCol cols="12">
            {{ $t("Deleting msg") }}
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="closeModal"
          :disabled="isUserLoading"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          @click="SubmitEvent"
          :disabled="isUserLoading"
          :loading="isUserLoading"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard :title="$t('SetUSerMd.Users')" v-if="$can('users.index')">
    <template #append>
      <VBtn v-if="$can('users.store')" color="primary" @click="addUser">
        {{ $t("Add") }}
      </VBtn>
    </template>
    <DataTableCore
      :headers="headers"
      :items="users"
      :total="total"
      :per_page="10"
      :is-loading="isUsersLoading"
      :filter="filters"
      @change-filter="changeFilter"
    >
      <template #item.auth_status="{ item }">
        <StatusChip :title="item.auth_status" />
      </template>
      <template #item.avatar="{ item: user }">
        <VAvatar
          :color="!(user && user.avatar) ? 'primary' : undefined"
          :variant="!(user && user.avatar) ? 'tonal' : undefined"
        >
          <VImg v-if="user && user.avatar" :src="user.avatar" />
          <VIcon v-else icon="tabler-user" />
        </VAvatar>
      </template>
      <template #item.roles="{ item }">
        <VChip
          v-for="role in item.roles"
          :key="role"
          :label="false"
          color="primary"
        >
          {{ t(role.name) }}
        </VChip>
      </template>
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('users.show')"
            :tooltip-text="$t('SetUSerMd.show')"
            icon="tabler-eye"
            color="primary"
            @click="editUser(item, true)"
          />
          <TooltipIcon
            v-if="$can('users.update')"
            :tooltip-text="$t('SetUSerMd.edit')"
            icon="tabler-edit"
            color="primary"
            @click="editUser(item)"
          />
          <TooltipIcon
            v-if="$can('users.destroy')"
            :tooltip-text="$t('SetUSerMd.delete')"
            icon="tabler-trash"
            color="error"
            @click="openModal(item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useRoleStore, useUserStore, useCoreStore } from "@/stores";
import { isEmpty, map } from "lodash";

const t = inject("t");

const router = useRouter();
const userStore = useUserStore();
const roleStore = useRoleStore();
const coreStore = useCoreStore();
const { roles } = storeToRefs(roleStore);
const { users, isUsersLoading, isUserLoading, total, filters } =
  storeToRefs(userStore);

const isDialogVisible = ref(false);
const selectedUser = ref(null);
const errorMessage = ref("");
const showSnackbar = inject("showSnackbar");

const transRoles = computed(() =>
  map(roles.value, (role) => {
    return { ...role, name: t(`${role?.name}`) };
  })
);
const { enums } = storeToRefs(coreStore);

const headers = ref([
  {
    title: t("Avatar"),
    sortable: false,
    key: "avatar",
    filtervalue: "",
    filterable: false,
    typefilter: "text",
  },
  {
    title: t("Nom"),
    sortable: true,
    key: "name",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Email"),
    sortable: true,
    key: "email",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Role"),
    sortable: false,
    key: "roles",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    selectvalue: transRoles,
    itemKey: "id",
    itemTitle: "name",
  },
  {
    title: t("is_active"),
    sortable: true,
    key: "auth_status",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  // {
  //   title: t("Date"),
  //   sortable: true,
  //   key: "created_at",
  //   filtervalue: "",
  //   filterable: true,
  //   typefilter: "date",
  // },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

onMounted(() => {
  if (isEmpty(roles.value)) roleStore.getRoles();
  userStore.getDTUsers();
});

function changeFilter(...obj) {
  userStore.getDTUsers(...obj);
}

function openModal(item = null) {
  selectedUser.value = item;
  isDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  errorMessage.value = null;
  selectedUser.value = null;
}

async function SubmitEvent() {
  const { statusCode, data } = await userStore.deleteUser(
    selectedUser.value?.id
  );

  if (statusCode == 200) {
    closeModal();
    showSnackbar(t("Deleted ok"), { color: "success" });
    userStore.getDTUsers();
  } else if (statusCode == 403) {
    closeModal();
    showSnackbar(t(data.message), { color: "error" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
    errorMessage.value = data?.message;
  }
}

onBeforeUnmount(async () => {
  userStore.reset("users");
});

async function editUser(item, isViewMode = false) {
  await router.push({
    name: "settings-users-form-user-action-user?",
    params: {
      action: isViewMode ? "show" : "edit",
      user: item.id,
    },
  });
}
async function addUser() {
  await router.push({
    name: "settings-users-form-user-action-user?",
    params: {
      action: "add",
    },
  });
}
</script>
