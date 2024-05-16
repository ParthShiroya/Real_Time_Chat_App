<script setup>
// ###### all the components ######
import CurrentChat from "./components/CurrentChat.vue";
import ChatsNavigation from "./components/ChatsNavigation.vue";
import Sidebar from "./components/Sidebar.vue";
// ######

// ###### other imports ######
import { useDataStore } from "./stores/data.js";
import { storeToRefs } from "pinia";
import io from "socket.io-client";
import {
  UserOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { ref, reactive, nextTick } from "vue";
import axios from "axios";
// ######


// ###### PINIA STORE VARIABLES ######
const dataStore = useDataStore();
let { loginFormVisible, signupFormVisible, user } = storeToRefs(dataStore);
// ######


// ###### VARIABLES ######
const socket = io("http://localhost:8000"),
  formState = reactive({
    username: "",
    name: "",
    password: "",
    profile_picture: "",
  }),
  errorMessage = ref(null),
  usernameInput = ref(null),
  fileList = ref([]),
  loadingUpload = ref(false);
// ######

const clearFormState = () => {
  formState.username = "";
  formState.name = "";
  formState.password = "";
  formState.profile_picture = "";
};

// function to get all the data from db
const getDataFromDB = async () => {
  // NOTE axios api for getting initial data
  await axios
    .get("/api/user/" + user.value._id)
    .then((res) => {
      dataStore.chats = res.data.connections;
      dataStore.messages = res.data.messages;
    })
    .catch((err) => {
      console.log("Error while getting initial Data ", err);
      message.error({
        content: () => "Error while getting initial Data!",
      });
    });
};

// SECTION ###### LOGIN & SIGNUP FORM ######
// to open log in form
const openLogIn = async () => {
  dataStore.loginFormVisible = true;
  dataStore.signupFormVisible = false;
  // to wait untill the DOM updates and usernameInput is set
  await nextTick();
  usernameInput.value.focus();
};
// to open sign up form
const openSignUp = async () => {
  dataStore.loginFormVisible = false;
  dataStore.signupFormVisible = true;
  // to wait untill the DOM updates and usernameInput is set
  await nextTick();
  usernameInput.value.focus();
};
// function for login form
const logInUser = async (values) => {
  // NOTE axios api for logging in
  console.log(axios);
  await axios
    .post("/api/user/login", formState)
    .then((res) => {
      console.log(res);
      dataStore.user = res.data;
      dataStore.loginFormVisible = false;
      clearFormState();
      getDataFromDB();
    })
    .catch((err) => {
      console.log("Error while logging user in ", err);
      if (err.response.data.code == 1) {
        // NOTE show message feedback on screen
        message.error({
          content: () => "username-password combination doesn't exist",
          style: {
            color: "#240046",
          },
        });
      }
    });
};
// function for signup form
const signUpUser = async (values) => {
  // NOTE axios api for signing up
  await axios
    .post("/api/user/signup", formState)
    .then((res) => {
      console.log(res.data);
      dataStore.user = res.data;
      dataStore.signupFormVisible = false;
      // dataStore.removeUserFromChats();
      clearFormState();
      socket.emit("new-user");
    })
    .catch((err) => {
      console.log("Error while creating user : ", err.response.data.message);
      errorMessage.value = err.response.data.code;
      message.error({
        content: () => "Error while creating user",
        style: {
          color: "#240046",
        },
      });
    });
};
// !SECTION ######

// SECTION FOR UPLOAD
// to get base64 string from image
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}
// things to do before start uploading
const beforeUpload = (file) => {
  // whether file size less than 5MB or not
  const sizeGood = file.size / 1024 / 1024 < 5;
  if (!sizeGood) {
    message.error("Profile picture size must be less than 5MB");
  }
  return sizeGood;
};
// sets what to do when input changes
const handleChange = (info) => {
  if (info.file.status === "uploading") {
    loadingUpload.value = true;
    return;
  }
  if (info.file.status === "done") {
    // Get this url from response in real world.
    getBase64(info.file.originFileObj, (base64Url) => {
      formState.profile_picture = base64Url;
      loadingUpload.value = false;
    });
  }
  if (info.file.status === "error") {
    loadingUpload.value = false;
    message.error("upload error");
  }
};
// to give dummy request, as we are not really uploading the image to anywhere, rather saving it as base64 string in mongodb
const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};
// !SECTION UNTIL HERE

