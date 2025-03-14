<script setup>
import { useAPI } from "@/composables/useAPI";
import { onMounted, ref, computed } from "vue";
import ViewDriver from "@/modal/ViewDriver.vue";
import AddDriver from "@/modal/AddDriver.vue";
import UpdateDriver from "@/modal/UpdateDriver.vue";

const api = useAPI();

const isLoading = ref(false);
const drivers = ref([]);
const selectedDriver = ref(null);
const newPagination = ref([]);
const currentPageGroup = ref(0);
const showModalDriver = ref(false);
const showModalAddDriver = ref(false);
const showModalUpdateDriver = ref(false);
const paginations = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  pageCount: 0,
});

onMounted(async () => {
  await fetchingData();
});

const fetchingData = async () => {
  isLoading.value = true;
  const response = await api.get("drivers", {
    params: {
      "populate[0]": "image",
      "populate[1]": "lorries",
      pagination: {
        page: paginations.value.page,
        pageSize: paginations.value.pageSize,
      },
    },
  });
  isLoading.value = false;
  drivers.value = response.data.data;

  if (response.data.data.length > 0) {
    drivers.value = response.data.data;
    paginations.value = response.data.meta.pagination;

    const arraypage = response.data.meta.pagination.pageCount;

    let numbers = [];

    for (let i = 0; i < arraypage; i++) {
      numbers.push(i + 1);
    }

    const grouped = numbers.reduce((acc, num, index) => {
      const groupIndex = Math.floor(index / 10);
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex].push(num);
      return acc;
    }, []);

    newPagination.value = grouped;
  }
};

const handleViewDetails = (data) => {
  selectedDriver.value = data;
  showModalDriver.value = true;
};

const handleCloseModalDetailsDriver = async () => {
  showModalDriver.value = false;
  selectedDriver.value = null;
  await fetchingData();
};

const onNext = async () => {
  const result = paginations.value.page + 1;
  if (result > paginations.value.pageCount) return;

  if (
    newPagination.value[currentPageGroup.value].find(
      (number) => number === result
    )
  ) {
    paginations.value.page = result;
    drivers.value = [];
    await fetchingData();
  } else {
    currentPageGroup.value = currentPageGroup.value + 1;
    paginations.value.page = result;
    drivers.value = [];
    await fetchingData();
  }
};

const onPrevious = async () => {
  const result = paginations.value.page - 1;
  if (result < 1) return;
  if (
    newPagination.value[currentPageGroup.value].find(
      (number) => number === result
    )
  ) {
    paginations.value.page = result;
    drivers.value = [];
    await fetchingData();
  } else {
    currentPageGroup.value = currentPageGroup.value - 1;
    paginations.value.page = result;
    drivers.value = [];
    await fetchingData();
  }
};

const handleClickPage = async (page) => {
  if (page === 1) {
    currentPageGroup.value = 0;
  } else if (
    newPagination.value[newPagination.value.length - 1].find(
      (item) => item === page
    )
  ) {
    currentPageGroup.value = newPagination.value.length - 1;
  }

  paginations.value.page = page;
  drivers.value = [];
  await fetchingData();
};

const handleGotoPreviousGroupedPage = async () => {
  const result = currentPageGroup.value - 1;
  currentPageGroup.value = result;
  paginations.value.page = newPagination.value[result][0];
  drivers.value = [];
  await fetchingData();
};

const handleGotoNextGroupedPage = async () => {
  const result = currentPageGroup.value + 1;
  currentPageGroup.value = result;
  paginations.value.page = newPagination.value[result][0];
  drivers.value = [];
  await fetchingData();
};

const computedArrayPage = computed(() => {
  return newPagination.value[currentPageGroup.value];
});

const handleCloseModalAddDriver = async () => {
  showModalAddDriver.value = false;
  drivers.value = [];
  await fetchingData();
};

const handleCloseModalUpdateDriver = async () => {
  showModalUpdateDriver.value = false;
  drivers.value = [];
  await fetchingData();
};

const handleUpdateDriver = (data) => {
  selectedDriver.value = data;
  showModalUpdateDriver.value = true;
};
</script>

