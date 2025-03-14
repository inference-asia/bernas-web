<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useAPI } from "../composables/useAPI";
import moment from "moment";
import ViewActivityVue from "@/modal/ViewActivity.vue";

const api = useAPI();

const showModalViewData = ref(false);
const selectedData = ref(null);
const isLoading = ref(false);
const dataSource = ref([]);
const timeFormat = ref("DD/MM/YYYY h:mm A");
const dateFilter = ref([
  moment().subtract(7, "days").startOf("days"),
  moment().endOf("days"),
]);
const dateFormat = ref("DD/MM/YYYY");

const paginations = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  pageCount: 0,
});
const currentPageGroup = ref(0);
const newPagination = ref([]);
const countTotalWeight = ref(0);
const countTotalWeightMonthly = ref(0);

onMounted(async () => {
  await fetchingData();
  await countWeight();
  await countWeightMonth();
});

watch(
  () => dateFilter.value,
  async (newDate, oldDate) => {
    if (newDate) {
      dataSource.value = [];
      await fetchingData();
      await countWeight();
    }
  }
);

const fetchingData = async () => {
  isLoading.value = true;
  const startDate = moment(dateFilter.value[0]).startOf("days").toISOString();
  const endDate = moment(dateFilter.value[1]).endOf("days").toISOString();
  const response = await api.get(`/activities`, {
    params: {
      "populate[0]": "driver",
      "populate[1]": "lorry",
      sort: "createdAt:DESC",
      filters: {
        $and: [
          {
            createdAt: {
              $gte: startDate,
            },
          },
          {
            createdAt: {
              $lte: endDate,
            },
          },
        ],
      },
      pagination: {
        page: paginations.value.page,
        pageSize: paginations.value.pageSize,
      },
    },
  });
  isLoading.value = false;
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
    await countWeight();
  } else {
    currentPageGroup.value = currentPageGroup.value + 1;
    paginations.value.page = result;
    dataSource.value = [];
    await fetchingData();
    await countWeight();
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
    await countWeight();
  } else {
    currentPageGroup.value = currentPageGroup.value - 1;
    paginations.value.page = result;
    dataSource.value = [];
    await fetchingData();
    await countWeight();
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
  await countWeight();
};

const handleGotoPreviousGroupedPage = async () => {
  const result = currentPageGroup.value - 1;
  currentPageGroup.value = result;
  paginations.value.page = newPagination.value[result][0];
  dataSource.value = [];
  await fetchingData();
  await countWeight();
};

const handleGotoNextGroupedPage = async () => {
  const result = currentPageGroup.value + 1;
  currentPageGroup.value = result;
  paginations.value.page = newPagination.value[result][0];
  dataSource.value = [];
  await fetchingData();
  await countWeight();
};

const dateFormatPicker = (date) => {
  const startday = moment(date[0]).format("DD");
  const startmonth = moment(date[0]).format("MM");
  const startyear = moment(date[0]).format("YYYY");

  const endday = moment(date[1]).format("DD");
  const endmonth = moment(date[1]).format("MM");
  const endyear = moment(date[1]).format("YYYY");

  return `${startday}/${startmonth}/${startyear} ~ ${endday}/${endmonth}/${endyear}`;
};

