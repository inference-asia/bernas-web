<script setup>
import { onMounted, ref, watch } from "vue";

import { useAPI } from "../composables/useAPI";
import logoUrl from "../assets/images/logo.png";

import videojs from "video.js";
import { waitUntil } from "async-wait-until";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useClients } from "@/composables/useClients";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const api = useAPI();
const { user, fetchMe } = useAuth();
const identifier = ref("");
const password = ref("");
const error = ref(null);
const isLoading = ref(false);
const { fetchClients } = useClients();

async function submit(e) {
  e.preventDefault();

  isLoading.value = true;

  try {
    const res = await api.post("/auth/local", {
      identifier: identifier.value,
      password: password.value,
    });

    let data = res.data;

    // let config = {
    //   headers: {
    //     Authorization: "Bearer " + data.jwt,
    //   },
    // };

    // const resMe = await axios.get(
    //   "https://bernas-api.selgem.com/api/users/me?populate[clients]=*&populate[role]=*",
    //   config
    // );

    // data.user = resMe.data;
    // console.log(resMe.data);
    user.value = data;

    // await fetchMe()
    // await fetchClients()

    if (user.value) {
      router.push("/");
    }
  } catch (err) {
    if (typeof err.response !== "undefined")
      error.value = err.response.data.error.message;
    else error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <div class="container-fluid p-0">
    <div class="background-container">
      <div
        class="bg-white h-100 box-form rounded px-3 d-flex justify-content-center align-items-center"
      >
        <div class="w-100">
          <div class="box-logo m-auto">
            <img src="../assets/images/logo.png" />
          </div>
          <div class="form-field my-5">
            <form @submit="submit" class="px-5 mt-5">
              <p class="mb-3">Please enter your account details</p>
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label small"
                  >Email or Username</label
                >
                <input
                  type="text"
                  :class="{
                    'form-control': true,
                    'is-invalid': error !== null,
                  }"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  v-model="identifier"
                />
                <div v-if="error" class="invalid-feedback">{{ error }}</div>
              </div>
              <div class="mb-4">
                <label for="exampleInputPassword1" class="form-label small"
                  >Password</label
                >
                <input
                  type="password"
                  :class="{
                    'form-control': true,
                    'is-invalid': error !== null,
                  }"
                  id="exampleInputPassword1"
                  v-model="password"
                />
              </div>
              <div>
                <button type="submit" class="btn btn-primary btn-main w-100">
                  <template v-if="isLoading">
                    <font-awesome-icon
                      icon="fa-solid fa-spinner"
                      spin-pulse
                      class="me-1"
                    />
                    Logging in...
                  </template>
                  <template v-else> Login </template>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.background-container {
  background-image: url(/paddy-bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  background-position-y: bottom;
  background-position-x: center;
  height: 100vh;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 0px;
  }
}

.box-form {
  width: 500px;
  @media (max-width: 480px) {
    width: 100%;
  }
}

.box-logo {
  height: 250px;
  width: 250px;

  img {
    height: auto;
    width: 100%;
  }
}
</style>
