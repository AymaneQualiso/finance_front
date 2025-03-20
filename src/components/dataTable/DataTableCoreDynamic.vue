<template>
  <VDataTableServer
    v-model="selected"
    :item-value="selectedKey"
    class="px-6 pb-6 dataTableCore"
    :class="{ 'fixed-header-table': scrollTableWithFixedHeader }"
    :headers="localHeader"
    :items="items"
    :items-length="total"
    :items-per-page-options="[
      { value: 10, title: '10' },
      { value: 25, title: '25' },
      { value: 50, title: '50' },
      { value: 100, title: '100' },
    ]"
    :items-per-page="per_page"
    :show-select="showSelect"
    :itemsPerPageText="$t('itemsPerPageText')"
    :loadingText="$t('loading_items')"
    fixed-header
    no-data-text="Données non disponibles"
    @update:options="loadItems"
  >
    
    <template #headers="{ columns, selectAll, allSelected, someSelected, isSorted, getSortIcon, toggleSort }">
      <DataTableFilterTags
        v-if="filter && showFilters"
        :columns="columns"
        :filter="filter"
        :headers="localHeader"
        @close-chip="changeFilterFromTags"
        :style="scrollTableWithFixedHeader ? { backgroundColor: 'rgba(var(--v-theme-surface))' } : null"
      />
      <tr>
        <th
          v-if="showSelect"
          style="max-inline-size:30px; padding-inline-start: 10px"
          :style="scrollTableWithFixedHeader ? { backgroundColor: 'rgba(var(--v-theme-surface))' } : null"
        >
          <VCheckbox
            :model-value="allSelected"
            :indeterminate="someSelected"
            @click="selectAll(!allSelected)"
          />
        </th> 
        <template
          v-for="(column, key) in localHeader"
          :key="column.key"
        >
          <th
            :class="{
              'alnright': column.isNumber || column.isDouble,
              'sticky-column': key === 2 || key === 1, // Fixed columns
              'sticky-header': scrollTableWithFixedHeader
            }"
            :style="getColumnStyle(key)"
            nowrap
          >
            <span
              class="me-5"
              :class="column.sortable ? 'cursor-pointer' : ''"
              @click="column.sortable ? toggleSort(column) : ''"
            >
              {{ column.title }}
            </span>
            <template v-if="column.sortable && isSorted(column)">
              <VIcon :icon="getSortIcon(column)" />
            </template>
            <DataTableFilter
              v-if="showFilters"
              :column="column"
              :is-active-filter="isActiveFilter"
              :position="key <= 4 ? 'left' : 'right'"
              @change-filter="changeFilter"
              @active-filter="(e) => (isActiveFilter = e)"
            />
          </th>
        </template>
      </tr>
      <tr>
        <td
          colspan="1000"
          style="block-size: 2px;"
        >
          <VProgressLinear
            v-if="isLoading"
            color="primary"
            rounded
            indeterminate
            height="2"
          />
        </td>
      </tr>
    </template>
    
    <template
      v-for="(_, name) in $slots"
      #[name]="{ item }"
    >
      <slot
        :name="name"
        :item="item"
      />
    </template>
  </VDataTableServer>
</template>

<script setup>
import { map as _map } from "lodash"
import { VDataTableServer } from "vuetify/labs/VDataTable"
import { useConfigStore } from '@/@core/stores/config';

const confStore = useConfigStore();
const { theme } = storeToRefs(confStore)
const props = defineProps({
  headers: Array,
  items: Array,
  total: Number,
  per_page: Number,
  isLoading: Boolean,
  filter: Object,
  showSelect: {
    type: Boolean,
    default: false,
  },
  selectedKey: {
    type: String,
    default: 'id',
  },
  showFilters: {
    type: Boolean,
    default: true,
  },
  scrollTableWithFixedHeader: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(["changeFilter", "selectedAll"])
const localHeader = ref(props.headers)
const isActiveFilter = ref("")
const selected = defineModel()
const isChanged = ref(false)

function loadItems({ page, itemsPerPage, sortBy }) {
  const obj = []
  if (sortBy[0]) {
    obj["sort_key"] = sortBy[0].key
    obj["order"] = sortBy[0].order
    isChanged.value = true
  }else {
    obj["sort_key"] = ""
    obj["order"] = ""
  }
  obj["per_page"] = itemsPerPage
  obj["page"] = page
  if((itemsPerPage > 10 && props.per_page != itemsPerPage)|| page > 1)
    isChanged.value = true
  if(isChanged.value)
    emits("changeFilter", obj)
}

function getColumnStyle(key) {
  const leftOffsets = [0, 100]; // Adjust for fixed columns
  return key === 0
    ? { position: 'sticky', left: '0px', zIndex: 2, backgroundColor: 'rgba(var(--v-theme-surface))', textAlign: 'left' }
    // : key === 1
    // ? { position: 'sticky', left: '100px', zIndex: 2, backgroundColor: 'rgba(var(--v-theme-surface))', textAlign: 'left' }
    : {};
}

async function changeFilterFromTags(keys) {
  _map(localHeader.value, el => {
    if (keys.includes(el.key)) {
      el.filtervalue = ["range", "date"].includes(el.typefilter) ? { start: '', end: '' } : ""
    }
  })

  const arr = keys.map(key => {
    return { [key]: "" }
  })

  emits("changeFilter", ...arr)
}

function changeFilter(...obj) {
  emits("changeFilter", ...obj)
}
</script>

<style lang="scss">
.dataTableCore {
  .v-data-table__td {
    overflow: hidden;
    max-inline-size: 300px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// .fixed-header-table {
//   max-height: 500px;
//   overflow-y: auto;
// }

// .sticky-header {
//   position: sticky;
//   top: 0;
//   z-index: 10;
//   background: rgb(var(--v-theme-surface));
//   border-bottom: 2px solid #e0e0e0;
// }

/* Sticky behavior for the 1st column (Account) */
table > thead > tr > th:nth-child(1),
table > tbody > tr > td:nth-child(1) {
  position: sticky;
  left: 0px !important; /* Fixed position for the 1st column */
  z-index: 10; /* Ensure it stays above other content */
  background: rgb(var(--v-theme-surface)); /* Match the table's background */
  text-align: left;
}

/* Sticky behavior for the 2nd column */
table > thead > tr > th:nth-child(2),
table > tbody > tr > td:nth-child(2) {
  position: sticky;
  left: 56px !important; /* Fixed position for the 2nd column */
  z-index: 9; /* Ensure it stays below the 1st column */
  background: rgb(var(--v-theme-surface)); /* Match the table's background */
  text-align: left;
}

/* Sticky behavior for the 3rd column */
table > thead > tr > th:nth-child(3),
table > tbody > tr > td:nth-child(3) {
  position: sticky;
  left: 210px !important; /* Fixed position for the 3rd column */
  z-index: 8; /* Ensure it stays below the 2nd column */
  background: rgb(var(--v-theme-surface)); /* Match the table's background */
  text-align: left;
}

// .sticky-column {
//   position: sticky;
//   z-index: 2;
//   background-color: rgb(var(--v-theme-surface));
//   box-shadow: 2px 0 2px -1px rgba(0, 0, 0, 0.1);
//   text-align: right;
// }
</style>
