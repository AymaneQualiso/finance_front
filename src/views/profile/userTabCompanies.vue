<template>
  <VRow>
    <VCol cols="12">
      <VCard >
        <VCardText>
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">
                  {{ t('company.table.company') }}
                </th>
                <th class="text-center">
                  {{ t('company.table.if') }}
                </th>
                <th class="text-center">
                  {{ t('company.table.ice') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in companiesData"
                :key="idx"
                v-if="companiesData.length > 0"
              >
                <td>{{ item.label }}</td>
                <td class="text-center">
                  {{ item.idf }}
                </td>
                <td class="text-center">
                  {{ item.ice }}
                </td>
              </tr>
              <tr v-else>
                <td colspan="3">
                  <div class="d-flex justify-center mt-4">
                    Données non disponibles
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup>
const props = defineProps({
  companiesData: {
    type: Object,
    required: true,
  },
})

const t = inject("t");
const showSnackbar = inject("showSnackbar");
</script>
