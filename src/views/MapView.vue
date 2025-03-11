<script setup>
import { computed, onMounted, ref } from "vue";
import { useAPI } from "../composables/useAPI";
import moment from "moment";

const api = useAPI();

const dataSource = ref([]);
const timeFormat = ref("DD/MM/YYYY h:mm A");

const paginations = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  pageCount: 0,
});
const currentPageGroup = ref(0);
const newPagination = ref([]);

onMounted(() => {
  fetchingData();
});

const fetchingData = async () => {
  const response = await api.get(`/activities`, {
    params: {
      "populate[0]": "driver",
      "populate[1]": "lorry",
      pagination: {
        page: paginations.value.page,
        pageSize: paginations.value.pageSize,
      },
    },
  });
  console.log(response.data.data);

  if (response.data.data.length > 0) {
    dataSource.value = response.data.data;
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

const onNext = async () => {
  const result = paginations.value.page + 1;
  if (result > paginations.value.pageCount) return;

  if (
    newPagination.value[currentPageGroup.value].find(
      (number) => number === result
    )
  ) {
    paginations.value.page = result;
    dataSource.value = [];
    await fetchingData();
  } else {
    currentPageGroup.value = currentPageGroup.value + 1;
    paginations.value.page = result;
    dataSource.value = [];
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
    dataSource.value = [];
    await fetchingData();
  } else {
    currentPageGroup.value = currentPageGroup.value - 1;
    paginations.value.page = result;
    dataSource.value = [];
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
  dataSource.value = [];
  await fetchingData();
};

const handleGotoPreviousGroupedPage = async () => {
  const result = currentPageGroup.value - 1;
  currentPageGroup.value = result;
  paginations.value.page = newPagination.value[result][0];
  dataSource.value = [];
  await fetchingData();
};

const handleGotoNextGroupedPage = async () => {
  const result = currentPageGroup.value + 1;
  currentPageGroup.value = result;
  paginations.value.page = newPagination.value[result][0];
  dataSource.value = [];
  await fetchingData();
};

const computedArrayPage = computed(() => {
  return newPagination.value[currentPageGroup.value];
});
</script>

<template>
  <div class="container">
    <div class="box-top py-3">
      <div class="box-action mb-2 d-flex justify-content-between">
        <h2>&nbsp;</h2>
        <button class="btn btn-primary">
          Export Data
          <font-awesome-icon :icon="['fas', 'download']" class="ms-2" />
        </button>
      </div>
      <div class="box-dashboard border-bottom pb-3">
        <div class="row">
          <div class="col">
            <div class="card bg-primary-light">
              <div class="card-body">
                <p class="mb-1 text-primary small">Total Weight</p>
                <div class="d-flex align-items-center">
                  <font-awesome-icon
                    :icon="['fas', 'scale-balanced']"
                    class="me-2"
                  />
                  <h2 class="fw-bold me-2">123</h2>
                  <p class="mb-0">kg</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card bg-primary-light">
              <div class="card-body">
                <p class="mb-1 text-primary small">Total Weight Monthly</p>
                <div class="d-flex align-items-center">
                  <font-awesome-icon
                    :icon="['fas', 'scale-balanced']"
                    class="me-2"
                  />
                  <h2 class="fw-bold me-2">123</h2>
                  <p class="mb-0">kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box-table py-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>NO</th>
              <th>DRIVER</th>
              <th>LORRY</th>
              <th>PLATE NUMBER</th>
              <th>WEIGHT IN</th>
              <th>WEIGHT OUT</th>
              <th>WEIGHT DIFFERENT</th>
              <th>TIME IN</th>
              <th>TIME OUT</th>
              <th>ACTION(S)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in dataSource" :key="index">
              <td>{{ index + 1 }}.</td>
              <td class="text-capitalize">
                {{
                  !data.attributes.driver || !data.attributes.driver.data
                    ? "-"
                    : data.attributes.driver.data.attributes.name
                }}
              </td>
              <td>-</td>
              <td>
                {{
                  !data.attributes.plateNumber
                    ? "-"
                    : data.attributes.plateNumber
                }}
              </td>
              <td>
                {{
                  !data.attributes.weight_in ? "-" : data.attributes.weight_in
                }}
              </td>
              <td>
                {{
                  !data.attributes.weight_out ? "-" : data.attributes.weight_out
                }}
              </td>
              <td>
                {{
                  !data.attributes.weight_diff
                    ? "-"
                    : data.attributes.weight_diff
                }}
              </td>
              <td>
                {{
                  !data.attributes.timestamp_in
                    ? "-"
                    : moment(data.attributes.timestamp_in).format(timeFormat)
                }}
              </td>
              <td>
                {{
                  !data.attributes.timestamp_out
                    ? "-"
                    : moment(data.attributes.timestamp_out).format(timeFormat)
                }}
              </td>
              <td>
                <button class="btn">
                  <font-awesome-icon :icon="['fas', 'list']" />
                </button>
                <button class="btn">
                  <font-awesome-icon :icon="['fas', 'download']" />
                </button>
                <button class="btn">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          class="mt-4 d-flex w-100 justify-content-end"
          v-if="dataSource.length"
        >
          <nav aria-label="..." v-if="newPagination.length">
            <ul class="pagination mb-0 pagination-sm">
              <li
                class="page-item"
                :class="{
                  disabled: paginations.page === 1,
                  'page-item': true,
                }"
              >
                <a class="page-link" href="#" @click="onPrevious">Previous</a>
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
                <a class="page-link" href="#" @click="handleClickPage(1)">1</a>
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
                  @click="handleGotoPreviousGroupedPage"
                  >...</a
                >
              </li>
              <li
                class="page-item"
                v-for="page in computedArrayPage"
                :key="page"
              >
                <a
                  class="page-link"
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
                <a class="page-link" href="#" @click="handleGotoNextGroupedPage"
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
                <a class="page-link" href="#" @click="onNext">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
