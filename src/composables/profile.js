import { useAuthStore, useUserStore } from "@/stores";

export function useProfile(t = e => e, showSnackbar) {
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const { user } = storeToRefs(authStore);
    const { user: userFromUserStore, isUserLoading } = storeToRefs(userStore)
    const userTab = ref(null)
    const tabs = [
        {
          icon: 'tabler-home',
          title: 'societe',
        },
        {
          icon: 'tabler-lock',
          title: 'Password',
        },
    ]
    const isEditDialogVisible = ref(false)
    const isConfirmPasswordVisible = ref(false)
    const isNewPasswordVisible = ref(false)
    const confirmPassword = ref(null)
    const password = ref(null)
    const itemForm = ref()
    const isLoadingPassword = ref(false)

    async function handleUserUpdate(updatedUserData)  {
        isUserLoading.value = true

        userFromUserStore.value = updatedUserData
        if (userFromUserStore.value.avatar && typeof userFromUserStore.value.avatar !== 'string') {
            userFromUserStore.value.avatar = userFromUserStore.value.avatar[0]
        }

        const { statusCode } = await userStore.updateUserProfile()
        if (statusCode === 200) {
            await authStore.loadAuth();
            showSnackbar(t('Updated ok'),{color:'success'})
        } else {
            showSnackbar(t("try again in a few seconds"), { color: 'error' })
        }

        isUserLoading.value = false
    }

    async function onSubmitChangePassword() {
        isLoadingPassword.value = true

        itemForm.value.validate().then(async ({ valid }) => {
            if (!valid) return

            let payload = {
                password: password.value,
                password_confirmation: confirmPassword.value
            }

            const { data, statusCode } = await userStore.updatePassword(payload)

            if (statusCode === 200) {
                password.value = null;
                confirmPassword.value = null;
                showSnackbar(t('Updated ok'),{color:'success'})
            } else {
                showSnackbar(t("try again in a few seconds"), { color: 'error' })
            }
        })

        isLoadingPassword.value = false
    }

    return {
        tabs,
        user,
        userTab,
        authStore,
        userStore,
        isUserLoading,
        userFromUserStore,
        isEditDialogVisible,
        confirmPassword,
        password,
        itemForm,
        isNewPasswordVisible,
        isConfirmPasswordVisible,
        isLoadingPassword,
        handleUserUpdate,
        onSubmitChangePassword,
    }
}