<template>
  <div class="container">
    <div class="box-top py-3">
      <div class="box-action mb-2 d-flex justify-content-between">
        <h2>Driver</h2>
        <div class="d-flex align-items-center">
          <button
            class="btn btn-sm btn-primary"
            @click="showModalAddDriver = true"
          >
            Add New Driver
            <font-awesome-icon :icon="['fas', 'plus']" class="ms-2" />
          </button>
        </div>
      </div>
    </div>
    <div class="box-table py-3">
      <table class="table table-sm" id="table-driver">
        <thead>
          <tr>
            <th>NO</th>
            <th>IMAGE</th>
            <th>NAME</th>
            <th>NRIC</th>
            <th>LORRY</th>
            <th>ACTION(S)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(driver, index) in drivers"
            :key="index"
            class="align-middle"
          >
            <td>{{ index + 1 }}.</td>
            <td>
              <div
                class="box-image rounded-circle bg-dark overflow-hidden"
                v-if="driver.attributes.image.data"
              >
                <img
                  class="box-image img-fluid mx-auto d-block"
                  :src="driver.attributes.image.data.attributes.url"
                />
              </div>
              <div
                class="box-image rounded-circle bg-light overflow-hidden d-flex justify-content-center align-items-center"
                v-else
              >
                <div class="text-dark">
                  <font-awesome-icon :icon="['fas', 'user']" />
                </div>
              </div>
            </td>
            <td class="text-capitalize">
              {{ !driver.attributes.name ? "-" : driver.attributes.name }}
            </td>
            <td>
              {{
                !driver.attributes.ic_number ? "-" : driver.attributes.ic_number
              }}
            </td>
            <td>
              <div class="" v-if="driver.attributes.lorries.data.length > 0">
                <div
                  class="badge"
                  v-for="lorry in driver.attributes.lorries.data"
                  :key="lorry.attributes.id"
                >
                  {{ lorry.attributes.plate_number }}
                </div>
              </div>
              <div v-else>-</div>
            </td>
            <td>
              <button class="btn" @click="handleViewDetails(driver)">
                <font-awesome-icon :icon="['fas', 'list']" />
              </button>

              <button class="btn" @click="handleUpdateDriver(driver)">
                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="m-auto my-5" style="width: 30px" v-if="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div class="mt-4 d-flex w-100 justify-content-end" v-if="drivers.length">
        <nav aria-label="..." v-if="newPagination.length">
          <ul class="pagination mb-0 pagination-sm">
            <li
              class="page-item"
              :class="{
                disabled: paginations.page === 1,
                'page-item': true,
              }"
            >
              <a
                class="page-link"
                style="cursor: pointer"
                href="#"
                @click="onPrevious"
                >Previous</a
              >
            </li>
            <li
              class="page-item"
              v-if="
                paginations.page > 10 &&
                paginations.page <= paginations.pageCount
              "
              :class="{
                'page-item': true,
              }"
            >
              <a
                class="page-link"
                style="cursor: pointer"
                href="#"
                @click="handleClickPage(1)"
                >1</a
              >
            </li>
            <li
              class="page-item"
              :class="{
                disabled: currentPageGroup === 0,
              }"
            >
              <a
                class="page-link"
                href="#"
                style="cursor: pointer"
                @click="handleGotoPreviousGroupedPage"
                >...</a
              >
            </li>
            <li class="page-item" v-for="page in computedArrayPage" :key="page">
              <a
                class="page-link"
                style="cursor: pointer"
                :class="{
                  active: paginations.page === page,
                }"
                @click="handleClickPage(page)"
                >{{ page }}</a
              >
            </li>
            <li
              class="page-item"
              :class="{
                disabled: currentPageGroup === newPagination.length - 1,
              }"
            >
              <a
                class="page-link"
                style="cursor: pointer"
                href="#"
                @click="handleGotoNextGroupedPage"
                >...</a
              >
            </li>
            <li
              class="page-item"
              v-if="
                paginations.page > 10 &&
                paginations.page < paginations.pageCount
              "
              :class="{
                'page-item': true,
              }"
            >
              <a
                style="cursor: pointer"
                class="page-link"
                href="#"
                @click="handleClickPage(paginations.pageCount)"
                >{{ paginations.pageCount }}</a
              >
            </li>
            <li
              class="page-item"
              :class="{
                'page-item': true,
                disabled: paginations.page === paginations.pageCount,
              }"
            >
              <a
                style="cursor: pointer"
                class="page-link"
                href="#"
                @click="onNext"
                >Next</a
              >
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <ViewDriver
      v-if="showModalDriver"
      :data="selectedDriver"
      @close="handleCloseModalDetailsDriver()"
    />
    <AddDriver v-if="showModalAddDriver" @close="handleCloseModalAddDriver()" />
    <UpdateDriver
      v-if="showModalUpdateDriver"
      :data="selectedDriver"
      @close="handleCloseModalUpdateDriver()"
    />
  </div>
</template>

<style lang="scss" scoped>
.box-image {
  width: 60px;
  height: 60px;
}
</style>
