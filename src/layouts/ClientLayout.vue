<script setup>
import logoUrl from "../assets/images/logo.png";
import { useAuth } from "../composables/useAuth";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { watch } from "vue";
import { useClients } from "@/composables/useClients";
import moment from "moment";
// import { closeAllDropdowns } from "../helpers";

const { logout, user } = useAuth();
const router = useRouter();
const route = useRoute();
const { clients, fetchClients } = useClients();

//erf
const selectedClient = ref(null);
const selectedClientName = ref(null);
const themeMode = ref(localStorage.getItem("themeMode") || "light");

//watch

watch(selectedClientName, () => {
  if (
    selectedClientName.value &&
    selectedClient.value &&
    selectedClientName.value !== selectedClient.value.attributes.name
  ) {
    const cli = clients.value.find(
      (c) => c.attributes.name === selectedClientName.value
    );

    selectedClient.value = cli;

    // if (route.path.includes('live-fullscreen'))
    router.push({ name: `home`, params: { id: cli.id } });
    // else
    //     router.push(`/main/${project.slug}/live`)
  }
});

watch(selectedClient, () => {
  // console.log(selectedClient.value);
  if (selectedClient.value)
    selectedClientName.value = selectedClient.value.attributes.name;
  const findElement = document.getElementById("img-container");

  if (findElement) {
    findElement.style.backgroundImage = `url(${selectedClient.value.attributes.logo.data.attributes.url})`;
    findElement.style.backgroundPosition = "center";
    findElement.style.backgroundSize = "cover";
    findElement.style.backgroundRepeat = "no-repeat";
    findElement.style.padding = "8px";
    findElement.style.backgroundOrigin = "content-box";
    findElement.style.height = "30px";
    findElement.style.width = "30px";
  }
});

// Computed
const clientOptions = computed(() => {
  if (clients.value && clients.value.length === 0) return [];
  // console.log(clients.value);
  // console.log(user.value.user.clients.map((client) => client.attributes.name));
  return clients.value.map((client) => client.attributes.name);
});

onMounted(() => {
  setupClient();
  if (!localStorage.getItem("manualThemeChange")) {
    setThemeByTime(); // Initial theme setting based on time if no manual change
  } else {
    document.documentElement.setAttribute("data-bs-theme", themeMode.value);
  }
});

const setThemeByTime = () => {
  if (localStorage.getItem("manualThemeChange") === "true") return; // Skip if user changed manually

  const currentHour = new Date().getHours();
  themeMode.value = currentHour >= 19 || currentHour < 6 ? "dark" : "light";

  // Update DOM and save in localStorage
  document.documentElement.setAttribute("data-bs-theme", themeMode.value);
  localStorage.setItem("themeMode", themeMode.value);
};

async function setupClient() {
  if (clients.value.length == 0) {
    await fetchClients();
  }
  if (route.params.id) {
    selectedClient.value = clients.value.find(
      (client) => client.id == route.params.id
    );
  }
}

