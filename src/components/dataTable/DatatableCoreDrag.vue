<template>
  <VDataTableServer
    v-model="selected"
    :item-value="selectedKey"
    class="px-6 pb-6 dataTableCore"
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
    fixed-header
    no-data-text="Données non disponibles"
    @update:options="loadItems"
  >
    <!-- Header Template with Sorting and Filtering -->
    <template #headers="{ columns, selectAll, allSelected, someSelected, isSorted, getSortIcon, toggleSort }">
      <DataTableFilterTags
        v-if="filter && showFilters"
        :columns="columns"
        :filter="filter"
        :headers="localHeader"
        @close-chip="changeFilterFromTags"
      />
      
      <tr>
        <th
          v-if="showSelect"
          style="max-inline-size:30px"
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
            :class="{'alnright': column.isNumber || column.isDouble}"
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
   
    <!-- Drag-and-Drop Row Template -->
    <template #item="{ item, index }">
    

      <tr
        :key="index"
        :draggable="!props.isViewMode" 
        @dragstart="!props.isViewMode ? handleDragStart(index) : null"
        @dragover.prevent="!props.isViewMode ? handleDragOver : null"
        @drop="!props.isViewMode ? handleDrop(index) : null"
      >
        <td style="display: flex;padding-block: 0 !important;">
          <VCheckbox  
            v-if="showSelect"
            :model-value="selected.includes(item[selectedKey])"
            @update:model-value="(isChecked) => handleSelection(isChecked, item[selectedKey])"
            style="margin-top: auto; margin-bottom: auto"
          />
          <div style="height:100%; display: flex;" >
          <span v-if="!props.isViewMode " class="drag-handle" style="margin-top: auto;margin-bottom: auto;">
            <VIcon icon="tabler-arrows-move" color="primary" class="drag-handler" />
          </span>
        </div>
        </td>
        <td>

          
          {{ item.label }}
        </td>
        <td><StatusChip :title="item.is_active" /></td>
     
        <td>
          <!-- <div v-if="!props.isViewMode" class="d-flex gap-2 justify-end">           
             <VIcon icon="tabler-eye" color="primary" @click="viewStandar(item)" />
            <VIcon icon="tabler-edit" color="primary" @click="editStandar(item)" />
            <VIcon icon="tabler-trash" color="red" @click="showDeleteDialog(item)" />
          </div> -->
          <div class="d-flex gap-2 justify-end">
  <TooltipIcon 
    v-if="props.isViewMode && $can(`${props.modelName}.show`)" 
    icon="tabler-eye" 
    color="primary" 
    @click="viewStandar(item)" 
    :tooltip-text="$t('show')"

  />
  
  <div class="d-flex gap-2 justify-end" v-else  >
    <TooltipIcon icon="tabler-eye" :tooltip-text="$t('show')" color="primary" @click="viewStandar(item)" v-if="$can(`${props.modelName}.show`)"  />
    <TooltipIcon icon="tabler-edit" :tooltip-text="$t('edit')" color="primary" @click="editStandar(item)"    v-if="item.is_active !== 'Inactive' && $can(`${props.modelName}.update`)" />
    <TooltipIcon icon="tabler-trash" :tooltip-text="$t('delete')" color="error" @click="showDeleteDialog(item)"   v-if="item.is_active !== 'Inactive' && $can(`${props.modelName}.destroy`)"  />
  </div>
</div>

          </td>
      </tr>
    </template>
  </VDataTableServer>
</template>

<script setup>
import { VDataTableServer } from "vuetify/labs/VDataTable"
import { map as _map } from "lodash"
import { onMounted } from 'vue';
import axios from 'axios';
import { getToken } from "@/services/JwtService";


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
   editStandar: Function, 
  viewStandar: Function,
  showDeleteDialog: Function,
    isViewMode: Boolean, 
      is_active_check: { 
    type: Boolean,
    default: true,
  },
  modelName: {
    type: String,
    required: true
  }
});


const emits = defineEmits(["changeFilter", "selectedAll", "update:items","update:order"])
const localHeader = ref(props.headers)
const isActiveFilter = ref("")
const selected = defineModel()
const isChanged = ref(false)
const items = ref([...props.items])
const draggedItemIndex = ref(null)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

watch(
  () => props.items,
  (newItems) => {
    items.value = [...newItems];
  },
  { immediate: true } 
);



function handleDragStart(index) {
  draggedItemIndex.value = index
}

const handleSelection = (isChecked, key) => {
  if (isChecked) {
    if (!selected.value.includes(key)) {
      selected.value.push(key);
    }
  } else {
    selected.value = selected.value.filter((selectedKey) => selectedKey !== key);
  }
};


function handleDrop(index) {
  if (Array.isArray(items.value)) {
    const itemsCopy = [...items.value];
    const draggedItem = itemsCopy.splice(draggedItemIndex.value, 1)[0];
    itemsCopy.splice(index, 0, draggedItem);
    items.value = itemsCopy;
    items.value = items.value;
    draggedItemIndex.value = null;

    const newOrder = items.value.map(item => item.id);
    emits("update:order", newOrder); 
  }
}


// Function to handle pagination, sorting, and loading
function loadItems({ page, itemsPerPage, sortBy }) {
  const obj = []
  if (sortBy[0]) {
    obj["sort_key"] = sortBy[0].key
    obj["order"] = sortBy[0].order
    isChanged.value = true
  } else {
    obj["sort_key"] = ""
    obj["order"] = ""
  }
  obj["per_page"] = itemsPerPage
  obj["page"] = page
  if ((itemsPerPage > 10 && props.per_page != itemsPerPage) || page > 1)
    isChanged.value = true
  if (isChanged.value)
    emits("changeFilter", obj)
}

async function changeFilterFromTags(keys) {
  _map(localHeader.value, el => {
    if (keys.includes(el.key)) {
      el.filtervalue = ["range", "date"].includes(el.typefilter) ? { start: '', end: '' } : ""
    }
  })
  const arr = keys.map(key => ({ [key]: "" }))
  emits("changeFilter", ...arr)
}

function changeFilter(...obj) {
  emits("changeFilter", ...obj)
}
</script>

<style lang="scss">
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
    overflow: hidden;
    max-inline-size: 300px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.alnright { text-align: end !important; }
.alnright-padd { padding-inline-end: 20px; }

/* Drag Handle Style */
.drag-handle {
  cursor: move;
  margin-right: 20px;
  display: inline-flex;
  align-items: center;
}
</style>
