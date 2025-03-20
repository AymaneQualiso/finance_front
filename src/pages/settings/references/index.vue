<template>
  <VCard
    class=""
    :title="$t('Referrals')"
    :loading="isLoading"
    :disabled="isLoading"
    v-if="$can('references.index')"
  >
    <template #append>
      <VBtn
        variant="tonal"
        color="info"
        class="me-3"
        @click="getReferences"
        v-if="$can('references.refresh')"
      >
        <VIcon icon="tabler-refresh" />
        <VTooltip activator="parent" location="top">
          {{ t("refresh") }}
        </VTooltip>
      </VBtn>
      <VBtn
        v-if="$can('references.update')"
        color="primary"
        @click="updateReferences"
      >
        {{ t("Save") }}
      </VBtn>
    </template>
    <template #text>
      <VTable>
        <thead>
          <tr class="fw-bolder fs-7 text-gray-600">
            <th>document</th>
            <th width="300">
              {{ t("value") }}
            </th>
            <th>{{ t("reset") }}</th>
            <th>{{ t("example") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(config, index) in referenceConfigs" :key="index">
            <td>{{ t(config?.model) }}</td>
            <td>
              <AppTextField
                v-model="config.value"
                placeholder="VALUE"
                @blur="blurValueHandler($event, config)"
              />
            </td>
            <td>
              <VSelect
                v-model="config.reset"
                item-title="option"
                item-value="abbr"
                :items="[
                  { option: 'none', abbr: 'none' },
                  { option: 'month', abbr: 'm' },
                  { option: 'year', abbr: 'y' },
                ]"
                :disabled="isResetDisabled(config?.value, config)"
              />
            </td>
            <th>{{ getExample(config?.value) }}</th>
          </tr>
        </tbody>
      </VTable>
    </template>
  </VCard>
</template>

<script setup>
import { useApi } from "@/composables/useApi";
import { cloneDeep } from "lodash";

const referenceConfigs = ref([]);
const isLoading = ref(false);
const showSnackbar = inject("showSnackbar");
const t = inject("t");

async function getReferences() {
  isLoading.value = true;

  const { data, statusCode } = await useApi(`references`).get();

  referenceConfigs.value = data.value?.data;
  isLoading.value = false;
}

function getExample(valueConfig) {
  if (valueConfig == null) {
    return;
  }
  let value = valueConfig;
  let twoDigitYearIsIncluded = value.includes("{yy}");
  let fourDigitYearIsIncluded = value.includes("{yyyy}");
  let twoDigitMonthIsIncluded = value.includes("{mm}");

  if (twoDigitYearIsIncluded) {
    const dateString = new Date().getFullYear().toString();
    const twoDigityear = dateString.substring(dateString.length - 2);

    value = value = value.replace("{yy}", twoDigityear);
  }
  if (fourDigitYearIsIncluded) {
    value = value.replace("{yyyy}", new Date().getFullYear().toString());
  }
  if (twoDigitMonthIsIncluded) {
    const currentDate = new Date();
    let currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    value = value.replace("{mm}", currentMonth);
  }

  if (value.match(/\{\d+\}/)) {
    let matchedValue = value.match(/\{\d+\}/)?.[0]?.match(/\d+/);
    value = value.replace(/\{\d*\}/, matchedValue);
  }

  return value;
}

async function updateReferences() {
  isLoading.value = true;

  const payload = { references: cloneDeep(referenceConfigs.value) };

  const { data, statusCode } = await useApi(
    `references/config-references`
  ).post(payload);

  if (statusCode.value == 200) {
    referenceConfigs.value = cloneDeep(data.value?.data);
    showSnackbar(t("references updated with successfully"), {
      color: "success",
    });
  } else {
    showSnackbar(t("error updating"), { color: "error" });
  }
  isLoading.value = false;
}

function blurValueHandler(e, config) {
  if (
    (e.target.value.includes("{yy}") || e.target.value.includes("{yyyy}")) &&
    !e.target.value.includes("{mm}")
  ) {
    config.reset = "y";
  }
  if (
    !e.target.value.includes("{yy}") &&
    !e.target.value.includes("{yyyy}") &&
    e.target.value.includes("{mm}")
  ) {
    config.reset = "m";
  }
}

function isResetDisabled(value, config) {
  if (value != null) {
    if (
      !value.includes("{yy}") &&
      !value.includes("{yyyy}") &&
      !value.includes("{mm}")
    ) {
      config.reset = "none";

      return true;
    }

    return false;
  }
}

onMounted(() => {
  getReferences();
});
</script>