// SECTION ###### SOCKET things ######
socket.on("connect", () => {
  // calling when user is connected
  // same as on-mounted
  if (usernameInput.value !== null) usernameInput.value.focus();
});
socket.on("new-user-ping", () => {
  // calling when new user is connected
  getDataFromDB();
});
socket.on("data-changes-ping", async () => {
  // calling when new message is sent from other user
  // NOTE axios api for getting all messages
  await axios
    .get("/api/user/"+user.value._id)
    .then((res) => {
      dataStore.messages = res.data.messages;
      dataStore.chats = res.data.connections;
    })
    .catch((err) => {
      console.log("Error while getting messages ", err);
    });
});
// !SECTION ######
</script>

<template>
  <!-- Login Modal -->
  <a-modal
    v-if="loginFormVisible"
    v-model:visible="loginFormVisible"
    :closable="false"
    :maskClosable="false"
    centered
    style="width: 400px"
  >
    <template #title>
      <center><h1>Log in</h1></center>
    </template>
    <a-form layout="horizontal" :model="formState" @finish="logInUser">
      <a-form-item>
        <a-input
          v-model:value="formState.username"
          placeholder="Username"
          allow-clear
          ref="usernameInput"
          style="border-radius: 8px"
        >
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input-password
          v-model:value="formState.password"
          placeholder="Password"
          style="border-radius: 8px"
        >
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :disabled="formState.username === '' || formState.password === ''"
          style="width: 100%; border-radius: 8px"
        >
          Log in
        </a-button>
      </a-form-item>
    </a-form>
    <template #footer>
      <span>Don't have an accout?</span>
      <span @click="openSignUp" class="popup-links">Create one</span>
    </template>
  </a-modal>

  <!-- ###### OR ###### -->

  <!-- Signup Modal -->
  <a-modal
    v-else-if="signupFormVisible"
    v-model:visible="signupFormVisible"
    :closable="false"
    :maskClosable="false"
    centered
    style="width: 400px"
  >
    <template #title>
      <center><h1>Sign up</h1></center>
    </template>
    <a-form layout="horizontal" :model="formState" @finish="signUpUser">
      <!-- username -->
      <a-form-item>
        <a-input
          v-model:value="formState.username"
          placeholder="Username (unique)"
          allow-clear
          ref="usernameInput"
          style="border-radius: 8px"
        >
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
        <a-typography-text
          v-if="errorMessage == 123"
          type="danger"
          style="font-size: 12px; margin-left: 1rem"
        >
          <exclamation-circle-outlined /> Username not available
        </a-typography-text>
      </a-form-item>
      <!-- name -->
      <a-form-item>
        <a-input
          v-model:value="formState.name"
          placeholder="Name"
          allow-clear
          style="border-radius: 8px"
        >
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>
      <!-- password -->
      <a-form-item>
        <a-input-password
          v-model:value="formState.password"
          placeholder="Password"
          style="border-radius: 8px"
        >
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input-password>
      </a-form-item>
      <!-- profile pic -->
      <a-form-item>
        <a-upload
          v-model:file-list="fileList"
          name="profile_pic"
          list-type="picture-card"
          accept="image/png, image/jpeg"
          :maxCount="1"
          class="avatar-uploader"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          @change="handleChange"
          :customRequest="dummyRequest"
        >
          <img
            v-if="formState.profile_picture"
            :src="formState.profile_picture"
            alt="profile picture"
            style="width: inherit; height: inherit; object-fit: cover"
          />
          <div v-else>
            <loading-outlined v-if="loadingUpload"></loading-outlined>
            <plus-outlined v-else></plus-outlined>
            <div class="ant-upload-text">Upload</div>
          </div>
        </a-upload>
      </a-form-item>
      <!-- submit button -->
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :disabled="
            formState.username === '' ||
            formState.name === '' ||
            formState.password === ''
          "
          style="border-radius: 8px; width: 100%"
        >
          Sign up
        </a-button>
      </a-form-item>
    </a-form>
    <template #footer>
      <span>Already have an accout?</span>
      <span @click="openLogIn" class="popup-links">Log in</span>
    </template>
  </a-modal>

  <!-- ###### OR ###### -->

  <a-layout v-else>
    <Sidebar :socket="socket" />

    <ChatsNavigation />

    <CurrentChat :socket="socket" />
  </a-layout>
</template>

<style scoped>
@import "./assets/base.css";

.popup-links {
  margin-left: 8px;
  cursor: pointer;
  color: white;
  font-weight: 500;
  font-size: large;
}
.popup-links:hover {
  text-decoration: underline;
}


.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

.site-layout-sub-header-background {
  background: #fff;
}

.site-layout-background {
  background: #fff;
}

[data-theme="dark"] .site-layout-sub-header-background {
  background: #240046;
}

@media (min-width: 1024px) {
}
</style>
