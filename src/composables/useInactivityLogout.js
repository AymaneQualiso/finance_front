import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';
import { debounce } from 'lodash';

export function useInactivityLogout(timeout = 15 * 60 * 1000) { 
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const timer = ref(null);
    const countdown = ref(timeout / 1000); 
    const mouseMoveCounter = ref(0);
    let countdownInterval = null;

    // const log = (message) => {
    //     console.log(`[InactivityLogout]: ${message}`);
    // };

    const startCountdown = () => {
        if (countdownInterval) clearInterval(countdownInterval);
        countdown.value = timeout / 1000;

        countdownInterval = setInterval(() => {
            countdown.value--;
            // log(`  chrono: ${countdown.value} seconds`);

            if (countdown.value <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    };

    const resetTimer = () => {
        if (timer.value) {
            clearTimeout(timer.value);
            // log('Timer cleared and restarted');
        }
        timer.value = setTimeout(logout, timeout);
        startCountdown(); 
        // log(`Timer set for ${timeout / 1000} seconds`);
    };

    const logout = async () => {
        // log('User inactivity timeout reached. Logging out...');
        try {
            await authStore.logout();
            // log('User successfully logged out');

            if (route.name !== 'login') {
                await router.push({ name: 'login' });
                // log('Redirected to login page');
            }
        } catch (error) {
            // log(`Logout failed: ${error.message}`);
        }
    };

    const handleMouseMove = debounce(() => {
        mouseMoveCounter.value++;
        // log(`User activity detected. Interaction count: ${mouseMoveCounter.value}`);
        resetTimer();
    }, 300);

    const setupEventListeners = () => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('click', resetTimer);
        // log('Event listeners added');
    };

    const removeEventListeners = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keypress', resetTimer);
        window.removeEventListener('click', resetTimer);
        if (countdownInterval) clearInterval(countdownInterval);
        // log('Event listeners removed');
    };

    onMounted(() => {
        setupEventListeners();
        resetTimer();
        // log('Inactivity logout system initialized');
    });

    onUnmounted(() => {
        removeEventListeners();
        if (timer.value) {
            clearTimeout(timer.value);
            // log('Timer cleared on unmount');
        }
    });

    return {
        resetTimer,
        countdown, 
        mouseMoveCounter,
    };
}
