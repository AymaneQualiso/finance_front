<template>
  <SendMailDialog
    v-model:is-loading-sending-email="isLoadingSendingEmail"
    v-model:send-mail-dialog-shown="sendMailDialogShown"
    v-model:send-mail-with-body="sendMailWithBody"
    v-model:label="form.label"
    @update:send-mail-dialog-shown="sendMailDialogShown = $event"
    @send-email="sendingMail"
  />
  <UploadAttachments
    :is-visible="showModalAttachments"
    :model-able="modelAble"
    model="balance_sheets_heads"
    @close="closeModalAttachments"
    @upload-file="uploadAttachment"
    @on-delete="deleteAttachment"
    @on-download="downloadAttachment"
    :with-simple-form="!isViewMode"
    :with-type="false"
    :with-form="false"
    v-model:is-loading-download="isLoadingDownload"
    v-model:is-loading-delete="isLoadingDelete"
  />
  <!-- the commented upload attachment is attachment with type -->
  <!-- <UploadAttachments
    :is-visible="showModalAttachments"
    :model-able="modelAble"
    model="balance_sheets_heads"
    @close="closeModalAttachments"
    @upload-file="uploadAttachment"
    @on-delete="deleteAttachment"
    @on-download="downloadAttachment"
    v-model:is-loading-download="isLoadingDownload"
    v-model:is-loading-delete="isLoadingDelete"
  />-->
  <VForm ref="exampleForm">
    <VCard class="fixed-card" v-click-outside="() => (show = false)">
      <template #title>
        <!-- <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t("Balance") }}</span>
        </div> -->
        <!-- </template>
      <template #append v-if="!isLoading"> -->
        <!-- <VRow class="mt-1 d-flex justify-end gap-2 my-3"> -->
        <div class="d-md-flex justify-space-between align-center w-100">
          <div class="d-flex align-center flex-wrap">
            <span class="me-2">{{ $t("Balance") }}</span>
            <VChip
              v-if="form.status"
              :color="getStatusColor(form.status)"
              :text-color="form.status === 'validee' ? 'error' : 'red darken-2'"
              style="font-size: 18px; margin-left: 5em"
            >
              {{ form.status }}
            </VChip>
          </div>

          <div
            class="d-md-flex v-row"
            style="margin: 0; justify-content: end"
            v-if="!isLoading"
          >
            <VBtn
              color="secondary"
              variant="tonal"
              class="me-2"
              @click="retourEtapePrécédente()"
              :disabled="!currentBalance?.id"
            >
              <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
            </VBtn>
            <span
              v-if="!isViewMode && $can('balances.sendMail')"
              v-tooltip="$t('send-mail-balance')"
            >
              <VBtn
                v-if="!isViewMode && $can('balances.sendMail')"
                @click="openModalSendingEmail()"
                color="primary"
                class="me-2"
              >
                <VIcon icon="tabler-mail" size="28" />
              </VBtn>
            </span>
            <!-- v-if="
                !isViewMode &&
                $can('balances.import_bg_initial') &&
                $can('balances.import_bg_initial') &&
                form.flag_provision == 1 &&
                form.company_id == authUser.company?.id
              " -->
            <span v-tooltip="$t('re-open-balance')"  
              v-if="
                !isViewMode &&(
                  $can('balances.import_bg_initial') ||
                  $can('balances.import_bg_initial') )&&
                  form.flag_provision == 1 &&
                  form.company_id == authUser.company?.id
              ">
              <VBtn
                @click="isReopenBalanceDialogVisible = true"
                color="primary"
                class="me-2"
              >
                <VIcon icon="tabler-refresh-dot" size="28" />
              </VBtn>
            </span>
            <span v-if="!isViewMode" v-tooltip="$t('productMd.attachments')">
              <VBtn
                color="info"
                :loading="isLoading"
                @click="openModalAttachments"
                class="me-2"
                v-if="!isViewMode"
              >
                <VIcon icon="tabler-file" size="28" />
              </VBtn>
            </span>

            <!-- <VBtn
          color="primary"
          :loading="isLoading"
          @click="submitForm"
          class="me-2"
          v-if="!isViewMode"
        >
          {{ $t("edit") }}
        </VBtn> -->

            <!-- <VBtn
         color="success"
         :loading="isLoading"
          @click="terminateProvisionForBalance"
          class="me-2"
           v-if=" && form.flag_provision !== 1"
           >
          {{ $t("Valide") }}
       </VBtn> -->

            <!-- <VBtn
  color="primary"
  class="me-2"
  v-if="traitementUsers.length"
  v-tooltip="`${$t('Traitement:')} ${traitementUsers.join(', ')}`"
>
  {{ $t("Person") }}
</VBtn>

<VBtn
  color="primary"
  class="me-2"
  v-if="validationUsers.length"
  v-tooltip="`${$t('Validation:')} ${validationUsers.join(', ')}`"
>
  {{ $t("People") }}
