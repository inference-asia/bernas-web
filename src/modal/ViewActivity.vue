<script setup>
import { useAPI } from "@/composables/useAPI";
import { Modal } from "bootstrap";
import { onBeforeUnmount, onMounted, ref } from "vue";
import ViewImage from "@/modal/ViewImage.vue";

const api = useAPI();
let modal;
const props = defineProps(["data"]);
const emit = defineEmits(["close"]);

const formData = ref({
  driver: null,
  lorry: null,
  weight_in: null,
  weight_out: null,
  weight_diff: null,
  plateNumber: null,
  timestamp_in: null,
  timestamp_out: null,
  driver_in: null,
  driver_out: null,
  plate_in: null,
  plate_out: null,
  content_in: null,
  content_out: null,
  scale_in: null,
  scale_out: null,
});

const showModalViewImage = ref(false);
const selectedImage = ref(null);

onMounted(async () => {
  modal = new Modal(document.getElementById("activity-modal"), {
    backdrop: "static",
  });

  if (!props.data) return;

  const response = await api.get(`/activities/${props.data.id}`, {
    params: {
      "populate[0]": "driver",
      "populate[1]": "lorry",
      "populate[2]": "image_driver_in",
      "populate[3]": "image_driver_out",
      "populate[4]": "image_plate_in",
      "populate[5]": "image_plate_out",
    },
  });

  const newData = response.data.data;
  if (!newData) return;
  formData.value.driver_in = !newData.attributes.image_driver_in
    ? null
    : newData.attributes.image_driver_in.data.attributes.url;
  formData.value.driver_out = !newData.attributes.image_driver_out
    ? null
    : newData.attributes.image_driver_out.data.attributes.url;
  formData.value.plate_in = !newData.attributes.image_plate_in
    ? null
    : newData.attributes.image_plate_in.data.attributes.url;
  formData.value.plate_out = !newData.attributes.image_plate_out
    ? null
    : newData.attributes.image_plate_out.data.attributes.url;
  formData.value.content_in = !newData.attributes.image_content_in
    ? null
    : newData.attributes.image_content_in.data.attributes.url;
  formData.value.content_out = !newData.attributes.image_content_out
    ? null
    : newData.attributes.image_scale_in.data.attributes.url;
  formData.value.scale_in = !newData.attributes.image_scale_in
    ? null
    : newData.attributes.image_content_in.data.attributes.url;
  formData.value.scale_out = !newData.attributes.image_scale_out
    ? null
    : newData.attributes.image_scale_out.data.attributes.url;

  formData.value.driver = !props.data.attributes.driver.data
    ? null
    : props.data.attributes.driver.data.attributes.name;
  formData.value.lorry = !props.data.attributes.lorry.data
    ? null
    : props.data.attributes.lorry.data.attributes.name;
  formData.value.weight_in = !props.data.attributes.weight_in
    ? null
    : props.data.attributes.weight_in;
  formData.value.weight_out = !props.data.attributes.weight_out
    ? null
    : props.data.attributes.weight_out;
  formData.value.weight_diff = !props.data.attributes.weight_diff
    ? null
    : props.data.attributes.weight_diff;
  formData.value.plateNumber = !props.data.attributes.plateNumber
    ? null
    : props.data.attributes.plateNumber;

  modal.show();
});

onBeforeUnmount(() => {
  modal.hide();
});

const handleOpenModalViewImage = (img) => {
  showModalViewImage.value = true;
  selectedImage.value = img;
};

const handleCloseModalViewImage = () => {
  showModalViewImage.value = false;
  selectedImage.value = null;
};
</script>

<template>
  <div class="modal modal-xl" id="activity-modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">ID #{{ data.id }}</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="emit('close')"
          ></button>
        </div>

        <div class="modal-body">
          <form>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="driver" class="form-label">DRIVER</label>
                  <input
                    type="text"
                    class="form-control"
                    id="driver"
                    v-model="formData.driver"
                    disabled
                  />
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="lorry" class="form-label">LORRY</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lorry"
                    v-model="formData.lorry"
                    disabled
                  />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">WEIGHT IN</label>
                  <input
                    type="text"
                    class="form-control"
                    id="weight_in"
                    v-model="formData.weight_in"
                    disabled
                  />
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_out" class="form-label">WEIGHT OUT</label>
                  <input
                    type="text"
                    class="form-control"
                    id="weight_out"
                    v-model="formData.weight_out"
                    disabled
                  />
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_diff" class="form-label"
                    >WEIGHT DIFFERENT</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="weight_diff"
                    v-model="formData.weight_diff"
                    disabled
                  />
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="plateNumber" class="form-label"
                    >PLATE NUMBER</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="plateNumber"
                    v-model="formData.plateNumber"
                    disabled
                  />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">DRIVER IN</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.driver_in)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.driver_in"
                    />
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">DRIVER OUT</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.driver_out)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.driver_out"
                    />
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">PLATE IN</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.plate_in)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.plate_in"
                    />
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">PLATE OUT</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.plate_out)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.plate_out"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">CONTENT IN</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.content_in)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.content_in"
                    />
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">CONTENT OUT</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.content_out)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.content_out"
                    />
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">SCALE IN</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.scale_in)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.scale_in"
                    />
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label for="weight_in" class="form-label">SCALE OUT</label>
                  <div
                    class="rounded bg-dark overflow-hidden"
                    @click="handleOpenModalViewImage(formData.scale_out)"
                  >
                    <img
                      class="box-image img-fluid mx-auto d-block"
                      :src="formData.scale_out"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="emit('close')">Close</button>
        </div>
      </div>
    </div>
    <ViewImage
      :image="selectedImage"
      @close="showModalViewImage = false"
      v-if="showModalViewImage"
    />
  </div>
</template>

<style lang="scss" scoped>
.box-image {
  width: auto;
  height: 200px;
}
</style>
