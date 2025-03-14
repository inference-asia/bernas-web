<script setup>
import { useAPI } from "@/composables/useAPI";
import { Modal } from "bootstrap";
import { onBeforeUnmount, onMounted, ref } from "vue";

const api = useAPI();
let modal;

const emit = defineEmits(["close"]);
const isLoading = ref(false);
const formData = ref({
  name: null,
  ic_number: null,
  image: null,
  lorries: [],
});
const optionsData = ref([]);

const imagePreview = ref(null);

onMounted(async () => {
  modal = new Modal(document.getElementById("driver-modal"), {
    backdrop: "static",
  });

  fetchingLorries();

  modal.show();
});

onBeforeUnmount(() => {
  modal.hide();
});

const fetchingLorries = async () => {
  const response = await api.get(`/lorries`);

  optionsData.value = response.data.data.map((obj) => {
    return {
      id: obj.id,
      label: obj.attributes.plate_number,
    };
  });
};

const handleUpload = (event) => {
  const fileData = event.target.files[0];

  if (fileData && fileData.type.startsWith("image/")) {
    imagePreview.value = URL.createObjectURL(fileData);
    formData.value.image = fileData;
  } else {
    imagePreview.value = null;
  }
};

const handleSave = async () => {
  let image = null;
  let payload = {
    ...formData.value,
    ic_number: formData.value.ic_number.toString(),
  };

  if (!formData.value.image.id) {
    image = new FormData();
    image.append("files", formData.value.image);

    const response = await api.post(`/upload`, image);

    if (response.data.length > 0) {
      image = response.data[0].id;
    }

    payload.image = image;
  }

  if (formData.value.lorries.length > 0) {
    payload.lorries.map((obj) => obj.id);
  }

  if (!payload.name || !payload.ic_number) return;
  isLoading.value = true;
  await api.post(`/drivers`, {
    data: payload,
  });
  isLoading.value = false;
  imagePreview.value = null;
  formData.value = {
    name: null,
    ic_number: null,
    image: null,
    lorries: [],
  };
  emit("close");
};
</script>

<template>
  <div class="modal modal-md" id="driver-modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Driver</h5>
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
                    class="container-image position-relative bg-light rounded border d-flex justify-content-center align-items-center"
                  >
                    <div class="text-muted">
                      <input
                        v-if="!imagePreview"
                        class="form-control h-100 w-100 opacity-0 position-absolute top-0 start-0"
                        type="file"
                        @change="handleUpload"
                        id="image"
                      />
                      <div class="box-image" v-else>
                        <div
                          style="z-index: 2"
                          class="position-absolute h-100 w-100 d-flex justify-content-center align-items-end top-0 start-0"
                        >
                          <button
                            class="position-absolute btn btn-sm btn-outline-danger mb-3"
                            @click="imagePreview = null"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'trash']"
                              class="me-2"
                            />Remove
                          </button>
                        </div>
                        <img
                          class="box-image image-preview-container"
                          :src="imagePreview"
                          id="placeholder-image"
                        />
                      </div>
                      <p class="mb-0 small fst-italic" v-if="!imagePreview">
                        Upload Image Here
                      </p>
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
                  />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="nric" class="form-label">NRIC</label>
                  <input
                    type="number"
                    class="form-control"
                    id="nric"
                    v-model="formData.ic_number"
                  />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="mb-3">
                  <label for="nric" class="form-label">LORRY</label>
                  <v-select multiple label="label" :options="optionsData" />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="emit('close')">Cancel</button>
          <button
            class="btn btn-primary"
            @click="handleSave()"
            :disabled="!formData.name || !formData.ic_number || isLoading"
          >
            <div
              class="spinner-border spinner-border-sm me-2"
              role="status"
              v-if="isLoading"
            >
              <span class="sr-only">Loading...</span>
            </div>
            Save
          </button>
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
  cursor: pointer;
  overflow: hidden;
  :hover {
    #placeholder-image {
      background: rgba(255, 255, 255, 0.61);
      filter: blur(1px);
      transition: cubic-bezier(0.075, 0.82, 0.165, 1);
    }
  }
}
</style>