</VBtn>
 -->
            <span
              v-if="
                !isViewMode &&
                form.flag_intercompany &&
                $can('balances.destroy')
              "
              v-tooltip="$t('delete_inter_companies')"
            >
              <VBtn
                color="error"
                v-if="
                  !isViewMode &&
                  form.flag_intercompany &&
                  $can('balances.destroy')
                "
                class="me-2"
                @click="showDeleteInterCompanyConfirmation = true"
              >
                <VIcon icon="tabler-trash" size="28" />
              </VBtn>
            </span>
            <span
              v-if="
                !isViewMode &&
                form.flag_locked &&
                $can('balances.destroy') &&
                (true || ValidationAccess)
              "
              v-tooltip="$t('delete_mode')"
            >
              <VBtn
                color="error"
                v-if="
                  !isViewMode &&
                  form.flag_locked &&
                  $can('balances.destroy') &&
                  (true || ValidationAccess)
                "
                class="me-2"
                @click="showDeleteModePopUp = true"
              >
                <VIcon icon="tabler-trash" size="28" />
              </VBtn>
            </span>

            <span
              v-if="
                !isViewMode &&
                $can('lockdowns.update') &&
                form.flag_provision !== 1 &&
                (true || ValidationAccess)
              "
              v-tooltip="form.is_locked ? $t('unlock') : $t('lock')"
            >
              <VBtn
                color="warning"
                v-if="
                  !isViewMode &&
                  $can('lockdowns.update') &&
                  form.flag_provision !== 1 &&
                  (true || ValidationAccess)
                "
                @click="handleBalanceLocking"
                class="me-2"
              >
                <div v-if="form.is_locked">
                  <VIcon icon="tabler-lock-open-2" size="28" />
                </div>
                <div v-else>
                  <VIcon icon="tabler-lock" size="28" />
                </div>
              </VBtn>
            </span>
            <VBtn
              v-if="form.is_locked && form.lockdown.user_id !== authUser.id"
              :disabled="true"
            >
              <VIcon icon="tabler-lock" size="28" class="me-1" />
              {{ $t("locked by") }} {{ form.lockdown?.locker_name }}
              {{ $t("at") }}
              {{
                new Date(form.lockdown?.date_locked).toLocaleDateString("fr-FR")
              }}
            </VBtn>
          </div>
        </div>
      </template>
      <!-- </VRow> -->

      <VCardText>
        <div class="v-row">
          <!-- Label Field -->
          <div class="v-col-md-3 v-col-sm-4 v-col-xs-1 mb-1">
            <VTextField
              v-model="form.label"
              :label="t('Balance Label')"
              :placeholder="t('Balance Label')"
              :readonly="true"
            />
          </div>
          <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
            <VTextField
              v-model="form.reference"
              :label="t('Reference')"
              :placeholder="t('Reference')"
              :readonly="true"
            />
          </div>
          <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
            <VCombobox
              :label="$t('periodicity')"
              v-model="form.period_type_id"
              :placeholder="t('periodicity')"
              :items="periodTypes"
              item-value="id"
              item-title="label"
              readonly
            />
          </div>

          <div class="v-col-md-3 v-col-sm-4 v-col-xs-1 mb-1">
            <VCombobox
              :label="$t('accounting-plan')"
              v-model="form.chartaccount_id"
              :placeholder="t('accounting-plan')"
              :items="chartAccounts"
              item-value="id"
              item-title="label"
              readonly
            />
          </div>

          <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
            <TooltipIcon
              v-if="traitementUsers.length"
              class="me-2 mx-2"
              :tooltip-text="`${$t('Traitement')} : ${traitementUsers
                .map((user) => user.name)
                .join(', ')}`"
              icon="tabler-users-group"
              color="primary"
            />

            <TooltipIcon
              class="me-2 mx-2"
              v-if="validationUsers.length"
              :tooltip-text="`${$t('Validation')} : ${validationUsers
                .map((user) => user.name)
                .join(', ')}`"
              icon="tabler-user"
              color="primary"
            />
            <VBtn
              color="secondary"
              variant="tonal"
              @click="show = !show"
              class="mx-2"
            >
              <VIcon
                :icon="show ? 'tabler-chevron-up' : 'tabler-chevron-down'"
                size="28"
              />
            </VBtn>
          </div>
        </div>
        <v-expand-transition>
          <div v-show="show">
            <v-divider class="my-4"></v-divider>
            <div class="v-row mt-0">
              <!-- Creation Date Field -->
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedCreatedAt"
                  :label="t('Date BG')"
                  :placeholder="t('Select Mo')"
                  readonly
                />
              </div>
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="form.date_validate"
                  :label="t('date_validate')"
                  :placeholder="t('date_validate')"
                  readonly
                  type="date"
                  :config="{ position: 'auto right', dateFormat: 'd-m-Y' }"
                />
              </div>
              <!-- Created By Field -->
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotalBgIni67"
                  :value="formatAmount(formattedTotalBgIni67)"
                  @input="form('total_bg_ini67')"
                  :label="t('Total balance initiale 6 et 7')"
                  :placeholder="t('Total balance initiale 6 et 7')"
                  readonly
                />
              </div>
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotalBgFinal67"
                  :value="formatAmount(formattedTotalBgFinal67)"
                  :label="t('Total balance finale 6 et 7')"
                  :placeholder="t('Total balance finale classes 6 et 7')"
                  readonly
                />
              </div>
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotalBgFinal"
                  :value="formatAmount(formattedTotalBgFinal)"
                  :label="t('Total balance finale')"
                  :placeholder="t('Total balance finale classes')"
                  readonly
                />
              </div>
            </div>
            <div class="v-row">
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotal1"
                  :value="formatAmount(formattedTotal1)"
                  :label="t('Total BG initiale')"
                  :placeholder="t('Total BG initiale')"
                  readonly
                />
              </div>
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotal2"
                  :value="formatAmount(formattedTotal2)"
                  :label="t('Total BC')"
                  :placeholder="t('Total BC')"
                  readonly
                />
              </div>
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotal3"
                  :value="formatAmount(formattedTotal3)"
                  :label="t('Total FC')"
                  :placeholder="t('Total FC')"
                  readonly
                />
              </div>
              <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
                <VTextField
                  v-model="formattedTotal4"
                  :value="formatAmount(formattedTotal4)"
                  :label="t('Total Div')"
                  :placeholder="t('Total Div')"
                  readonly
                />
              </div>
            </div>
          </div>
        </v-expand-transition>
      </VCardText>
    </VCard>

    <VCard class="mt-4"
      ><!-- second-card -->
      <template #append v-if="!isLoading">
        <!--
        <VBtn
          class="me-2"
          color="primary"
          @click="openModal('add')"
          v-if="!isViewMode && canDisplayAddButton"
        >
          {{ $t("add") }}
        </VBtn>
        -->
        <!-- <VBtn
          color="primary"
          variant="tonal"
          :loading="isLoading"
          @click="openCpcModal('add')"
          v-if="!isViewMode && cpcEntetes == null && $can('cpc.store')"
          :disabled="cpcEntetes !== null"
          :style="{
            cursor: cpcEntetes !== null ? 'not-allowed' : 'pointer',
          }"
          class="me-2"
        >
          <span v-if="cpcEntetes == null"> {{ $t("create_cpc") }}</span>
        </VBtn> -->
        <VBtn
          class="me-2"
          color="primary"
          @click="exportData"
          :disabled="isDownloadingExport || balanceDetails.length === 0"
          :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
          v-if="$can('balances.export')"
        >
          {{ $t("ImportMd.Export") }}
          <VProgressCircular
            v-if="isDownloadingExport"
            indeterminate
            color="primary"
            :size="20"
            width="3"
            class="ml-2"
          />
        </VBtn>
        <VBtn
          color="primary"
          class="me-2"
          @click="openImportModal('import')"
          :loading="isLoadingImportStandard"
          :disabled="isLoadingImportStandard"
          v-if="
            !isViewMode &&
            !form.flag_bg_ini &&
            form.flag_locked &&
            $can('balances.import_bg_initial') &&
            (true || ValidationAccess)
          "
        >
          {{ $t("ImportMd.Import_bg_initiale") }}
        </VBtn>
        <VBtn
          color="primary"
          class="me-2"
          @click="openImportModalProvision('import provision')"
          v-if="
            !isViewMode &&
            form.flag_bg_ini &&
            form.flag_locked &&
            $can('balances.import_provision') &&
            (true || ValidationAccess)
          "
        >
          {{ $t("Import Provision") }}
        </VBtn>

        <VBtn
          color="primary"
          class="me-2"
          @click="openImportModalInterCompany('import intercompany')"
          v-if=" !isViewMode &&
            form.flag_validation &&
            $can('balances.import_inter') &&
            (true || ValidationAccess) &&
            !form.flag_intercompany &&
            !form.flag_bg_consolide
          "
        >
          {{ $t("Import InterSociete") }}
        </VBtn>

        <!-- <VBtn
          color="primary"
          class="me-2"
          @click="openAddModal('import')"
          :loading="isLoadingImportStandard"
          :disabled="isLoadingImportStandard"

        >
          {{ $t("ImportMd.add_provision") }}
        </VBtn> -->

        <VBtn
          color="primary"
          class="me-2"
          @click="openAddModalProvision"
          :loading="isLoadingProvision"
          :disabled="isLoadingProvision"
           v-if="
            !isViewMode &&
            form.flag_bg_ini &&
            form.flag_locked &&
            $can('balances.add_provision') &&
            (true || ValidationAccess)
          "
        
        >
          {{ $t("ImportMd.add_provision") }}
        </VBtn>

        <VBtn
          color="primary"
          :loading="isLoading"
          @click="showConfirmationprovisiontermineDialog = true"
          class="me-2"
          v-if="!isViewMode &&
            $can('balances.import_provision') &&
            form.flag_provision !== 1 &&
            form.flag_bg_ini &&
            form.flag_locked &&
            (true || ValidationAccess)
          "
        >
          {{ $t("Terminer la provision") }}
        </VBtn>
        <VBtn
          color="success"
          :loading="isLoading"
          @click="showConfirmationValidateDialog = true"
          class="me-2"
          v-if="
            !form.flag_validation &&
            form.flag_provision &&
            ValidationAccess &&
            $can('balances.valide')
          "
        >
          {{ $t("Valider") }}
        </VBtn>
        <ImportDialog
          :title="$t('ImportMd.Title', { model: t('balance detail') })"
          :is-import-dialog-visible="isImportDialogVisible"
          :export-file-link="exportFileLink"
          :isUploading="isLoadingImport"
          :example-data="exampleData"
          :fields-data="fieldsData"
          :balance-id="id"
          :required-fields="requiredFieldsData"
          :rows-error="rowsError"
          @close="isImportDialogVisible = false"
          @on-submit="handleImport"
          @remove-file="exportFileLink = null"
          :downloadExampleFile="false"
          exampleFileName="/import-template/BalanceDetails.xlsx"
          FileName="Exemplaire BG initiale.xlsx"
        />

        <ImportDialogSelect
          :title="$t('ImportMd.Title', { model: t('les provisions') })"
          :is-import-dialog-visible="isImportDialogVisibleProvision"
          :export-file-link="exportFileLink"
          :isUploading="isLoadingImport"
          :example-data="exampleData"
          :fields-data="fieldsDataProvision"
          :balance-id="id"
          :required-fields="requiredFieldsDataProvision"
          :rows-error="rowsError"
          @close="isImportDialogVisibleProvision = false"
          @onSubmit="handleImportProvision"
          @remove-file="exportFileLink = null"
          :downloadExampleFile="false"
          exampleFileName="/import-template/Exemplaire_Provisions.xlsx"
          FileName="Exemplaire Provisions.xlsx"
          :selected-id="selectedProvisionId"
        />
        <ImportDialogInterCompany
          :title="$t('ImportMd.Title', { model: t('interCompany') })"
          :is-import-dialog-visible="isImportDialogVisibleInterCompany"
          :export-file-link="exportFileLink"
          :isUploading="isLoadingImport"
          :example-data="exampleData"
          :fields-data="fieldsDataintercompany"
          :balance-id="id"
          :required-fields="requiredFieldsDataintercompnay"
          :rows-error="rowsError"
          @close="isImportDialogVisibleInterCompany = false"
          @onSubmit="importInterCompany"
          @remove-file="exportFileLink = null"
          :downloadExampleFile="false"
          exampleFileName="/import-template/BalanceDetails.xlsx"
          :exportDatainterCompany="exportDatainterCompany"
          FileName="Exemplaire Provisions.xlsx"
          :selected-id="selectedProvisionId"
        />
      </template>

      <template>
        <div>
          <!--  -->

          <VDialog v-model="showConfirmationValidateDialog" max-width="500">
            <VCard :title="$t('Confirmer la validation')">
              <!-- Dialog Content -->
              <VCardText>
                <div>
                  {{ $t("Êtes-vous sûr de vouloir valider cette balance ?") }}
                </div>
                <!-- Textarea for Comments (Hidden While Loading) -->
                <VTextarea
                  v-model="userComment"
                  :label="$t('Commentaire')"
                  outlined
                  dense
                  rows="3"
                  class="mt-4"
                  :placeholder="$t('Ajoutez un commentaire ici...')"
                />
              </VCardText>

              <!-- Action Buttons -->
              <VCardText class="d-flex justify-end flex-wrap gap-3">
                <div class="my-auto">
                  <VProgressCircular
                    v-if="loading"
                    indeterminate
                    color="primary"
                    :size="20"
                    width="3"
                    class="ml-2"
                  />
                </div>
                <!-- Annuler Button -->
                <VBtn
                  variant="tonal"
                  color="secondary"
                  :disabled="loading"
                  @click="showConfirmationValidateDialog = false"
                >
                  {{ $t("Annuler") }}
                </VBtn>
                <!-- Non Button -->
                <VBtn
                  color="error"
                  @click="handleValide(false)"
                  :disabled="loading"
                >
                  {{ $t("Non") }}
                </VBtn>
                <!-- Oui Button -->
                <VBtn
                  :disabled="loading"
                  color="primary"
                  @click="handleValide(true)"
                >
                  {{ $t("Oui") }}
                </VBtn>
              </VCardText>
            </VCard>
          </VDialog>
          <VDialog v-model="showDeleteInterCompanyConfirmation" max-width="500">
            <VCard :title="$t('Confirmer la suppression')">
              <!-- Dialog Content -->
              <VCardText>
                <div>
                  {{
                    $t(
                      "Êtes-vous sûr de vouloir supprimer les  opérations inter-sociétés de cette balance ?"
                    )
                  }}
                </div>
              </VCardText>
              <!-- Action Buttons -->
              <VCardText class="d-flex justify-end flex-wrap gap-3">
                <div class="my-auto">
                  <VProgressCircular
                    v-if="loading"
                    indeterminate
                    color="primary"
                    :size="20"
                    width="3"
                    class="ml-2"
                  />
                </div>
                <!-- Annuler Button -->
                <VBtn
                  variant="tonal"
                  color="secondary"
                  :disabled="loading"
                  @click="showDeleteInterCompanyConfirmation = false"
                >
                  {{ $t("Annuler") }}
                </VBtn>
                <!-- Oui Button -->
                <VBtn
                  :disabled="loading"
                  color="primary"
                  @click="handleDeleteInterCompanies()"
                >
                  {{ $t("Confirm") }}
                </VBtn>
              </VCardText>
            </VCard>
          </VDialog>

          <VDialog
            v-model="showConfirmationprovisiontermineDialog"
            max-width="500"
          >
            <VCard :title="$t('Terminer la provision')">
              <!-- Dialog Text -->
              <VCardText>
                <div>
                  {{
                    $t(
                      "Êtes-vous sûr de vouloir terminer la provision de cette balance ?"
                    )
                  }}
                </div>
              </VCardText>

              <!-- Action Buttons -->
              <VCardText class="d-flex justify-end flex-wrap gap-3">
                <!-- Cancel Button -->
                <VBtn
                  color="secondary"
                  variant="tonal"
                  @click="showConfirmationprovisiontermineDialog = false"
                  :disabled="loading"
                >
                  {{ $t("Annuler") }}
                </VBtn>
                <!-- Confirm Button -->
                <VBtn
                  color="primary"
                  @click="terminateProvisionForBalance"
                  :disabled="loading"
                >
                  {{ $t("Confirmer") }}
                  <VProgressCircular
                    v-if="loading"
                    indeterminate
                    color="primary"
                    :size="20"
                    width="3"
                    class="ml-2"
                  />
                </VBtn>
              </VCardText>
            </VCard>
          </VDialog>
        </div>
      </template>

      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t("balance detail") }}</span>
        </div>
      </template>

      <DataTableCore
        v-model="selected"
        :headers="headers"
        :items="balanceDetails"
        :is-loading="isLoading"
        :total="total"
        :per_page="50"
        :filter="filter"
        :scrollTableWithFixedHeader="true"
        :scrollTableHorizontalWithTwoFixedColumnInHeader="true"
        @change-filter="changeFilter"
        @update:order="saveNewOrder"
        :show-select="$can('balances.export')"
      >
        <template #item.account_value="{ item }" class="fix-col">
          {{ item.account_value }}
        </template>
        <template #item.description="{ item }">
          <span v-tooltip="item.description">{{ item.description }}</span>
        </template>
        <template
          v-for="header in dynamicHeaders"
          #[`item.${header.key}`]="{ item }"
          :key="header.key"
        >
          <span
            v-tooltip="
              analyticalAxiesMap[item[header.key]]?.label ||
              'No label available'
            "
          >
            {{ analyticalAxiesMap[item[header.key]]?.code || "" }}</span
          >
        </template>

        <template #item.debit1="{ item }">
          <div class="text-end">
            {{ formatAmount(item.debit1) }}
          </div>
        </template>
        <template #item.credit1="{ item }">
          <div class="text-end">
            {{ formatAmount(item.credit1) }}
          </div>
        </template>
        <template #item.solde1="{ item }">
          <div class="text-end">
            {{ formatAmount(item.solde1) }}
          </div>
        </template>
        <!-- <template #item.prov_bc="{ item }">
          <AppTextField
            v-model.trim="item.prov_bc"
            :placeholder="t('countSesMd.ajust_bc')"
            :tabindex="item.id"
            @change="createLogLine(item, item.prov_bc, 'prov_bc')"
            @focus="storeOldValue(item, 'prov_bc')"
            :readonly="!form.flag_locked"

          />
        </template> -->

        <template #item.prov_bc="{ item }">
          <VTextField
            class="textField"
            v-model.trim="item.prov_bc"
            :placeholder="t('countSesMd.ajust_bc')"
            :tabindex="item.id"
            type="text"
            min="0"
            @change="createLogLine(item, item.prov_bc, 'prov_bc')"
            @focus="storeOldValue(item, 'prov_bc')"
            :readonly="isViewMode ||
              form.flag_provision == 1 ||
              !form.flag_locked && (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_prov_bc !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_prov_bc} ${t('at')}
          ${new Date(item.date_prov_bc).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.debit2="{ item }">
          <VTextField
            class="textField"
            v-model="item.debit2"
            :placeholder="t('Debit2')"
            :tabindex="item.id"
            type="number"
            min="0"
            @change="createLogLine(item, item.debit2, 'debit2')"
            @focus="storeOldValue(item, 'debit2')"
            :readonly=" isViewMode ||
              ((item.debit3 && item.debit3 > 0) || !form.flag_locked) &&
              (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_debit2 !== null"
                color="warning"
                icon="tabler-alert-triangle"
                textAlign="right"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_debit2} ${t('at')}
          ${new Date(item.date_debit2).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.credit2="{ item }">
          <VTextField
            class="textField"
            v-model="item.credit2"
            :placeholder="t('Credit2')"
            :tabindex="item.id"
            type="number"
            min="0"
            @change="createLogLine(item, item.credit2, 'credit2')"
            @focus="storeOldValue(item, 'credit2')"
            :readonly=" isViewMode ||
              ((item.debit2 && item.debit2 > 0) || !form.flag_locked) &&
              (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_credit2 !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_credit2} ${t('at')}
          ${new Date(item.date_credit2).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.solde2="{ item }">
          <div class="text-end">
            {{ formatAmount(item.solde2) }}
          </div>
        </template>

        <!-- <template #item.prov_fc="{ item }">
          <AppTextField
            v-model.trim="item.prov_fc"
            :placeholder="t('countSesMd.ajust_fc')"
            :tabindex="item.id"

            @change="createLogLine(item, item.prov_fc, 'prov_fc')"
            @focus="storeOldValue(item, 'prov_fc')"
            :readonly="!form.flag_locked"


          />
        </template> -->

        <template #item.prov_fc="{ item }">
          <VTextField
            class="textField"
            v-model.trim="item.prov_fc"
            :placeholder="t('countSesMd.ajust_fc')"
            :tabindex="item.id"
            type="text"
            min="0"
            @change="createLogLine(item, item.prov_fc, 'prov_fc')"
            @focus="storeOldValue(item, 'prov_fc')"
            :readonly=" isViewMode ||
              !form.flag_locked && (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.user_prov_fc !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_prov_fc} ${t('at')}
          ${new Date(item.date_prov_fc).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.credit3="{ item }">
          <VTextField
            class="textField"
            v-model="item.credit3"
            :placeholder="t('Credit3')"
            :tabindex="item.id"
            type="number"
            min="0"
            @change="createLogLine(item, item.credit3, 'credit3')"
            @focus="storeOldValue(item, 'credit3')"
            :readonly="isViewMode ||
              ((item.debit3 && item.debit3 > 0) || !form.flag_locked) &&
              (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_credit3 !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_credit3} ${t('at')}
          ${new Date(item.date_credit3).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.debit3="{ item }">
          <VTextField
            class="textField"
            v-model="item.debit3"
            :placeholder="t('Debit3')"
            :tabindex="item.id"
            type="number"
            min="0"
            @change="createLogLine(item, item.debit3, 'debit3')"
            @focus="storeOldValue(item, 'debit3')"
            :readonly="isViewMode ||
              ((item.credit3 && item.credit3 > 0) || !form.flag_locked) &&
              (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_debit3 !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_debit3} ${t('at')}
          ${new Date(item.date_debit3).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.solde3="{ item }">
          <div class="text-end">
            {{ formatAmount(item.solde3) }}
          </div>
        </template>
        <template #item.prov_ajust="{ item }">
          <VTextField
            class="textField"
            v-model.trim="item.prov_ajust"
            :placeholder="t('countSesMd.ajust_div')"
            :tabindex="item.id"
            @change="createLogLine(item, item.prov_ajust, 'prov_ajust')"
            @focus="storeOldValue(item, 'prov_ajust')"
            :readonly="isViewMode ||
              !form.flag_locked && (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.user_prov_ajust !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_prov_ajust} ${t('at')}
          ${new Date(item.date_prov_ajust).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.credit4="{ item }">
          <VTextField
            class="textField"
            v-model="item.credit4"
            :placeholder="t('Credit4')"
            :tabindex="item.id"
            type="number"
            min="0"
            @change="createLogLine(item, item.credit4, 'credit4')"
            @focus="storeOldValue(item, 'credit4')"
            :readonly="isViewMode ||
              ((item.debit4 && item.debit4 > 0) || !form.flag_locked) &&
              (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_credit4 !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_credit4} ${t('at')}
          ${new Date(item.date_credit4).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.debit4="{ item }">
          <VTextField
            class="textField"
            v-model="item.debit4"
            :placeholder="t('Debit4')"
            :tabindex="item.id"
            type="number"
            min="0"
            @change="createLogLine(item, item.debit4, 'debit4')"
            @focus="storeOldValue(item, 'debit4')"
            :readonly="isViewMode ||
              ((item.credit4 && item.credit4 > 0) || !form.flag_locked) &&
              (true || ValidationAccess)
            "
          >
            <template v-slot:prepend-inner>
              <VIcon
                v-if="item.date_debit4 !== null"
                color="warning"
                icon="tabler-alert-triangle"
                size="12"
                class="ms-2"
                v-tooltip="
                  `${t('changed-by')} ${item.user_debit4} ${t('at')}
          ${new Date(item.date_debit4).toLocaleString('fr-FR')}`
                "
              />
            </template>
          </VTextField>
        </template>

        <template #item.solde4="{ item }">
          <div class="text-end">
            {{ formatAmount(item.solde4) }}
          </div>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-3">
            <VProgressCircular
              v-if="item?.isLoading"
              color="info"
              size="24"
              indeterminate
            />
            <VIcon
              v-else-if="item?.isUpdated == true"
              color="success"
              icon="tabler-circle-check-filled"
              size="28"
            />
            <VIcon
              v-else-if="item?.isUpdated == false"
              color="error"
              icon="tabler-circle-x-filled"
              size="28"
            />

            <TooltipIcon
              v-if="
                item.flag_provision === 1 &&
                form.flag_locked == 1 &&
                (true || ValidationAccess)
              "
              :tooltip-text="$t('delete')"
              icon="tabler-trash"
              color="error"
              @click="showDeleteDialog(item)"
            />
            <!-- <TooltipIcon
              v-if="$can('standard.view')"
              :tooltip-text="$t('show')"
              icon="tabler-eye"
              color="primary"
              @click="viewStandar(item)"
            />
            <TooltipIcon
              v-if="$can('standard.update')"
              :tooltip-text="$t('edit')"
              icon="tabler-edit"
              color="primary"
              @click="editStandar(item)"
            />
            <TooltipIcon
              v-if="$can('standard.destroy')"
              :tooltip-text="$t('delete')"
              icon="tabler-trash"
              color="error"
              @click="showDeleteDialog(item)"
            /> -->
          </div>
        </template>
        <template #bottom>
          <!-- &nbsp; -->
          <VRow>
            <VCol class="md-6">
              <div style="margin-top: 10px; text-align: end">
                <VBtn
                  v-if="total > balanceDetails.length"
                  variant="plain"
                  @click="load"
                  :disabled="isLoadingDataPaginate"
                  :loading="isLoadingDataPaginate"
                  class="align-text-center"
                >
                  <VIcon
                    v-if="!isLoadingDataPaginate"
                    icon="tabler-plus"
                    size="20"
                  />
                  {{ t("see_more") }}
                </VBtn>
                <div v-else-if="total == balanceDetails.length && total > 0">
                  <span>
                    {{ $t("countSesMd.no more data") }}
                  </span>
                </div>
              </div>
            </VCol>
            <VCol class="md-6">
              <div style="margin-top: 10px; text-align: end">
                {{
                  (total > 0 ? "1" : "0") +
                  `-${balanceDetails.length} sur ${total} ${t("Lignes")}`
                }}
              </div>
            </VCol>
          </VRow>
        </template>
      </DataTableCore>
    </VCard>
  </VForm>

  <VDialog v-model="isAddNewCpcVisible" max-width="500px" persistent>
    <VCard>
      <VCardTitle class="text-h6">{{ $t("Ajouter un Cpc") }}</VCardTitle>

      <VCardText>
        <AppTextField
          v-model="cpcForm.label"
          :label="t('label')"
          :placeholder="t('label')"
          :rules="[requiredValidator]"
          clearable
          :error-messages="errorMessages?.label"
        />
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VSpacer />
        <VBtn color="secondary" @click="closeModal">{{ $t("Cancel") }}</VBtn>
        <VBtn color="primary" @click="handleCpcCreation">{{
          $t("Confirm")
        }}</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <!-- <VDialog v-model="isAddDialogVisible" max-width="500px" persistent>
    <VCard>
      <VCardTitle class="text-h6">{{ $t("Ajouter une catégorie") }}</VCardTitle>

      <VCardText>
        <AppTextField
          v-model="newStandardcategory.label"
          :label="t('label')"
          :placeholder="t('label')"
          :rules="[requiredValidator]"
          clearable
          :error-messages="errorMessages?.label"
        />
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VSpacer />
        <VBtn color="secondary" @click="closeModal">{{ $t("Cancel") }}</VBtn>
        <VBtn color="primary" @click="saveNewStandardCategory">{{
          $t("Confirm")
        }}</VBtn>
      </VCardText>
    </VCard>
  </VDialog> -->

  <!-- <VDialog v-model="isAddDialogVisibleProvision" max-width="500px" persistent>
      <VCard>
        <VCardTitle class="text-h6">
          {{ $t("Ajouter une provision") }}
        </VCardTitle>

        <VCardText>
          <VSelect
            v-model="newProvision.type"
            :items="provisionTypes"
            :label="t('Type de provision')"
            clearable
          />

          <VSelect
            v-model="newProvision.dynamicInput"
            :items="dynamicOptions"
            :label="t('Dynamic Input')"
            clearable
          />

          <VTextField
            v-model="newProvision.debit"
            :label="t('Débit')"
            type="number"
            clearable
          />

          <VTextField
            v-model="newProvision.credit"
            :label="t('Crédit')"
            type="number"
            clearable
          />
        </VCardText>

        <VCardActions class="d-flex justify-end flex-wrap gap-3">
          <VBtn color="secondary" @click="closeModal">
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn color="primary" @click="saveNewProvision">
            {{ $t("Confirm") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog> -->

  <VDialog v-model="isAddDialogVisibleProvision" max-width="500px" persistent>
    <DialogCloseBtn
      @click="closeAddModalProvision"
      :disabled="isLoadingAccounts"
    />

    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ $t("Ajouter une provision") }}</span>
        <!-- Close Button -->
      </VCardTitle>

      <VCardText>
        <VForm ref="sendForm">
        <VRow>
          <!-- Provision Type -->
          <VCol cols="12">
            <VTextField
              v-model="newProvision.account"
              :label="t('N Compte')"
              type="text"
              :rules="[requiredValidator]"

              class=" required"

            />
          </VCol>

           <VCol cols="12">
            <VSelect
              v-model="newProvision.type"
              :items="provisionTypes"
              :label="t('Type de provision')"
              :item-value="'id'"
              :item-title="'label'"
              class="mt-2 required"
              :rules="[requiredValidator]"
              clearable
            />
          </VCol>
         
          <VCol cols="12">
            <VTextField
              v-model="newProvision.prov_ajust"
              :label="t('Ajustement provision')"
              type="text"
              clearable 
              class="mt-2 required"
              :rules="[requiredValidator]"

            />
          </VCol>

         

          <VCol cols="12" v-for="header in dynamicHeaders" :key="header.key">
            <VTooltip location="top">
              <template #activator="{ props }">
                <VSelect
                  v-bind="props"
                  v-model="newProvision[header.key]"
                  :label="header.title || 'No label available'"
                  :items="getOptionsForAxis(header.id)"
                  :item-value="'label'"
                  :item-title="'label'"
                  clearable
                  :class="header.is_required == 'oui' ? 'mt-2 required' : ''"
                  :rules="header.is_required == 'oui' ? [requiredValidator] : []"
                  @update:modelValue="
                    (value) => handleSelectionChange(header.id, value)
                  "
                />
              </template>
              {{ header.title || "No label available" }}
              <!-- Tooltip shows the title -->
            </VTooltip>
          </VCol>

          <!-- Debit Input -->
          <VCol cols="6">
            <VTextField
              v-model="newProvision.debit"
              :label="t('Débit')"
              type="number"
              clearable
              :disabled="disableDebit"
            />
          </VCol>

          <!-- Credit Input -->
          <VCol cols="6">
            <VTextField
              v-model="newProvision.credit"
              :label="t('Crédit')"
              type="number"
              clearable
              :disabled="disableCredit"
            />
          </VCol>
        </VRow>
        </VForm>
      </VCardText>
  
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn color="secondary" @click="closeAddModalProvision">
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          color="primary"
          @click="saveNewProvision"
          :disabled="isSubmitting"
        >
          <VProgressCircular
            v-if="isSubmitting"
            indeterminate
            size="20"
            color="white"
          />
          <span v-else>{{ $t("Confirm") }}</span>
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isDeleteDialogVisible" max-width="500">
    <VCard :title="$t('Delete')">
      <VCardText>{{
        $t("Are you sure you want to delete this ligne")
      }}</VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isDeleteDialogVisible = false"
          :disabled="isLoading"
          >{{ $t("Cancel") }}</VBtn
        >
        <VBtn color="primary" @click="confirmDelete" :disabled="isLoading">
          <VProgressCircular
            v-if="isLoading"
            indeterminate
            color="primary"
            :size="20"
            width="3"
          />
          {{ $t("Confirm") }}</VBtn
        >
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="isReopenBalanceDialogVisible" max-width="500">
    <VCard :title="$t('reopen')">
      <VCardText>{{
        $t("Êtes-vous sûr de vouloir rouvrir cet balance ?")
      }}</VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isReopenBalanceDialogVisible = false"
          :disabled="isLoading"
          >{{ $t("Cancel") }}</VBtn
        >
        <VBtn color="primary" @click="reOpenBalance()" :disabled="isLoading">
          <VProgressCircular
            v-if="isLoading"
            indeterminate
            color="primary"
            :size="20"
            width="3"
          />
          {{ $t("Confirm") }}</VBtn
        >
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="showDeleteModePopUp" persistent width="500">
    <VCard>
      <VCardTitle>{{ $t("Delete Balance") }}</VCardTitle>
      <VCardText>
        {{ $t("Are you sure you want to delete this balance?") }}
      </VCardText>
      <VCardText>
        <AppCombobox
          v-model="balanceDeleteMode"
          :label="$t('delete_mode')"
          :placeholder="$t('delete_mode')"
          :items="[
            { key: 'delete_provisions', title: $t('delete_provisions') },
            { key: 'reset_to_zero', title: $t('reset_to_zero') },
            { key: 'total_deletion', title: $t('total_deletion') },
          ]"
          item-title="title"
          item-value="key"
          :rules="[requiredValidator]"
          class="required"
          :return-object="false"
        />
      </VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="showDeleteModePopUp = false"
          :disabled="isLoading"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          @click="confirmDeleteModeForBalance"
          :disabled="balanceDeleteMode == '' || isLoading"
        >
          <VProgressCircular
            v-if="isLoading"
            indeterminate
            color="primary"
            :size="20"
            width="3"
            class="ml-2"
          />
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <ConfirmDeleteDialog
    :is-dialog-visible="showDeleteTotalModePopUp"
    @close="showDeleteTotalModePopUp = false"
    @on-delete="onConfirmDelete"
    message="Souhaitez-vous vraiment supprimer définitivement la balance ?"
    messageError=" ⚠️ La suppression de cette balance entraînera également la suppression de toutes les CPC, bilans et flux de trésorerie associés. "
  >
  </ConfirmDeleteDialog>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStandarStore } from "@/stores/useStandarStore";
import { useBalanceDetailsStore } from "@/stores/useBalanceDetailsStore";
import { getToken } from "@/services/JwtService";
import {
  useCoreStore,
  useChartAccountStore,
  useAuthStore,
  useAttachmentStore,
  useGroupsStore,
} from "@/stores";
import { useAxisTypeStore } from "@/stores";
import { useBlanceStore } from "@/stores/useBalanceStore";
import { usePeriodTypeStore } from "@/stores/usePeriodTypeStore";
import { useAxisType } from "@/composables/axisType.js";
import { useAnalyticalAxiesStore } from "@/stores";
import axios from "axios";
import { isEmpty } from "@/@core/utils/helpers";

const errorMessages = ref({ label: "" });

// Initialize stores
const isDialogVisible = ref(false);
const showModalAttachments = ref(false);
const modelAble = ref({ class: "BalanceSheetHead" });
const isLoading = ref(false);
const isDownloadingExport = ref(false);
const showDeleteModePopUp = ref(false);
const showDeleteTotalModePopUp = ref(false);
const isReopenBalanceDialogVisible = ref(false);
const showConfirmationValidateDialog = ref(false);
const showConfirmationprovisiontermineDialog = ref(false);
const groupsStore = useGroupsStore();
const { groupeTraitement, traitementGroups } = storeToRefs(groupsStore);

const coreStore = useCoreStore();
const authStore = useAuthStore();
const selected = ref([]);
const { user: authUser } = storeToRefs(authStore);
const { enums } = storeToRefs(coreStore);
const selectedItem = ref(null);
const t = inject("t");
const showSnackbar = inject("showSnackbar");
const route = useRoute();
const { id } = route.params;
const { mode } = route.params;
const standarStore = useStandarStore();
const balanceStore = useBlanceStore();
const BalanceDetailsStore = useBalanceDetailsStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDeleteDialogVisible = ref(false);
const router = useRouter();
const isViewMode = ref(false);
const periodTypeStore = usePeriodTypeStore();
const periodTypes = storeToRefs(periodTypeStore).periodTypes;
const chartAccountStore = useChartAccountStore();
const { chartAccounts } = storeToRefs(chartAccountStore);
const isImportDialogVisible = ref(false);

const isImportDialogVisibleProvision = ref(false);
const isImportDialogVisibleInterCompany = ref(false);

const balanceDeleteMode = ref("");
const currentImportType = ref("");
const userComment = ref("");
const attachmentStore = useAttachmentStore();
const isLoadingDownload = ref({});
const isLoadingDelete = ref({});
const axisTypeStore = useAxisTypeStore();
const AnalyticalAxiesStore = useAnalyticalAxiesStore();
const axisTypeLabels = ref([]);
const total1 = ref(0);
const total2 = ref(0);
const total3 = ref(0);
const total4 = ref(0);
const show = ref(false);
const showDeleteInterCompanyConfirmation = ref(false);
const loading = ref(false);
const sendMailDialogShown = ref(false);
const sendMailWithBody = ref(true);
const isLoadingProvision = ref(false);
const isAddDialogVisibleProvision = ref(false);
const provisionTypes = [
  { label: "Ajustement Bon de commande", id: 2 },
  { label: "Ajustement Factures en attente", id: 3 },
  { label: "Ajustement divers", id: 4 },
];
const isSubmitting = ref(false);
const requiredValidator = (value) => !!value || "Ce champ est obligatoire";
  const sendForm = ref(null);


const newProvision = ref({
  // type: null,
  // dynamicInput: null,

  description: null,
  account: null,
  type: null,
  debit: null,
  credit: null,
  prov_ajust: null,
});

const disableDebit = ref(false);
const disableCredit = ref(false);

// const getOptionsForAxis = (id) => {
//   console.log('id',id)
//   console.log('value',analyticalAxiesMap.value[id] || [])
//   return analyticalAxiesMap.value[id] || [];
// };

// const getOptionsForAxis = () => {
//   console.log('Full analyticalAxiesMap:', analyticalAxiesMap.value);

//   // Convert the object into an array and return all labels & codes
//   return Object.values(analyticalAxiesMap.value).map(axis => ({
//     id: axis.id,
//     label: axis.label,
//     code: axis.code,
//     axisTypeId: axis.axis_type
//   }));
// };

// const getOptionsForAxis = (id) => {
//   console.log('Fetching options for:', id);
//   console.log('Full analyticalAxiesMap:', analyticalAxiesMap.value);

//   const allAxes = Object.values(analyticalAxiesMap.value);

//   return allAxes.map(axis => ({
//     id: axis.id,
//     label: id === 1 ? axis.label : axis.code,  // Show label for type 1, code for type 2
//     code: axis.code
//   }));
// };

const getOptionsForAxis = (id) => {
  console.log("Fetching options for:", id);
  console.log("Full analyticalAxiesMap:", analyticalAxiesMap.value);

  // Ensure analyticalAxiesMap.value exists
  if (!analyticalAxiesMap.value) {
    console.warn("⚠️ analyticalAxiesMap.value is undefined!");
    return [];
  }

  const filteredAxes = Object.values(analyticalAxiesMap.value).filter(
    (axis) => axis.axis_type === id
  );

  console.log(`Filtered axes for axis_type_id=${id}:`, filteredAxes);

  return filteredAxes.map((axis) => ({
    id: axis.id,
    label: axis.code,
    code: axis.code,
  }));
};

const reOpenBalance = async () => {
  try {
    isLoading.value = true;
    await balanceStore.reOpenBalance(id);
    showSnackbar("Balance réouverte avec succès", "success");
    await loadBalanceData(id);
  } catch (error) {
    showSnackbar("Erreur lors de la réouverture de la balance", "error");
  } finally {
    isReopenBalanceDialogVisible.value = false;
    isLoading.value = false;
  }
};

watch(
  () => newProvision.value.debit,
  (newValue) => {
    if (newValue) {
      disableCredit.value = true;
    } else {
      disableCredit.value = false;
    }
  }
);

watch(
  () => newProvision.value.credit,
  (newValue) => {
    if (newValue) {
      disableDebit.value = true;
    } else {
      disableDebit.value = false;
    }
  }
);

const openAddModalProvision = () => {
  isAddDialogVisibleProvision.value = true;
};

const closeAddModalProvision = () => {
  isAddDialogVisibleProvision.value = false;
};

const cachedAxisTypesLocalStorage = localStorage.getItem("cachedAxisTypes");
const cachedAxisTypes =
  cachedAxisTypesLocalStorage !== "undefined"
    ? JSON.parse(cachedAxisTypesLocalStorage)
    : [];

const axisTypes = ref(cachedAxisTypes);

const loadAxisTypes = async () => {
  await axisTypeStore.getAxisTypes();
  if (axisTypeStore.axisTypes.length) {
    axisTypes.value = axisTypeStore.axisTypes;

    localStorage.setItem(
      "cachedAxisTypes",
      JSON.stringify(axisTypeStore.axisTypes)
    );
  }
};

const traitementAccess = computed(() => {
  return traitementUsers.value.some((user) => user.id === authUser.value.id);
});

const ValidationAccess = computed(() => {
  return validationUsers.value.some((user) => user.id === authUser.value.id);
});

const traitementUsers = computed(() =>
  groupsStore.traitementGroups
    .filter((group) => group.intervention === "Traitement")
    .flatMap((group) => group.users || [])
    .filter(
      (user, index, self) => self.findIndex((u) => u.id === user.id) === index
    )
    .map((user) => user)
);

const validationUsers = computed(() =>
  groupsStore.traitementGroups
    .filter((group) => group.intervention === "Validation")
    .flatMap((group) => group.users || [])
    .filter(
      (user, index, self) => self.findIndex((u) => u.id === user.id) === index
    )
    .map((user) => user)
);

// const {

//  axisTypes

// } = storeToRefs(axisTypeStore);

//       const axisTypeLabels = computed(() => {
//   return axisTypes.value.map((axis) => axis.label);
// });
const { AnalyticalAxies } = storeToRefs(AnalyticalAxiesStore);
const isAddDialogVisible = ref(false);
const isAddNewCpcVisible = ref(false);
const newStandardcategory = ref({
  label: "",
});
const cpcForm = ref({
  label: "",
});

const requiredFieldsData = computed(() => [
  "N° compte",
  "Débit 1",
  "Crédit 1",
  ...axisTypeStore.axisTypes
    .filter((axis) => axis.is_active === "active" && axis.is_required === "oui")
    .map((axis) => axis.label),
]);

const fieldsData = computed(() => ({
  "N° compte": "N° compte",
  "Débit 1": "Débit 1",
  "Crédit 1": "Crédit 1",
  ...Object.fromEntries(
    axisTypeStore.axisTypes
      .filter((axis) => axis.is_active === "active")
      .map((axis) => [axis.label, axis.label])
  ),
}));

const requiredFieldsDataProvision = computed(() => [
  "N° compte",
  "Débit ",
  "Crédit ",
  "ajustement_provision",
  ...axisTypeStore.axisTypes
    .filter((axis) => axis.is_active === "active" && axis.is_required === "oui")
    .map((axis) => axis.label),
]);

// const fieldsDataProvision = computed(() => ({
//   "N° compte": "N° compte",
//   "Débit ": "Débit ",
//   "Crédit ": "Crédit ",
//   "Ajustement provision": "ajustement_provision",
//   ...Object.fromEntries(
//     axisTypeStore.axisTypes
//       .filter((axis) => axis.is_active === "active")
//       .map((axis) => [axis.label, axis.label])
//   ),
// }));

const fieldsDataProvision = computed(() => ({
  "N° compte": "N° compte",
  //  "Débit 1": "Débit 1",
  //    "Crédit 1": "Crédit 1",

  "Ajustement BC": "BC",
  "Débit 2": "Débit 2",
  "Crédit 2": "Crédit 2",
  "Ajustement FC": "ajustement_FC",
  "Débit 3": "Débit 3",
  "Crédit 3": "Crédit 3",
  // "Ajustement PROV": "ajustement_PROV",

  "Ajustement DIV": "ajustement_DIV",
  "Débit 4": "Débit 4",
  "Crédit 4": "Crédit 4",
  ...Object.fromEntries(
    axisTypeStore.axisTypes
      .filter((axis) => axis.is_active === "active")
      .map((axis) => [axis.label, axis.label])
  ),
}));

const requiredFieldsDataintercompnay = computed(() => [
  "N° compte",
  "Débit ",
  "Crédit ",
  ...axisTypeStore.axisTypes
    .filter((axis) => axis.is_active === "active" && axis.is_required === "oui")
    .map((axis) => axis.label),
  "societe",
]);

const fieldsDataintercompany = computed(() => ({
  "N° compte": "N° compte",
  "Débit ": "Débit ",
  "Crédit ": "Crédit ",
  ...Object.fromEntries(
    axisTypeStore.axisTypes
      .filter((axis) => axis.is_active === "active")
      .map((axis) => [axis.label, axis.label])
  ),
  societe: "societe",
}));

// Extract relevant properties and actions from the storeats
const {
  currentBalanceDetail,
  balanceDetails,
  total,
  filter,
  currentPage,
  isLoading: isLoadingBalanceDetail,
  isLoadingImport: isLoadingImport,
} = storeToRefs(BalanceDetailsStore);
const {
  cpcEntetes,
  isLoadingSendingEmail,
  currentBalance,
  usersAllowedToReOpenBalance,
} = storeToRefs(balanceStore);

const form = ref({
  label: "",
  created_by: "",
  created_at: "",
  is_active: "",
});

const rules = {
  required: (value) => !!value || "This field is required",
};

const dynamicHeaders = computed(() =>
  axisTypes.value
    .filter((axis) => axis.is_active === "active")
    .map((axis) => ({
      title: axis.label,
      key: `axistype0${axis.id}_id`,
      is_required: axis.is_required,
      id: axis.id,
      sortable: true,
      filterable: true,
      typefilter: "text",
    }))
);

const skipThisCode = ref(false);
const analyticalAxiesMap = computed(() => {
  const map = {};
  AnalyticalAxiesStore.AnalyticalAxies.forEach((axis) => {
    map[axis.id] = {
      id: axis.id,
      label: axis.label,
      code: axis.code,
      axis_type: axis.axis_type_id,
    };
  });

  return map;
});

const headers = computed(() => [
  {
    title: t("N° compte"),
    key: "account_value",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Description"),
    key: "description",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  // {
  //   title: t("Code Entité"),
  //   key: "axistype02_id",
  //   sortable: true,
  //   filterable: true,
  //   typefilter: "text",
  // },
  // {
  //   title: t("Marque"),
  //   key: "axistype01_id",
  //   sortable: true,
  //   filterable: true,
  //   typefilter: "text",
  // },
  ...dynamicHeaders.value,
  {
    title: t("Debit1"),
    key: "debit1",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Credit1"),
    key: "credit1",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Solde1"),
    key: "solde1",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Ajustement BC"),
    key: "prov_bc",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Debit2"),
    key: "debit2",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Credit2"),
    key: "credit2",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Solde2"),
    key: "solde2",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Ajustement FC"),
    key: "prov_fc",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Debit3"),
    key: "debit3",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Credit3"),
    key: "credit3",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Solde3"),
    key: "solde3",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Ajustement Div"),
    key: "prov_ajust",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Debit4"),
    key: "debit4",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Credit4"),
    key: "credit4",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Solde4"),
    key: "solde4",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

function openModalAttachments() {
  showModalAttachments.value = true;
  modelAble.value.id = id;
}

function closeModalAttachments() {
  showModalAttachments.value = false;
  modelAble.value.id = null;
}

function uploadAttachment(form) {
  let res = attachmentStore.addRecord(form);
  if (res) {
    showSnackbar(t("Added ok"), { color: "success" });
  }
}

async function deleteAttachment(id_attach) {
  isLoadingDelete.value = { ...isLoadingDelete.value, [id_attach]: true };
  let res = await attachmentStore.deleteRecord({ id: id_attach });
  if (res) {
    showSnackbar(t("Deleted ok"), { color: "success" });
  }
  isLoadingDelete.value = { ...isLoadingDelete.value, [id_attach]: false };
}

async function downloadAttachment(item) {
  isLoadingDownload.value = { ...isLoadingDownload.value, [item.id]: true };

  let res = await attachmentStore.downloadAttachment(item);
  if (res) {
    showSnackbar(t("Downloaded ok"), { color: "success" });
  }

  isLoadingDownload.value = { ...isLoadingDownload.value, [item.id]: false };
}

const handleSelectionChange = (headerId, value) => {
  let storedData = JSON.parse(localStorage.getItem("selectedHeaders")) || {};
  storedData[headerId] = value;
  localStorage.setItem("selectedHeaders", JSON.stringify(storedData));
};

function openModalSendingEmail() {
  sendMailDialogShown.value = true;
}

function closeModalSendingEmail() {
  sendMailDialogShown.value = false;
}

async function sendingMail(emails) {
  console.log("emails", emails.value);
  emails.value.id = id;
  emails.value.axisTypes = dynamicHeaders.value.map((header) =>
    JSON.stringify({
      key: header.key,
      title: header.title,
    })
  );
  const result = await balanceStore.sendingMail(emails.value);

  if (result) {
    closeModalSendingEmail();
    showSnackbar(t("email_will_send_later"), { color: "success" });
  }
}
// Computed property for formatted creation datee

const isNoMoreData = ref(false);
const isLoadingDataPaginate = ref(false);
const load = async () => {
  if (isLoadingBalanceDetail.value || isNoMoreData.value) {
    return;
  }

  isLoadingDataPaginate.value = true;

  try {
    const { data } = await BalanceDetailsStore.getBalanceDetails({
      balance_id: id,
    });

    if (isEmpty(data)) {
      // isNoMoreData.value = true;
      currentPage.value--;
    }
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoadingDataPaginate.value = false;
  }
};
const oldValues = ref({});
// const hide = ref(false)
function storeOldValue(item, field) {
  if (!oldValues.value[item.id]) {
    oldValues.value[item.id] = {};
  }
  oldValues.value[item.id][field] = item[field];
}

async function createLogLine(item, changedColumn, keyColumnChanged) {
  skipThisCode.value = false;
  const numberColumns = [
    "debit2",
    "credit2",
    "debit3",
    "credit3",
    "debit4",
    "credit4",
  ];
  if (!changedColumn || isEmpty(changedColumn)) {
    if (numberColumns.includes(keyColumnChanged)) {
      item[keyColumnChanged] = 0;

      skipThisCode.value =
        oldValues.value[item.id][keyColumnChanged] == 0 ? false : true;
    }
    if (!numberColumns.includes(keyColumnChanged) || skipThisCode == false) {
      return;
    }
  }

  if (numberColumns.includes(keyColumnChanged) && skipThisCode.value == false) {
    const parsedValue = parseFloat(changedColumn);

    if (isNaN(parsedValue) || parsedValue < 0) {
      showSnackbar(t("Value must be a positive number"), { color: "warning" });
      item[keyColumnChanged] = oldValues.value[item.id][keyColumnChanged];
      item.isUpdated = false;
      return;
    }

    item[keyColumnChanged] = parsedValue;
  }

  item.isLoading = true;

  try {
    const { data, statusCode } = await useApi(
      `balance-details/${item.id}/create_log_line`
    ).post(item);

    if (statusCode.value !== 200) {
      item.isUpdated = false;
      item.isLoading = false;
      item[keyColumnChanged] = oldValues.value[item.id][keyColumnChanged] ?? ""; // Revert to old value
      return;
    }

    item.isLoading = false;
    item.isUpdated = true;

    total2.value = data.value.totals.total2;
    total3.value = data.value.totals.total3;
    total4.value = data.value.totals.total4;
    item.solde2 = data.value.balanceSheetDetail.solde2;
    item.solde3 = data.value.balanceSheetDetail.solde3;
    item.solde4 = data.value.balanceSheetDetail.solde4;
    item.date_prov_bc = data.value.balanceSheetDetail.date_prov_bc;
    item.user_prov_bc = data.value.balanceSheetDetail.user_prov_bc;
    item.user_debit2 = data.value.balanceSheetDetail.user_debit2;
    item.date_debit2 = data.value.balanceSheetDetail.date_debit2;
    item.user_credit2 = data.value.balanceSheetDetail.user_credit2;
    item.date_credit2 = data.value.balanceSheetDetail.date_credit2;

    item.date_prov_fc = data.value.balanceSheetDetail.date_prov_fc;
    item.user_prov_fc = data.value.balanceSheetDetail.user_prov_fc;
    item.user_debit3 = data.value.balanceSheetDetail.user_debit3;
    item.date_debit3 = data.value.balanceSheetDetail.date_debit3;
    item.user_credit3 = data.value.balanceSheetDetail.user_credit3;
    item.date_credit3 = data.value.balanceSheetDetail.date_credit3;

    item.date_prov_ajust = data.value.balanceSheetDetail.date_prov_ajust;
    item.user_prov_ajust = data.value.balanceSheetDetail.user_prov_ajust;
    item.user_debit4 = data.value.balanceSheetDetail.user_debit4;
    item.date_debit4 = data.value.balanceSheetDetail.date_debit4;
    item.user_credit4 = data.value.balanceSheetDetail.user_credit4;
    item.date_credit4 = data.value.balanceSheetDetail.date_credit4;
    form.value.total_bg_ini67 = data.value.totals.total_bg_ini67;
    form.value.total_bg_final67 = data.value.totals.total_bg_final67;
    form.value.total_bg_final = data.value.totals.total_bg_final;

    // BalanceDetailsStore.reset(['balanceDetails', 'currentPage']);
    // await loadBalanceDetails(id);
  } catch (error) {
    console.error("Error in createLogLine:", error);
    showSnackbar(t("An error occurred while updating. Please try again."), {
      color: "error",
    });

    item.isUpdated = false;
    item.isLoading = false;
    item[keyColumnChanged] = oldValues.value[item.id][keyColumnChanged] ?? "";
  } finally {
    // item.isLoading = false;
  }
}

const formattedCreatedAt = computed({
  get() {
    return form.value.created_at
      ? new Date(form.value.created_at).toLocaleDateString("fr-FR")
      : "";
  },
  set(newDate) {
    const [day, month, year] = newDate.split("/");
    form.value.created_at = new Date(`${year}-${month}-${day}`).toISOString();
  },
});

async function handleBalanceLocking() {
  const result = await balanceStore.lockBalance(id, !form.value.is_locked);
  if (result) {
    showSnackbar(
      form.value.is_locked
        ? t("Balance unlocked successfully")
        : t("Balance locked successfully"),
      { color: "success" }
    );
    loadBalanceData(id);
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }
}

const handleValide = async (action) => {
  if (!userComment.value.trim() && action) {
    console.error("Comment is required.");
    showSnackbar(t("Veuillez saisir un commentaire"), { color: "error" });
    return;
  }

  loading.value = true; // Start loader
  try {
    console.log("Action:", action);
    console.log("Comment:", userComment.value);

    // Prepare payload
    const payload = {
      balanceId: id, // Replace `id` with actual balance ID
      comment: userComment.value,
      action: action,
    };

    console.log("Payload:", payload);

    const response = await balanceStore.handleValidateBalancess(payload);

    if (response.success) {
      if (action)
        showSnackbar(t("Balance validated successfully"), { color: "success" });
      else showSnackbar(t("Balance not validated"), { color: "success" });
      await loadBalanceData(id); // Reload balance data
    } else {
      showSnackbar(t("Failed to validate balance"), { color: "error" });
    }
  } catch (error) {
    console.error("Error in handleValide:", error);
    showSnackbar(t("Une erreur inattendue s'est produite"), { color: "error" });
  } finally {
    loading.value = false; // Stop loader
    showConfirmationValidateDialog.value = false; // Close dialog
    userComment.value = ""; // Reset comment
  }
};

const handleDeleteInterCompanies = async () => {
  try {
    loading.value = true;
    const success = await balanceStore.deleteInterCompanies(id);
    if (success) {
      showSnackbar(t("Inter companies deleted successfully"), {
        color: "success",
      });

      await loadBalanceData(id);
    } else {
      showSnackbar(t("Failed to delete inter companies"), { color: "error" });
    }
  } catch (error) {
    console.error("Error in handleDeleteInterCompanies:", error);

    showSnackbar(t("An unexpected error occurred"), { color: "error" });
  } finally {
    showDeleteInterCompanyConfirmation.value = false;
    loading.value = false;
  }
};

const handleProvsionfalse = async () => {
  try {
    console.log("comm", userComment.value);
    // Prepare the payload
    const payload = {
      balanceId: id,
      comment: userComment.value,
    };

    const response = await balanceStore.handleValidateBalancess(payload);

    if (response.success) {
      showSnackbar(t("Balance validated successfully"), { color: "success" });

      await loadBalanceData(id);

      showConfirmationValidateDialog.value = false;
    } else {
      showSnackbar(t("Failed to validate balance"), { color: "error" });
    }
  } catch (error) {
    console.error("Error in handleValide:", error);

    showSnackbar(t("An unexpected error occurred"), { color: "error" });
  }
};
// const terminateProvisionForBalance = async () => {
//         loading.value = true;
//   try {
//      const payload = {
//       balanceId: id,

//     };
//     const response = await balanceStore.handleProvisionTermine(payload);

//     if (response.success) {
//       console.log(response.message);

//       showSnackbar(
//         t("Balance terminated successfully"),
//           { color: "success" }
//       );

//       await loadBalanceData(id);
//     } else {
//       console.error(response.message);
//       showSnackbar(
//         t("Failed to terminate balance provision"),
//         { color: "error" }
//       );
//     }
//   } catch (error) {
//     console.error("Error in terminateProvisionForBalance:", error);

//     showSnackbar(
//       t("An unexpected error occurred"),
//       { color: "error" }
//     );
//   }
// };

const terminateProvisionForBalance = async () => {
  loading.value = true;
  try {
    const payload = {
      balanceId: id,
    };
    const response = await balanceStore.handleProvisionTermine(payload);

    if (response.success) {
      console.log(response.message);

      showSnackbar(t("Balance terminated successfully"), {
        color: "success",
      });

      await loadBalanceData(id);
    } else {
      console.error(response.message);
      showSnackbar(t(response.message), {
        color: "error",
      });
    }
  } catch (error) {
    console.error("Error in terminateProvisionForBalance:", error);

    showSnackbar(t("An unexpected error occurred"), {
      color: "error",
    });
  } finally {
    loading.value = false;
    showConfirmationprovisiontermineDialog.value = false;
  }
};

async function loadBalanceDetails(id) {
  await BalanceDetailsStore.getBalanceDetails({ balance_id: id });
  console.log(balanceDetails.value);
}

async function loadBalanceData(id) {
  await balanceStore.getBlance(id).then(() => {
    console.log(balanceStore.currentBalance);
    form.value = { ...balanceStore.currentBalance };
    isDialogVisible.value = true;
    total1.value = balanceStore.currentBalance?.details_with_sums?.total1;
    total2.value = balanceStore.currentBalance?.details_with_sums?.total2;
    total3.value = balanceStore.currentBalance?.details_with_sums?.total3;
    total4.value = balanceStore.currentBalance?.details_with_sums?.total4;
  });
  console.log("Form Data:", form.value);
}

const confirmDeleteModeForBalance = async () => {
  isLoading.value = true;
  if (balanceDeleteMode.value === "delete_provisions") {
    let isSucssesfull = await balanceStore.deleteProvisions(id);
    if (isSucssesfull)
      showSnackbar(t("Provisions deleted successfully"), { color: "success" });
    BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
    await BalanceDetailsStore.getBalanceDetails();
    loadBalanceData(id);
  } else if (balanceDeleteMode.value === "reset_to_zero") {
    let isSucssesfull = await balanceStore.resetToZero(id);
    if (isSucssesfull) {
      showSnackbar(t("Balance reset to zero successfully"), {
        color: "success",
      });
      form.value = { ...balanceStore.currentBalance };
      BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
      await BalanceDetailsStore.getBalanceDetails();
      loadBalanceData(id);
    }
  } else if (balanceDeleteMode.value === "total_deletion") {
    showDeleteModePopUp.value = false;
    showDeleteTotalModePopUp.value = true;
  }
  isLoading.value = false;
  showDeleteModePopUp.value = false;
  balanceDeleteMode.value = "";
  // loadBalanceDetails(id);
};

const onConfirmDelete = async () => {
  let isSucssesfull = await balanceStore.totalDeletion(id);
  if (isSucssesfull) {
    BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
    showSnackbar(t("Balance deleted successfully"), { color: "success" });
    if (form.value.flag_bg_consolide) {
      router.push({ name: "bg-consolide-list" });
    } else {
      router.push({ name: "balance-list" });
    }
  }
};
const handleCpcCreation = async () => {
  if (!cpcForm.value.label) {
    errorMessages.value.label = "Ce champ est obligatoire";
    return;
  }
  const isSuccessful = await balanceStore.createCpcEntete(id, cpcForm.value);
  if (isSuccessful) {
    showSnackbar(t("CPC created successfully"), { color: "success" });
    isAddNewCpcVisible.value = false;
  } else {
    showSnackbar(t("Failed to create CPC"), { color: "error" });
  }
};

// Method to handle updating the standard data
async function updateBalance() {
  console.log({
    id: id,
    label: form.value.label,
    periedicity: form.value.period_type_id,
    chartaccount: form.value.chartaccount_id,
  });
  const result = await balanceStore.updateBalance({
    id: id,
    label: form.value.label,
    periedicity: form.value.period_type_id.id ?? form.value.period_type_id,
    chartaccount: form.value.chartaccount_id.id ?? form.value.chartaccount_id,
  });

  if (result.res) {
    showSnackbar(t("Balance updated successfully"), { color: "success" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
    console.error("Failed to update Balance");
  }
}

async function handleImport(payload) {
  try {
    const importPayload = {
      ...payload,
      balance_id: id,
    };

    const response = await BalanceDetailsStore.importBalanceDetails(
      importPayload
    );

    if (response.success) {
      showSnackbar(t("balance_initial_import_success"), { color: "success" });
      isImportDialogVisible.value = false;
      // loadBalanceDetails(id);
      BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
      await BalanceDetailsStore.getBalanceDetails();
      loadBalanceData(id);
    } else {
      if (response.errors) {
        // Display validation errors
        const errorMessages = response.errors;
        showSnackbar(errorMessages.join("\n"), { color: "error" });
      } else {
        // Display general error
        showSnackbar(response.message, { color: "error" });
      }
      isImportDialogVisible.value = false;
      loadBalanceData(id);
    }
  } catch (error) {
    showSnackbar(t("An unexpected error occurred. Please try again."), {
      color: "error",
    });
  }
}

const formattedTotalBgIni67 = computed({
  get() {
    return form.value.total_bg_ini67
      ? parseFloat(form.value.total_bg_ini67).toFixed(2)
      : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    form.value.total_bg_ini67 = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotalBgFinal67 = computed({
  get() {
    return form.value.total_bg_final67
      ? parseFloat(form.value.total_bg_final67).toFixed(2)
      : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    form.value.total_bg_final67 = isNaN(parsedValue)
      ? 0
      : parsedValue.toFixed(2);
  },
});

const formattedTotalBgFinal = computed({
  get() {
    return form.value.total_bg_final
      ? parseFloat(form.value.total_bg_final).toFixed(2)
      : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    form.value.total_bg_final = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal1 = computed({
  get() {
    return total1.value ? parseFloat(total1.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total1.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal2 = computed({
  get() {
    return total2.value ? parseFloat(total2.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total2.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal3 = computed({
  get() {
    return total3.value ? parseFloat(total3.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total3.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal4 = computed({
  get() {
    return total4.value ? parseFloat(total4.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total4.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

// const saveNewProvision = async () => {
 

//   if (!id) {
//     showSnackbar("Erreur: ID du solde manquant.", { color: "error" });
//     return;
//   }
//   isSubmitting.value = true;
//   let storedHeaders = JSON.parse(localStorage.getItem("selectedHeaders")) || {};
//   const importPayload = {
//     ...newProvision.value,
//     balance_id: id,
//     axis_data: storedHeaders,
//   };

//   const response = await BalanceDetailsStore.addProvisionEntry(importPayload);
//   isSubmitting.value = false;

//   if (response.success) {
//     showSnackbar("Provision créée avec succès!", { color: "success" });

//     closeAddModalProvision();
//     BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
//     await BalanceDetailsStore.getBalanceDetails();
//   } else {
//     let errorMessages = [];

//     if (response.errors) {
//       console.error("Validation Errors:", response.errors);

//       Object.values(response.errors).forEach((errorList) => {
//         errorList.forEach((msg) => errorMessages.push(msg));
//       });
//     }

//     if (errorMessages.length > 0) {
//       showSnackbar(errorMessages.join("\n"), { color: "error" });
//     } else {
//       showSnackbar(response.message || "Une erreur s'est produite.", {
//         color: "error",
//       });
//     }
//   }
// };


const saveNewProvision = async () => {
  const { valid } = await sendForm.value.validate();

  if (!valid) {
    showSnackbar("Veuillez remplir tous les champs obligatoires.", {
      color: "error",
    });
    return;
  }
  if (!newProvision.value.debit && !newProvision.value.credit) {
    showSnackbar("Veuillez remplir Crédit ou Débit.", {
      color: "error",
    });
    return;
  }

    if (!id) {
    showSnackbar("Erreur: ID du solde manquant.", { color: "error" });
    return;
  }

  isSubmitting.value = true;

  let storedHeaders = JSON.parse(localStorage.getItem("selectedHeaders")) || {};

  const importPayload = {
    ...newProvision.value,
    balance_id: id,
    axis_data: storedHeaders,
  };

  const response = await BalanceDetailsStore.addProvisionEntry(importPayload);
  isSubmitting.value = false;

  if (response.success) {
    showSnackbar("Provision créée avec succès!", { color: "success" });

    closeAddModalProvision();
    BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
    await BalanceDetailsStore.getBalanceDetails();
  } else {
    showSnackbar(response.errors, { color: "error" });
  }
};



async function handleImportProvision(payload) {
  try {
    console.log("payload 1");
    console.log(payload);
    const ProvisionId = payload.selectedIds;

    const importPayload = {
      ...payload,
      ProvisionId: ProvisionId,
      balance_id: id,
    };

    const response = await BalanceDetailsStore.importBalanceDetailsProvision(
      importPayload
    );

    if (response.success) {
      showSnackbar(t("balance_provision_import_success"), { color: "success" });
      isImportDialogVisibleProvision.value = false;
      // loadBalanceDetails(id);
      BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
      await BalanceDetailsStore.getBalanceDetails();
      loadBalanceData(id);
    } else {
      if (response.errors) {
        const errorMessages = response.errors;
        showSnackbar(errorMessages.join("\n"), { color: "error" });
      } else {
        showSnackbar(response.message, { color: "error" });
      }
      isImportDialogVisible.value = false;
      loadBalanceData(id);
    }
  } catch (error) {
    showSnackbar(t("An unexpected error occurred. Please try again."), {
      color: "error",
    });
  }
}
async function importInterCompany(payload) {
  try {
    const importPayload = {
      ...payload,
      balance_id: id,
    };

    const response = await BalanceDetailsStore.importInterCompany(
      importPayload
    );

    if (response.success) {
      showSnackbar(t("balance sinterCompany succ"), { color: "success" });
      isImportDialogVisibleInterCompany.value = false;
      // loadBalanceDetails(id);
      BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
      await BalanceDetailsStore.getBalanceDetails();
      loadBalanceData(id);
      router.push({ name: "inter-edit", query: { balance_id: id } });
    } else {
      if (response.errors) {
        const errorMessages = response.errors;
        showSnackbar(errorMessages.join("\n"), { color: "error" });
        isImportDialogVisibleInterCompany.value = false;
      } else {
        showSnackbar(response.message, { color: "error" });
        isImportDialogVisibleInterCompany.value = false;
      }
      isImportDialogVisibleInterCompany.value = false;
      loadBalanceData(id);
    }
  } catch (error) {
    showSnackbar(t("An unexpected error occurred. Please try again."), {
      color: "error",
    });
  }
}

// async function importInterCompany(payload) {
//   try {
//     // Add logging to inspect the payload before making the request
//     console.log("Import Payload:", payload);

//     const importPayload = {
//       ...payload,
//       balance_id: id,
//     };

//     console.log("Final Import Payload:", importPayload);

//     const response = await BalanceDetailsStore.importInterCompany(importPayload);

//     console.log("API Response:", response);

//     if (response.success) {
//       showSnackbar(t("balance_InterSociete_import_success"), { color: "success" });
//       isImportDialogVisibleInterCompany.value = true;

//       // Reset and reload store data
//       BalanceDetailsStore.reset(['balanceDetails', 'currentPage']);
//       await BalanceDetailsStore.getBalanceDetails();
//       loadBalanceData(id);
//     } else {
//       if (response.errors) {
//         const errorMessages = response.errors;
//         showSnackbar(errorMessages.join("\n"), { color: "error" });
//       } else {
//         showSnackbar(response.message, { color: "error" });
//       }
//       isImportDialogVisibleInterCompany.value = true;
//       loadBalanceData(id);
//     }
//   } catch (error) {
//     console.error("Import error:", error);
//     showSnackbar(t("An unexpected error occurred. Please try again."), {
//       color: "error",
//     });
//   }
// }

function submitForm() {
  isLoading.value = true;
  updateBalance().finally(() => {
    isLoading.value = false;
  });
}

// Open modal for adding new standard category
function openModal(action) {
  isAddDialogVisible.value = true;
  newStandardcategory.value.label = "";
}
function openCpcModal(action) {
  isAddNewCpcVisible.value = true;
  cpcForm.value.label = "";
}

function closeModal() {
  isAddDialogVisible.value = false;
  isAddNewCpcVisible.value = false;
  newStandardcategory.value.label = "";
  cpcForm.value.label = "";
}

function viewItem(item) {
  // Logic to view the selected item
}

function editItem(item) {
  // Logic to edit the selected items
}
async function exportData() {
  try {
    isDownloadingExport.value = true;
    const axisTypesKeys = dynamicHeaders.value.map((header) => header.key);
    await BalanceDetailsStore.exportBalanceDetails({
      balance_id: id,
      ids: selected.value,
      axis_types: dynamicHeaders.value.map((header) =>
        JSON.stringify({
          key: header.key,
          title: header.title,
        })
      ),
    });
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting balancedetails:", error);
    showSnackbar(t("Failed to export balance details"), { color: "error" });
  } finally {
    isDownloadingExport.value = false;
  }
}

async function exportDatainterCompany() {
  try {
    isDownloadingExport.value = true;
    const axisTypesKeys = dynamicHeaders.value.map((header) => header.key);
    await BalanceDetailsStore.exportIntersociete({
      balance_id: id,
      ids: selected.value,
      axis_types: dynamicHeaders.value.map((header) =>
        JSON.stringify({
          key: header.key,
          title: header.title,
        })
      ),
    });
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting balancedetails:", error);
    showSnackbar(t("Failed to export balance details"), { color: "error" });
  } finally {
    isDownloadingExport.value = false;
  }
}
// async function exportDatainterCompany()
// {
//    try {
//     isDownloadingExport.value = true;
//     const axisTypesKeys = dynamicHeaders.value.map((header) => header.key);
//     await BalanceDetailsStore.exportIntersociete({
//       balance_id: id,
//       ids: selected.value,
//       axis_types: dynamicHeaders.value.map((header) =>
//         JSON.stringify({
//           key: header.key,
//           title: header.title,
//         })
//            ),

//     });
//     showSnackbar(t("Export completed successfully"), { color: "success" });
//   } catch (error) {
//     console.error("Error exporting balancedetails:", error);
//     showSnackbar(t("Failed to export balance details"), { color: "error" });
//   } finally {
//     isDownloadingExport.value = false;
//   }
// }

function retourEtapePrécédente() {
  if (form.value.flag_bg_consolide) {
    router.push({ name: "bg-consolide-list" });
  }
  router.back();
}

const canDisplayAddButton = computed(() => {
  return form.value.is_active !== "inactive";
});

function showDeleteDialog(item) {
  selectedItem.value = item;
  isDeleteDialogVisible.value = true;
}

function openImportModal(action_name) {
  if (action_name === "import") {
    localStorage.setItem("importType", "initial");
    isImportDialogVisible.value = true;
  }
}
function openAddModal(action_name) {}

function openImportModalProvision(action_name) {
  if (action_name === "import provision") {
    localStorage.setItem("importType", "provision");

    isImportDialogVisibleProvision.value = true;
  }
}

function openImportModalInterCompany(action_name) {
  if (action_name === "import intercompany") {
    localStorage.setItem("importType", "intercompany");

    isImportDialogVisibleInterCompany.value = true;
  }
}

// function viewStandar(item,id) {
//   router.push({ name: "Subcategory-list", params: { id: item.id }, query: { mode: 'view' } });
// }

// function editStandar(item) {
//   router.push({ name: "Subcategory-list", params: { id: item.id }, query: { mode: 'edit' } });

//   }

async function confirmDelete() {
  isLoading.value = true;
  if (!selectedItem.value) {
    console.warn("No item selected for deletion");
    return;
  }

  console.log("Selected item for deletion:", selectedItem.value);

  try {
    const success = await BalanceDetailsStore.deleteBalanceDetail(
      selectedItem.value.id
    );

    console.log("Deletion status:", success);

    if (success) {
      console.log("Deletion successful, refreshing balance details...");

      BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
      await BalanceDetailsStore.getBalanceDetails();
      loadBalanceData(id);
      showSnackbar(t("Balance details deleted successfully"), {
        color: "success",
      });
    } else {
      console.warn("Deletion failed, showing error message");
      showSnackbar(t("Try again in a few seconds"), { color: "error" });
    }
  } catch (error) {
    console.error("Error in confirmDelete:", error);
    showSnackbar(t("An unexpected error occurred"), { color: "error" });
  } finally {
    isLoading.value = false;
    isDeleteDialogVisible.value = false;
    console.log("Delete dialog visibility set to false");
  }
}

async function changeFilter(newFilters) {
  // hide.value = true
  balanceDetails.value = [];
  BalanceDetailsStore.filter = { ...BalanceDetailsStore.filter, ...newFilters };
  BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
  await BalanceDetailsStore.getBalanceDetails(newFilters);
  // loadBalanceDetails(id);
  // hide.value = false
}

// const analyticalAxiesMap = computed(() => {
//   const map = {};
//   AnalyticalAxiesStore.AnalyticalAxies.forEach((axis) => {
//     map[axis.id] = {
//       label: axis.label,
//       code: axis.code,
//     };
//   });
//   return map;
// });

// const AnalyticalAxiesStoree = {
//   AnalyticalAxies: [
//     { id: 1, label: 'Locafinance', code: 'MRK001' },
//     { id: 2, label: 'T-rent', code: 'ENT001' },
//     { id: 8, label: 'dolidol', code: 'ENT002' },
//     { id: 9, label: 'marjane', code: 'MRK002' },
//     // Ensure these entries exist
//   ],
// };

onMounted(async () => {
  let storedData = JSON.parse(localStorage.getItem("selectedHeaders")) || {};
  for (const key in storedData) {
    newProvision.value[key] = storedData[key];
  }

  await groupsStore.groupeTraitement(id);

  // await balanceStore.getAllowedUsersToReOpenBalance(id);

  console.log("Traitement Users:", traitementUsers.value);
  console.log("Validation Users:", validationUsers.value);
  //  if (!cachedAxisTypes.length) {
  //     await loadAxisTypes();
  //   } else {
  //     loadAxisTypes();
  //   }
  BalanceDetailsStore.reset(["balanceDetails", "currentPage"]);
  isLoading.value = true;

  await loadBalanceDetails(id);
  await AnalyticalAxiesStore.getAllAnalyticalAxies();

  await axisTypeStore.getAxisTypes();

  await periodTypeStore.fetchPeriodTypes();
  await chartAccountStore.fetchChartAccounts();
  if (id) {
    await loadBalanceData(id);
  }

  if (
    route.query.mode === "view" || !route.query.mode ||
    (form.value.is_locked && form.value.lockdown.user_id !== authUser.value.id)
  ) {
    isViewMode.value = true;
  }
  try {
    const success = await axisTypeStore.getAxisTypes();
    if (success) {
      axisTypeLabels.value = axisTypeStore.axisTypes.map((axis) => axis.label);
    } else {
      console.error("Failed to fetch Axis Types.");
      isLoading.value = false;
    }
  } catch (error) {
    console.error("Error fetching Axis Types:", error);
    isLoading.value = false;
  }
  isLoading.value = false;
});

const formatAmount = (amount) => {
  return amount ? (new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(amount)) : "0,00"
};

const getStatusColor = (status) => {
  switch (status) {
    case "Brouillon":
      return "grey";
    case "Import Initial Réussi":
      return "primary";
    case "Provisions Terminées":
      return "info";
    case "Validée":
      return "success";
    case "Clôturée":
      return "error";
    default:
      return "primary";
  }
};

// const periodicityLabel = computed(() => {
//   const periodicity = periodTypes.value.find(
//     (type) => type.id === form.value.periodicity
//   );
//   return periodicity ? periodicity.label : ""; // Return label if found
// });
</script>

<style scoped>
/* Add custom styles if needed */

.fixed-card {
  position: sticky; /* Fixes the card to the viewport */
  top: 10%;
  left: 19%; /* Adjust as needed for spacing */
  right: 2%; /* Optional: adjust for width */
  max-height: 80vh; /* Prevents the card from overflowing vertically */
  overflow-y: auto; /* Adds a scroll bar inside the card if content exceeds height */
  z-index: 10; /* Ensures it stays above other elements */
}
.second-cardr {
  position: relative; /* Keeps the second card positioned naturally */
  margin-top: calc(
    80vh + 20px
  ); /*Adjusts based on the height of the first card */
  z-index: 11; /* Optional, to manage stacking context */
  left: 1%; /* Aligns it with the first card */
  right: 10%; /* Optional: adjust for width */
  overflow-y: auto;
}
.second-card {
  position: sticky; /* Fixes the card to the viewport */
  top: 30%;
  left: 19%; /* Adjust as needed for spacing */
  right: 2%; /* Optional: adjust for width */
  max-height: 500px; /* Prevents the card from overflowing vertically */
  overflow-y: auto; /* Adds a scroll bar inside the card if content exceeds height */
  z-index: 10; /* Ensures it stays above other elements */
}

.truncate {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.textField >>> input[type="number"] {
  text-align: end !important;
  /* Larger font size for input */
  /* font-size: 14px; Adjust font size */
  /* padding: 0.1px; */
}
.textField {
  min-width: 120px; /* Minimum size */
  max-width: 200px; /* Maximum size */
  width: auto; /* Adjust size dynamically */
}

.v-tooltip {
  max-width: 500px !important; /* Adjust the width if necessary */
  white-space: normal; /* Allow multiline text */
}

/* .textField >>> input {
  text-align: end; /* Ensures the input text is also aligned */
.fix-col {
  position: sticky !important;
  background-color: rgb(var(--v-theme-surface));
  inset-inline-end: 0;
}
</style>
