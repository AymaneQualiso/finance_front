<template>
  <div :class="{'fixed-header-scroll-horizontal-table': scrollTableHorizontalWithTwoFixedColumnInHeader}">
  <VDataTableServer
    v-model="selected"
    :item-value="selectedKey"
    class="px-6 pb-6 dataTableCore"
    :class="{ 
      'fixed-header-table': scrollTableWithFixedHeader,
      'fixed-header-table-forpaymentdelay': scrollTableWithFixedHeaderForPaymentDelay
    }"
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
        :style="scrollTableWithFixedHeader || scrollTableWithFixedHeaderForPaymentDelay ? { backgroundColor: 'rgba(var(--v-theme-surface))' } : null"
          @close-chip="changeFilterFromTags"
      />
      
      <!-- :style="scrollTableWithFixedHeader 
          ? { backgroundColor: theme === 'light' ? '#ffffff' : '#2f3349' }
          : null" -->
      <tr>
        <th
          v-if="showSelect"
          style="max-inline-size:30px; padding-inline-start: 10px"
          :style="scrollTableWithFixedHeader ? { backgroundColor: 'rgba(var(--v-theme-surface))' } : null"
          :class="{
            'sticky-header': scrollTableWithFixedHeader,
            'fix-col': scrollTableWithFixedHeader,
          }"
        >
          <VCheckbox
            :model-value="allSelected"
            :indeterminate="someSelected"
            @click="selectAll(!allSelected)"
            :class="{
            'fix-col': scrollTableWithFixedHeader,
          }"
          />
        </th> 
        <template
          v-for="(column, key) in localHeader"
          :key="column.key"
          :class="{'fix-col': [0, 1].includes(key) && scrollTableWithFixedHeader}"
        >
          <th
            :class="{
              'alnright': column.isNumber || column.isDouble,
              'sticky-header': scrollTableWithFixedHeader,
              'fix-col': [0, 1].includes(key)
            }"
            nowrap
          >
          <!-- <th
            :class="{'alnright': column.isNumber || column.isDouble}"
            nowrap
            :class="'sticky-header': scrollTableWithFixedHeader"
          > -->
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
  </div>
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
  scrollTableHorizontalWithTwoFixedColumnInHeader: {//this props is used when you are already using props 'scrollTableWithFixedHeader'
    type: Boolean,
    default: false,
  },
  scrollTableWithFixedHeaderForPaymentDelay: {
    type: Boolean,
    default: false,
  }
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
// .add-padding {
//   tbody > tr:last-child > td  {
//     padding-top: 15px !important;
//     padding-bottom: 120px !important;
//   }
// }

table > tbody > tr > td:last-child,
table > thead > tr > th:last-child {
  position: sticky !important;
  background-color: rgb(var(--v-theme-surface));
  inset-inline-end: 0;
}

tbody:not(:has(tr:nth-child(3))) > tr:last-child > td {
  padding-block: 15px !important;
}

table > thead > tr > th:last-child {
  z-index: 100;
}

.dataTableCore {
  .v-data-table__td {
    /* Hide the overflow content */
    overflow: hidden;

    /* Set a maximum width for the container */
    max-inline-size: 300px;

    /* Display an ellipsis (...) when text overflows */
    text-overflow: ellipsis;

    /* Prevent the text from wrapping to the next line */
    white-space: nowrap;

  }
}
.alnright { text-align: end !important; }
.alnright-padd { padding-inline-end: 20px; }
.fixed-header-table {
  max-height: 500px; /* Adjust as needed */
  overflow-y: auto;
}

.fixed-header-table-forpaymentdelay{
  max-height: 700px !important;
  overflow-y: auto;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 998;
  background: white; /* Ensures header stays visible */
  border-bottom: 2px solid #e0e0e0; /* Optional: adds a divider for the header */
}

// table > tbody > tr > td:nth-child(1),
// table > tbody > tr > td:nth-child(2)
// // table > tbody > tr > td:nth-child(3),
// {
// // table > thead > tr > th:nth-child(3){
//   position: sticky !important;
//   background-color: rgb(var(--v-theme-surface));
//   inset-inline-start: 0;
//   z-index: 998;
// }
// table > thead > tr > th:nth-child(1),
// table > thead > tr > th:nth-child(2)
// {
// // table > thead > tr > th:nth-child(3){
//   position: sticky !important;
//   background-color: rgb(var(--v-theme-surface));
//   inset-inline-start: 0;
//   z-index: 9999 !important;
// }
.fixed-header-scroll-horizontal-table {
  .v-table--fixed-header > .v-table__wrapper > table > thead{
    z-index: 9999 !important;
  }
  
  /* Sticky for the first 3 <th> elements */
  table > thead > tr > th:nth-child(1),
  table > tbody > tr > td:nth-child(1) {
    position: sticky;
    left: 0 !important;
    background-color: rgb(var(--v-theme-surface));
    z-index: 999 !important;
  }

  table > thead > tr > th:nth-child(2),
  table > tbody > tr > td:nth-child(2) {
    position: sticky;
    left: 48px !important;
    background-color: rgb(var(--v-theme-surface));
    z-index: 999 !important;
  }

  table > thead > tr > th:nth-child(3),
  table > tbody > tr > td:nth-child(3) {
    position: sticky;
    left: 181px !important;
    background-color: rgb(var(--v-theme-surface));
    z-index: 999 !important;
  }
  table > thead > tr > th:nth-child(4),
  table > tbody > tr > td:nth-child(4) {
    padding-left: 1.5em !important;
  }
}
</style>
