<script setup>
import { useDataStore } from "../stores/data.js";
import { storeToRefs } from "pinia";
import { createVNode, ref } from "vue";

import {
  ExclamationCircleOutlined,
  LogoutOutlined,
  UserDeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";

import axios from "axios";

// ###### PINIA STORE VARIABLES ######
const dataStore = useDataStore();
const profileModalVisible = ref(false);
let { user } = storeToRefs(dataStore);
// ######

// props given from the parent
const props = defineProps({ socket: Object });

// to open log in form
const openLogIn = async () => {
  dataStore.loginFormVisible = true;
  dataStore.signupFormVisible = false;
  // to wait untill the DOM updates and usernameInput is set
  await nextTick();
  usernameInput.value.focus();
};

// ANCHOR delete user functionality
const deleteUser = async () => {
  // NOTE axios api for deleting user
  await axios
    .delete("/api/user/" + user.value._id)
    .then((res) => {
      props.socket.emit("new-user");
      dataStore.chats = res.data.users;
      dataStore.user = {};
      openLogIn();
    })
    .catch((err) => {
      console.log("Can't delete", err);
    });
};

// SECTION ###### Modals ######
// for signing out; shows modal from here
const showSignoutConfirm = () => {
  Modal.confirm({
    title: "Are you sure?",
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode(
      "div",
      {
        style: "color:maroon;",
      },
      "Do you really want to Sign Out?"
    ),
    okText: "Sign Out",
    centered: true,
    onOk() {
      dataStore.user = {};
      dataStore.chats = [];
      dataStore.messages = [];
      dataStore.chat_open = {};
      openLogIn();
    },
    onCancel() {
      console.log("Cancel");
    },
    class: "test",
  });
};
// for account deletion; shows modal from here
const showUserDeleteConfirm = () => {
  Modal.confirm({
    title: "Are you sure?",
    icon: createVNode(UserDeleteOutlined),
    content: createVNode(
      "div",
      {
        style: "color:maroon;",
      },
      "Do you really want to delete your account?"
    ),
    okText: "Delete Account",
    centered: true,
    onOk() {
      // console.log();
      deleteUser();
    },
    onCancel() {
      console.log("Cancel");
    },
    class: "test",
  });
};
// !SECTION ######

// of no use for now
const onCollapse = (collapsed, type) => {
  console.log(collapsed, type);
};
const onBreakpoint = (broken) => {
  // console.log(broken);
};
</script>

<template>
  <a-modal
    v-if="profileModalVisible"
    v-model:visible="profileModalVisible"
    :closable="false"
    style="width: 25%; max-height: 80vh"
    :centered="true"
    :footer="null"
  >
    <template #title><h1>Profile</h1></template>

    <div class="profile-row">
      <a-avatar
        :src="user.profile_picture"
        class="profile-picture"
      ></a-avatar>
    </div>
    <div>
      Name:
      <h2 style="font-weight: bold;">{{user.name}}</h2>
    </div>
    <div>
      Mobile number:
      <h2 style="font-weight: bold;">{{user.mobileNo}}</h2>
    </div>

    <div>
      <span @click="showUserDeleteConfirm" class="delete-account-line">Delete Account</span>
    </div>
  </a-modal>

  <a-layout-sider
    width="4rem"
    style="background-color: #10002b"
    breakpoint="lg"
    collapsed-width="0"
    @collapse="onCollapse"
    @breakpoint="onBreakpoint"
  >
    <div class="user">
      <a-tooltip title="settings" placement="right" color="#7B2CBF">
        <SettingOutlined class="log-out" />
      </a-tooltip>
      <a-tooltip title="log-out" arrow="true" placement="right" color="#7B2CBF">
        <LogoutOutlined class="log-out" @click="showSignoutConfirm" />
      </a-tooltip>
      <a-tooltip title="profile" arrow="true" placement="right" color="#7B2CBF">
        <a-avatar
          :src="user.profile_picture"
          size="large"
          class="green"
          style="cursor: pointer"
          @click="profileModalVisible = !profileModalVisible"
        >
          <!-- REVIEW SHOWING PROFILE PICTURE -->
          <!-- {{ user.initials }} -->
        </a-avatar>
      </a-tooltip>

      <!-- <a-dropdown :trigger="['click']">
        <a-avatar
          :src="user.profile_picture"
          size="large"
          class="green"
          style="cursor: pointer"
        >
        </a-avatar>
        <template #overlay>
          <a-menu>
            <a-menu-item key="0" @click="showUserDeleteConfirm">
              <UserDeleteOutlined />
              <span style="margin-left: 8px">Delete Account</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="1" @click="showSignoutConfirm" style="color: red">
              <LogoutOutlined /> <span style="margin-left: 8px">Log Out</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown> -->
    </div>
  </a-layout-sider>
</template>

<style scoped>
.profile-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.profile-picture{
  width: 100px !important;
  height: 100px !important;
}

.delete-account-line {
  color: maroon;
  cursor: pointer;
}
.delete-account-line:hover {
  text-decoration: underline;
}

.user {
  height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  padding: 0 0 12px;
  gap: 10px;
}

.log-out {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.log-out:hover {
  cursor: pointer;
  color: white;
  background-color: #3c096c;
}
</style>