function performLogout() {
  logout(() => {
    router.push("/login");
  });
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const toggleTheme = () => {
  themeMode.value = themeMode.value === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", themeMode.value);

  // Mark as a manual change and store today's date
  localStorage.setItem("themeMode", themeMode.value);
  localStorage.setItem("manualThemeChange", "true"); // User has set theme manually
  localStorage.setItem("lastManualChangeDate", getTodayDate()); // Store the date of manual change
};
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
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 text-capitalize">
          <li>
            <div
              class="vr d-none d-lg-flex h-100 mx-lg-2"
              v-if="$route.query.client !== 'all'"
            />
          </li>
          <li
            class="nav-item mt-3 mt-md-0 mb-3 mb-md-0"
            v-if="$route.query.client !== 'all'"
          >
            <div class="d-flex justify-content-center align-items-center h-100">
              <!-- <v-select
                v-model="selectedClientName"
                :options="clientOptions"
                style="width: 250px"
              ></v-select> -->

              <div class="dropdown d-flex align-items-center">
                <div id="img-container"></div>
                <button
                  class="btn dropdown-toggle px-1 border-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="user.user.clients.length"
                >
                  {{ selectedClientName }}
                </button>
                <ul class="dropdown-menu" v-if="clients.length">
                  <li v-for="client in clients" :key="client.id">
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="selectedClientName = client.attributes.name"
                      >{{ client.attributes.name }}</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </li>
          <li>
            <div
              class="vr d-none d-lg-flex h-100 mx-lg-2"
              v-if="$route.query.client !== 'all'"
            />
          </li>
          <li
            class="nav-item me-3 align-items-center d-flex"
            :class="{
              'text-muted opacity-75':
                $route.name !== 'home' || $route.name !== 'camera',
            }"
          >
            <router-link
              v-if="$route.query.client !== 'all'"
              :to="{ name: 'home', params: { id: $route.params.id } }"
              :class="{
                'nav-link': true,
                active: $route.name === 'home' || $route.name === 'camera',
              }"
              ><font-awesome-icon
                icon="fa-solid fa-map-marker-alt"
                class="me-2"
              />Home
            </router-link>
            <router-link
              v-else
              :to="{ name: 'map' }"
              :class="{
                'nav-link': true,
                active: $route.name === 'home' || $route.name === 'camera',
              }"
              ><font-awesome-icon
                icon="fa-solid fa-map-marker-alt"
                class="me-2"
              />Home
            </router-link>
          </li>
          <li
            class="nav-item me-3 align-items-center d-flex"
            :class="{
              'text-muted opacity-75': $route.name !== 'live',
            }"
            v-if="$route.query.client !== 'all'"
          >
            <router-link
              :to="{ name: 'live', params: { id: $route.params.id } }"
              :class="{ 'nav-link': true, active: $route.name === 'live' }"
              ><font-awesome-icon icon="fa-solid fa-tv" class="me-2" /> Live
              Monitoring</router-link
            >
          </li>
          <li
            class="nav-item dropdown"
            :class="{
              'text-muted': $route.name !== 'vehicles',
            }"
            v-if="$route.query.client !== 'all'"
          >
            <a
              class="nav-link dropdown-toggle me-3"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <font-awesome-icon
                icon="fa-solid fa-crosshairs"
                class="me-2 disabled"
              />AI Scenario
            </a>
            <ul class="dropdown-menu">
              <li>
                <h6 class="dropdown-header small"><small>Vehicle</small></h6>
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/vehicles`"
                  :class="{
                    'dropdown-item': true,
                    active: $route.name === 'vehicles',
                    disabled: false,
                  }"
                >
                  Vehicle Tracking</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/hotlist`"
                  :class="{
                    'dropdown-item': true,
                    active: $route.name === 'hotlist',
                    disabled: false,
                  }"
                >
                  Hotlisted Vehicle</a
                >
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <h6 class="dropdown-header small"><small>Detection</small></h6>
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/defect?type=all_detection`"
                  :class="{
                    'dropdown-item': true,
                    active:
                      $route.name === 'defect' &&
                      route.query.type === 'all_detection',
                    disabled: false,
                  }"
                >
                  All Detection</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/defect?type=faded_roadline`"
                  :class="{
                    'dropdown-item': true,
                    active:
                      $route.name === 'defect' &&
                      route.query.type === 'faded_roadline',
                    disabled: false,
                  }"
                >
                  Faded Roadline</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/defect?type=illegal_dumping`"
                  :class="{
                    'dropdown-item': true,
                    active:
                      $route.name === 'defect' &&
                      route.query.type === 'illegal_dumping',
                    disabled: false,
                  }"
                >
                  Illegal Dumping</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/defect?type=illegal_bunting`"
                  :class="{
                    'dropdown-item': true,
                    active:
                      $route.name === 'defect' &&
                      route.query.type === 'illegal_bunting',
                    disabled: false,
                  }"
                >
                  Illegal Bunting</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/defect?type=broken_signage`"
                  :class="{
                    'dropdown-item': true,
                    active:
                      $route.name === 'defect' &&
                      route.query.type === 'broken_signage',
                    disabled: false,
                  }"
                >
                  Broken Signage</a
                >
              </li>
            </ul>
          </li>
          <li class="nav-item me-3">
            <router-link
              :to="{
                name: 'analytics',
                params: { id: $route.params.id },
                query: { client: $route.params.id },
              }"
              :class="{ 'nav-link': true, active: $route.name === 'analytics' }"
              ><font-awesome-icon
                :icon="['fas', 'chart-column']"
                class="me-2"
              />
              Analytics
            </router-link>
          </li>
          <!-- <li class="nav-item me-3">
            <router-link
              :to="{ name: 'ai', params: { id: $route.params.id } }"
              :class="{ 'nav-link': true, active: $route.name === 'ai' }"
              ><font-awesome-icon
                icon="fa-solid fa-code"
                class="me-2 disabled"
              />
              AI
            </router-link>
          </li> -->
          <!-- <li class="nav-item me-3">
            <router-link
              :to="{ name: 'vehicles', params: { id: $route.params.id } }"
              :class="{
                'nav-link': true,
                active: $route.name === 'vehicles',
                disabled: false,
              }"
              ><font-awesome-icon
                icon="fa-solid fa-car-alt"
                class="me-1 disabled"
              />
              Vehicles
            </router-link>
          </li> -->
          <!-- <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <font-awesome-icon
                icon="fa-solid fa-car-alt"
                class="me-2 disabled"
              />Vehicles
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link
                  :to="{ name: 'vehicles', params: { id: $route.params.id } }"
                  :class="{
                    'dropdown-item': true,
                    active: $route.name === 'vehicles',
                    disabled: false,
                  }"
                >
                  Live Monitoring
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'search', params: { id: $route.params.id } }"
                  :class="{
                    'dropdown-item': true,
                    active: $route.name === 'search',
                    disabled: false,
                  }"
                >
                  Search
                </router-link>
              </li>
            </ul>
          </li> -->

          <!-- <li class="nav-item me-3">
            <router-link
              to="/utm"
              :class="{ 'nav-link': true, active: $route.path === '/utm' }"
              ><font-awesome-icon
                icon="fa-solid fa-location-arrow"
                class="me-1"
              />
              Drone UTM</router-link
            >
          </li>

          <li class="nav-item">
            <router-link
              to="/ai"
              :class="{ 'nav-link': true, active: $route.path === '/ai' }"
              ><font-awesome-icon icon="fa-solid fa-code" class="me-1" /> AI
              Reports</router-link
            >
          </li> -->
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
              <font-awesome-icon icon="fa-solid fa-user-circle" class="me-2" />
              {{ user.user.username }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <h6 class="dropdown-header">{{ user.user.email }}</h6>
              </li>
              <li><div class="dropdown-divider"></div></li>
              <li v-if="user.user.role && user.user.role.type == 'admin'">
                <a
                  class="dropdown-item mb-1"
                  :href="`/main/${route.params.id}/qc?client=${route.params.id}`"
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

        <!-- <div class="navbar-text" v-if="user">
                    <font-awesome-icon icon="fa-solid fa-user-circle" class="me-1" /> {{ user.email }}
                </div> -->
      </div>
    </div>
  </nav>
  <slot />
</template>

<style scoped>
:deep(*) {
  --vs-controls-color: #b0b0b1;
  --vs-border-color: #495057;
  --vs-dropdown-bg: #282c34;
  --vs-dropdown-color: #cccccc;
  --vs-dropdown-option-color: #fff;

  --vs-selected-bg: #493aef;
  --vs-selected-color: #eeeeee;

  --vs-search-input-color: #eeeeee;

  --vs-dropdown-option--active-bg: #493aef;
  --vs-dropdown-option--active-color: #eeeeee;
}
</style>