<script setup>
import { useAPI } from "@/composables/useAPI";
import { Modal } from "bootstrap";
import { onBeforeUnmount, onMounted, ref } from "vue";

const api = useAPI();
let modal;
const props = defineProps(["data"]);
const emit = defineEmits(["close"]);

const formData = ref({
  name: null,
  ic_number: null,
  image: null,
  lorries: [],
});

onMounted(async () => {
  modal = new Modal(document.getElementById("driver-modal"), {
    backdrop: "static",
  });

  if (!props.data) return;

  const response = await api.get(`/drivers/${props.data.id}`, {
    params: {
      "populate[0]": "image",
      "populate[1]": "lorries",
    },
  });

  const newData = response.data.data;
  if (!newData) return;
  formData.value.name = !newData.attributes.name
    ? "-"
    : newData.attributes.name;
  formData.value.ic_number = !newData.attributes.ic_number
    ? "-"
    : newData.attributes.ic_number;
  formData.value.image = !newData.attributes.image.data
    ? null
    : newData.attributes.image.data.attributes.url;

  modal.show();
});

onBeforeUnmount(() => {
  modal.hide();
});
</script>

<template>
  <div class="modal modal-md" id="driver-modal">
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
                  <label for="name" class="form-label">IMAGE</label>

                  <div
                    class="container-image bg-light rounded border d-flex justify-content-center align-items-center"
                  >
                    <div class="text-muted" v-if="!formData.image">
                      <p class="mb-0 small fst-italic">NO IMAGE</p>
                    </div>
                    <div class="box-image" v-else>
                      <img class="box-image" :src="formData.image" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="name" class="form-label">NAME</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    v-model="formData.name"
                    disabled
                  />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="nric" class="form-label">NRIC</label>
                  <input
                    type="text"
                    class="form-control"
                    id="nric"
                    v-model="formData.ic_number"
                    disabled
                  />
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
  </div>
</template>

<style lang="scss" scoped>
.box-image {
  width: auto;
  height: 200px;
}

.container-image {
  width: 100%;
  height: 200px;
}
</style>
