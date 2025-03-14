<script setup>
import { onMounted, onBeforeUnmount, nextTick } from "vue";

// 3rd-party libraries
import { Modal } from "bootstrap";
import OSD from "openseadragon";
import moment from "moment";

// Inits
const props = defineProps(["image"]);
const emit = defineEmits(["close"]);
let modal;
let osd;

// Lifecycle hooks
onMounted(async () => {
  modal = new Modal(document.getElementById("image-modal"), {
    backdrop: "static",
  });

  modal.show();

  nextTick(() => {
    osd = OSD({
      id: "osd",
      prefixUrl: "/osd/",
      crossOriginPolicy: "Anonymous",
      ajaxWithCredentials: false,
      maxZoomPixelRatio: 10,
      useCanvas: false,
      navigationControlAnchor: OSD.ControlAnchor.ABSOLUTE,
      tileSources: {
        type: "image",
        url: props.image,
        crossOriginPolicy: "Anonymous",
        ajaxWithCredentials: false,
      },
    });
  });
});

function formattedDate(data) {
  return "-";
  return moment(
    typeof data.attributes.datetime !== "undefined" && data.attributes.datetime
      ? data.attributes.datetime
      : data.attributes.date_created
  ).format("D MMM, h:mm A");
}

onBeforeUnmount(() => {
  if (osd) {
    osd.destroy();
    osd = null;
  }

  modal.hide();
});
</script>

<template>
  <div class="modal modal-xl" id="image-modal">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="emit('close')"
          ></button>
        </div>
        <div class="modal-body p-0 bg-black">
          <div id="osd" class="w-100 h-100"></div>
        </div>
        <div class="modal-footer d-flex justify-content-between"></div>
      </div>
    </div>
  </div>
</template>