const downloadCSVFromJSON = async () => {
  const data = await fetchingDataAll();

  let arrayItem = [];
  if (!data.length) return;
  for (let i = 0; i < data.length; i++) {
    arrayItem.push({
      NO: i + 1,
      DRIVER: !data[i].attributes.driver.data
        ? "-"
        : data[i].attributes.driver.data.attributes.name.toUpperCase(),
      LORRY: "-",
      ["PLATE NUMBER"]: !data[i].attributes.plateNumber
        ? "-"
        : data[i].attributes.plateNumber,
      ["PLATE NUMBER"]: "-",
      ["WEIGHT IN"]: !data[i].attributes.weight_in
        ? "-"
        : data[i].attributes.weight_out,
      ["WEIGHT OUT"]: !data[i].attributes.weight_out
        ? "-"
        : data[i].attributes.weight_in,
      ["WEIGHT DIFF"]: !data[i].attributes.weight_diff
        ? "-"
        : data[i].attributes.weight_diff,
      ["TIME IN"]: !data[i].attributes.timestamp_in
        ? "-"
        : moment(data[i].attributes.timestamp_in).format(timeFormat.value),
      ["TIME OUT"]: !data[i].attributes.timestamp_out
        ? "-"
        : moment(data[i].attributes.timestamp_out).format(timeFormat.value),
    });
  }
  if (!arrayItem.length) return;
  const headers = Object.keys(arrayItem[0]).join(",");
  const rows = arrayItem.map((obj) =>
    Object.values(obj)
      .map((value) => `"${value}"`)
      .join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    `ACTIVITY LOG ${moment(dateFilter.value[0])
      .startOf("days")
      .format("DD/MM/YYYY")} - ${moment(dateFilter.value[1])
      .endOf("days")
      .format("DD/MM/YYYY")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fetchingDataAll = async () => {
  const startDate = moment(dateFilter.value[0]).startOf("days").toISOString();
  const endDate = moment(dateFilter.value[1]).endOf("days").toISOString();
  const response = await api.get(`/activities`, {
    params: {
      "populate[0]": "driver",
      "populate[1]": "lorry",
      filters: {
        $and: [
          {
            createdAt: {
              $gte: startDate,
            },
          },
          {
            createdAt: {
              $lte: endDate,
            },
          },
        ],
      },
    },
  });

  return response.data.data;
};

const computedArrayPage = computed(() => {
  return newPagination.value[currentPageGroup.value];
});

const countWeight = async () => {
  const startDate = moment(dateFilter.value[0]).startOf("days").toISOString();
  const endDate = moment(dateFilter.value[1]).endOf("days").toISOString();
  const response = await api.get(`/activities`, {
    params: {
      filters: {
        $and: [
          {
            createdAt: {
              $gte: startDate,
            },
          },
          {
            createdAt: {
              $lte: endDate,
            },
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 300,
      },
    },
  });

  const newData = response.data.data;

  // Calculate Weight Total
  const filteredData = newData.filter((obj) => obj.attributes.weight_in);
  const calculateWeightTotal = filteredData.reduce(
    (a, b) => a + b.attributes.weight_in,
    0
  );
  countTotalWeight.value = calculateWeightTotal;
};

const countWeightMonth = async () => {
  const monthIndex = moment().format("MM") - 1; // July (0-indexed)
  const year = moment().format("YYYY");

  // First day of the month
  const firstDay = moment()
    .year(year)
    .month(monthIndex)
    .startOf("month")
    .toISOString();

  // Last day of the month
  const lastDay = moment()
    .year(year)
    .month(monthIndex)
    .endOf("month")
    .toISOString();

  const response = await api.get(`/activities`, {
    params: {
      filters: {
        $and: [
          {
            createdAt: {
              $gte: firstDay,
            },
          },
          {
            createdAt: {
              $lte: lastDay,
            },
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 300,
      },
    },
  });

  const newData = response.data.data;

  // Calculate Weight Total
  const filteredData = newData.filter((obj) => obj.attributes.weight_in);
  const calculateWeightTotal = filteredData.reduce(
    (a, b) => a + b.attributes.weight_in,
    0
  );
  countTotalWeightMonthly.value = calculateWeightTotal;
};

const handleViewDetails = (data) => {
  showModalViewData.value = true;
  selectedData.value = data;
};

const handleClose = async () => {
  showModalViewData.value = false;
  selectedData.value = null;
  dataSource.value = [];
  await fetchingData();
  await countWeight();
};
</script>

<template>
  <div class="container">
    <div class="box-top py-3">
      <div class="box-action mb-2 d-flex justify-content-between">
        <h2>&nbsp;</h2>
        <div class="d-flex align-items-center">
          <VueDatePicker
            range
            v-model="dateFilter"
            :format="dateFormatPicker"
            :dark="true"
            :clearable="false"
            :enable-time-picker="false"
          />
          <button
            class="btn btn-primary btn-sm ms-2"
            :disabled="dataSource.length === 0"
            style="width: 250px"
            @click="downloadCSVFromJSON"
          >
            Export Data
            <font-awesome-icon
              :icon="['fas', 'download']"
              size="sm"
              class="ms-2"
            />
          </button>
        </div>
      </div>
      <div class="box-dashboard border-bottom pb-3">
        <div class="row">
          <div class="col">
            <div class="card bg-primary-light border-0">
              <div class="card-body">
                <p class="mb-1 text-primary small">Total Weight</p>
                <div class="d-flex align-items-center">
                  <font-awesome-icon
                    :icon="['fas', 'scale-balanced']"
                    class="me-2"
                  />
                  <h2 class="fw-bold me-2">{{ countTotalWeight }}</h2>
                  <p class="mb-0">kg</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card bg-primary-light border-0">
              <div class="card-body">
                <p class="mb-1 text-primary small">
                  Total Weight in {{ moment().format("MMMM") }}
                </p>
                <div class="d-flex align-items-center">
                  <font-awesome-icon
                    :icon="['fas', 'scale-balanced']"
                    class="me-2"
                  />
                  <h2 class="fw-bold me-2">{{ countTotalWeightMonthly }}</h2>
                  <p class="mb-0">kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box-table py-3">
        <table class="table table-sm" id="myTable">
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
            <tr
              v-for="(data, index) in dataSource"
              :key="index"
              class="align-middle"
            >
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
                  !data.attributes.weight_in
                    ? "-"
                    : data.attributes.weight_in + "kg"
                }}
              </td>
              <td>
                {{
                  !data.attributes.weight_out
                    ? "-"
                    : data.attributes.weight_out + "kg"
                }}
              </td>
              <td>
                {{
                  !data.attributes.weight_diff
                    ? "-"
                    : data.attributes.weight_diff + "kg"
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
                  <font-awesome-icon
                    :icon="['fas', 'list']"
                    @click="handleViewDetails(data)"
                  />
                </button>
                <!-- <button class="btn">
                  <font-awesome-icon :icon="['fas', 'download']" />
                </button>
                <button class="btn">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button> -->
              </td>
            </tr>
          </tbody>
        </table>
        <div class="m-auto my-5" style="width: 30px" v-if="isLoading">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
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
              <li
                class="page-item"
                v-for="page in computedArrayPage"
                :key="page"
              >
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
    </div>
    <ViewActivityVue
      v-if="showModalViewData"
      :data="selectedData"
      @close="handleClose()"
    />
  </div>
</template>
