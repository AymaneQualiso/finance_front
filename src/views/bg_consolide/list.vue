<template>
  <insertBgConsolid
    v-model:is-insert-bgConsolides-dialog-shown="isInsertbgConsolidesDialogShown"
    v-model:data="currentBgConsolide"
    @update:is-insert-bg-consolide-dialog-shown="isInsertbgConsolidesDialogShown = $event"
    />

  <VCard :title="$t('bg_consolides')" v-if="$can('bg_consolides.index')">
    <template #append>
      <VBtn 
        v-if="$can('bg_consolides.store')" 
        color="primary" 
        @click="openModal()"
        :disabled="!chartAccounts.length"
      >
        {{ $t("Add") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="bgConsolides"
      :total="total"
      :per_page="10"
      :is-loading="isLoadingBgConsolide"
      :filter="filter"
      @change-filter="changeFilter"
      :show-select="$can('bg_consolides.export')"
      :page="page"
    >
      <template #item.label="{ item }">
        <VTooltip>
          <template #activator="{ props }">
            <span v-bind="props" class="truncate" :title="item.label">
              {{ item.label }}
            </span>
          </template>
          <span>{{ item.label }}</span>
        </VTooltip>
      </template>
      <template #item.status="{ item }">
        <StatusChip 
          :title="item.status"
          :color="getBalanceStatusColor(item.status)"
          :text-color="white"
        />
      </template>
      <template #item.bg_consolide_companies="{ item }">
        <div class="d-flex justify-start gap-3">
          <VChip
            v-for="(bcc, index) in item?.bg_consolide_companies?.slice(0, 3)"
            :key="index"
            color="primary"
          >
            <span>
              {{ bcc.label }}
            </span>
          </VChip>
          <VChip v-if="item?.bg_consolide_companies?.length > 3" color="primary" class="ml-2"
            >...</VChip
          >
        </div>
      </template>
  
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('bg_consolides.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="editBalance(item)"
          />
          
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>
<script setup>
import insertBgConsolid from "./insertBgConsolid.vue"
import { useBgConsolide } from "@/composables/bgConsolide.js";
import { onMounted } from "vue";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const {
  router,
  selected,
  headers,
  isInsertbgConsolidesDialogShown,
  isExportingBgConsolide, 
  isLoadingBgConsolide, 
  currentBgConsolide, 
  bgConsolides, 
  chartAccounts,
  total, 
  filter,
  openModal,
  changeFilter,
  getBalanceStatusColor,
  getData
} = useBgConsolide(t, showSnackbar);

onMounted(async () => {
  await getData();
});

function editBalance(item) {
  router.push({ name: "bg-consolide-details", params: { id: item.id }, query: { mode: 'edit' } });
}

onBeforeUnmount(() => {
  bgConsolides.value = []
})
</script>
