<template>
  <VDialog v-model="isDeleteDialogVisible" persistent max-width="600">
    <DialogCloseBtn :disabled="isLockdownLoading" @click="closeModal" />
    <VCard
      title="Confirmer"
      :loading="isLockdownLoading"
      :disabled="isLockdownLoading"
    >
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
          :disabled="isLockdownLoading"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          @click="deleteLockdown"
          :disabled="isLockdownLoading"
          :loading="isLockdownLoading"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isLockdownLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t(dialogTitle)"
      :loading="isLockdownLoading"
      :disabled="isLockdownLoading"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <!-- <AppCombobox
              v-model="lockdownForm.locked"
              :label="$t('locked')"
              :placeholder="$t('locked')"
              :items="[
                { label: 'Oui', id: true },
                { label: 'Non', id: false },
              ]"
              item-title="label"
              item-value="id"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
            /> -->
            <span v-if="action == 'edit'">
              {{ $t("Vous voulez vraiment déverrouiller ce module ?") }}
            </span>
            <span v-if="action == 'open'">
              {{ $t("Vous voulez vraiment re-ouvrir cette Balance ?") }}
            </span>
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ t("Cancel") }}
        </VBtn>
        <VBtn @click="SubmitEvent" v-if="action !== 'show'">
          {{ t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard class="" :title="$t('lockdowns')" v-if="$can('lockdowns.index')">
    <template #append>
      <!-- <VBtn
        color="primary"
        @click="openModal('add')"
        v-if="$can('lockdowns.store')"
      >
        {{ $t("add") }}
      </VBtn> -->
    </template>

    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="lockdowns"
      :total="total"
      :per_page="10"
      :is-loading="isLockdownsLoading"
      :filter="filters"
      @change-filter="changeFilter"
    >
      <template #item.locked="{ item }">
        <StatusChip :title="item.locked ? 'oui' : 'non'" />
      </template>
      <template #item.lockdownable_name="{ item }">
          <span v-tooltip="item.lockdownable_name">{{ item.lockdownable_name }}</span>
        </template>
      <template #item.lockdownable_type="{ item }">
        {{ $t(item.lockdownable_type ?? "") }}
      </template>
      <template #item.date_locked="{ item }">
        {{ newformatDateWithHourAndMinute(item.date_locked) }}
      </template>
      <template #item.user="{ item }">
        <VChip
          v-if="item.user"
          :key="item.user?.id"
          color="primary"
          class="me-1"
        >
          <span>
            {{ item.user?.name }}
          </span>
        </VChip>
      </template>
      <template #item.actions="{ item }">

        <div class="d-flex justify-end gap-3" >
          <!-- <TooltipIcon
            v-if="$can('lockdowns.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="handleEditItem(item, true)"
          /> -->

          <TooltipIcon
            v-if="$can('lockdowns.update') && item.locked"
            :tooltip-text="$t('unlock')"
            icon="tabler-lock-open-2"
            color="primary"
            @click="handleEditItem(item)"
          />
          <TooltipIcon
            v-if="
              $can('lockdowns.update') &&
              item.lockdownable_type == 'Balancesheethead'  &&
              item.lockdownable.status == 'Validée' && !item.locked
            "
            :tooltip-text="$t('reopen')"
            icon="tabler-folder-open"
            color="warning"
            @click="handleBalanceOpeningIfValidated(item)"
          />
         
          <!-- <TooltipIcon
            v-if="$can('lockdowns.destroy')"
            :tooltip-text="$t('SetUSerMd.delete')"
            icon="tabler-trash"
            color="error"
            @click="openDeleteModal(item)"
          /> -->
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { isEmpty } from "@/@core/utils/helpers";
import { useApi } from "@/composables/useApi";
import { useCoreStore, useLockdownStore, useUserStore } from "@/stores";

definePage({ meta: { navActiveLink: "settings-lockdowns" } });

const t = inject("t");

const coreStore = useCoreStore();
const lockdownsStore = useLockdownStore();
const usersStore = useUserStore();
const { users: usersData } = storeToRefs(usersStore);
const selected = ref([]);
const { enums } = storeToRefs(coreStore);
const {
  lockdowns,
  users,
  isLockdownsLoading,
  isLockdownLoading,
  total,
  filters,
  modulesData,
} = storeToRefs(lockdownsStore);

const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const selectedLockdown = ref(null);
const action = ref("");
const lockdownForm = ref({
  locked: false,
  lockdownable_id: null,
});
const errorMessages = ref({
  label: null,
});
const showSnackbar = inject("showSnackbar");

const dialogTitle = computed(() => {
  return selectedLockdown.value
    ? action.value == "edit"
      ? "unlock"
      : "reopen"
    : "New Verouillage";
});

const translatedData = computed(() => {
  if (
    !modulesData.value ||
    !Array.isArray(modulesData.value) ||
    modulesData.value.length === 0
  ) {
    console.warn("translatedData: modulesData is empty or not an array.");
    return [];
  }

  return modulesData.value.map((row) => ({
    key: row.key,
    title: t(row.lockdownable_type),
  }));
});

const headers = ref([
  {
    title: t("module"),
    sortable: true,
    key: "lockdownable_type",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    selectvalue: translatedData,
    // selectvalue: getTranslate(modulesData, 'key', 'lockdownable_type', t),
    itemKey: "key",
    itemTitle: "title",
  },
  {
    title: t("label-type"),
    sortable: true,
    key: "lockdownable_name",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("locked"),
    sortable: true,
    key: "locked",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isLockedString, t),
  },
  {
    title: t("user"),
    sortable: true,
    key: "user",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("date"),
    sortable: true,
    key: "date_locked",
    filterable: true,
    typefilter: "date",
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

onMounted(async () => {
  await lockdownsStore.getDTlockdowns();
  if (isEmpty(usersData.value)) usersStore.getDTUsers();
  if (isEmpty(modulesData.value)) lockdownsStore.getModulesData();
});

function handleEditItem(item, isShow = false) {
  // open modal with pre-filled data
  lockdownForm.value = { ...item };
  lockdownForm.value.locked = false;
  if (isShow) {
    return openModal("show", item);
  }
  openModal("edit", item);
}

function handleBalanceOpeningIfValidated(item) {
  openModal("open", item);
}

function openModal(actionName, item = null) {
  action.value = actionName;
  selectedLockdown.value = item;
  isDialogVisible.value = true;
}

function openDeleteModal(item) {
  selectedLockdown.value = item;
  isDeleteDialogVisible.value = true;
}

function changeFilter(...obj) {
  lockdownsStore.getDTlockdowns(...obj);
}

function closeModal() {
  isDialogVisible.value = false;
  isDeleteDialogVisible.value = false;
  lockdownForm.value = {
    locked: false,
    lockdownable_id: null,
  };
  errorMessages.value = {
    locked: false,
    lockdownable_id: null,
  };
  action.value = "";
  selectedLockdown.value = null;
}

async function SubmitEvent() {
  let statusCode, data;
  if (action.value === "edit") {
    ({ statusCode, data } = await lockdownsStore.updateLockdown(
      selectedLockdown.value.id,
      lockdownForm.value
    ));
  } else if (action.value === "open") {
    ({ statusCode, data } = await lockdownsStore.reOpenBalance(
      selectedLockdown.value.id
    ));
  } else {
    ({ statusCode, data } = await lockdownsStore.addLockdown(
      lockdownForm.value,
      action.value !== "add"
    ));
  }

  if (statusCode == 201 || statusCode == 200) {
    lockdownsStore.getDTlockdowns();
    showSnackbar(t("Verouillage modifié avec succès."), { color: "success" });
    closeModal();
  } else {
    showSnackbar(t("error") + data?.message ?? t("try again later"), {
      color: "error",
    });
  }
}
onBeforeUnmount(async () => {
  await lockdownsStore.reset("lockdowns");
});

async function deleteLockdown() {
  const { statusCode, data } = await lockdownsStore.deleteLockdown(
    selectedLockdown.value.id
  );

  if (statusCode == 204) {
    closeModal();
    showSnackbar(t("Deleted ok"), { color: "success" });
    lockdownsStore.getDTlockdowns();
  } else if (statusCode == 403) {
    closeModal();
    showSnackbar(t(data.message), { color: "error" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }
}
</script>

<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
