<script setup>
import logoUrl from "../assets/images/logo.png";
import { useAuth } from "../composables/useAuth";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";
import { useClients } from "@/composables/useClients";
// import { closeAllDropdowns } from "../helpers";

const { clients } = useClients();

const { logout, user } = useAuth();
const route = useRoute();
const router = useRouter();
const themeMode = ref(localStorage.getItem("themeMode") || "light");

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const isManualChange = localStorage.getItem("manualThemeChange") === "true";
const lastManualChangeDate = localStorage.getItem("lastManualChangeDate");

if (isManualChange && lastManualChangeDate !== getTodayDate()) {
  localStorage.removeItem("manualThemeChange");
  localStorage.removeItem("lastManualChangeDate");
}

const setThemeByTime = () => {
  if (localStorage.getItem("manualThemeChange") === "true") return; // Skip if user changed manually

  const currentHour = new Date().getHours();
  themeMode.value = currentHour >= 19 || currentHour < 6 ? "dark" : "light";

  // Update DOM and save in localStorage
  document.documentElement.setAttribute("data-bs-theme", themeMode.value);
  localStorage.setItem("themeMode", themeMode.value);
};

const toggleTheme = () => {
  themeMode.value = themeMode.value === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", themeMode.value);

  // Mark as a manual change and store today's date
  localStorage.setItem("themeMode", themeMode.value);
  localStorage.setItem("manualThemeChange", "true"); // User has set theme manually
  localStorage.setItem("lastManualChangeDate", getTodayDate()); // Store the date of manual change
};

watch(themeMode, (newTheme) => {
  localStorage.setItem("themeMode", newTheme);
});

onMounted(() => {
  if (!localStorage.getItem("manualThemeChange")) {
    setThemeByTime(); // Initial theme setting based on time if no manual change
  } else {
    document.documentElement.setAttribute("data-bs-theme", themeMode.value);
  }

  // Check theme every hour based on time if no manual change
  setInterval(setThemeByTime, 10000); // 3600000 ms = 1 hour
});

onMounted(() => {
  // console.log(user.value);
});

function performLogout() {
  logout(() => {
    router.push("/login");
  });
}
</script>

<template>
  <nav class="navbar sticky-top navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand me-4">
        <img :src="logoUrl" alt="" height="40" />
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item me-3">
            <a class="nav-link" href="/"
              ><font-awesome-icon :icon="['fas', 'house']" class="me-2" />
              Dashboard
            </a>
          </li>
          <li class="nav-item me-3" v-if="clients.length">
            <a
              class="nav-link"
              :href="`main/${clients[0].id}/analytics?client=all`"
              ><font-awesome-icon
                :icon="['fas', 'chart-column']"
                class="me-2"
              />
              Analytics
            </a>
          </li>
        </ul>
        <ul class="navbar-nav mb-2 mb-lg-0">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <font-awesome-icon
                v-if="themeMode === 'dark'"
                :icon="['fas', 'moon']"
                class="me-1"
              />
              <font-awesome-icon
                v-if="themeMode === 'light'"
                :icon="['fas', 'sun']"
                class="me-1"
              />
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  class="btn btn-sm text-capitalize dropdown-item"
                  :class="{
                    'btn-dark': themeMode !== 'dark',
                    'btn-light': themeMode !== 'light',
                  }"
                  @click="toggleTheme"
                >
                  <font-awesome-icon
                    v-if="themeMode !== 'dark'"
                    :icon="['fas', 'moon']"
                    class="me-1"
                  />
                  <font-awesome-icon
                    v-if="themeMode !== 'light'"
                    :icon="['fas', 'sun']"
                    class="me-1"
                  />
                  {{ themeMode === "light" ? "Dark" : "Light" }}
                </button>
              </li>
            </ul>
          </li>
          <li><div class="vr d-none d-lg-flex h-100 mx-lg-2" /></li>
        </ul>
        <ul class="navbar-nav mb-2 mb-lg-0 d-none d-md-block">
          <li class="nav-item dropdown" v-if="user">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <font-awesome-icon icon="fa-solid fa-user-circle" class="me-1" />
              {{ user.user.email }}
            </a>

            <ul class="dropdown-menu">
              <li>
                <h6 class="dropdown-header">{{ user.user.email }}</h6>
              </li>
              <li><div class="dropdown-divider"></div></li>
              <li v-if="user.user.role && user.user.role.type == 'admin'">
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/qc?client=all`"
                  :class="{
                    'dropdown-item': true,
                    active: $route.name === 'qc',
                    disabled: false,
                  }"
                >
                  QC Detection</a
                >
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="performLogout">
                  Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <slot />
</template>