<script setup>
import { useDataStore } from "../stores/data.js";
import { storeToRefs } from "pinia";
import { createVNode } from "vue";

import {
  ExclamationCircleOutlined,
  LogoutOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";

import axios from "axios";

// ###### PINIA STORE VARIABLES ######
const dataStore = useDataStore();
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
        style: "color:red;",
      },
      "Do you really want to Sign Out?"
    ),
    okText: "Sign Out",
    centered: true,
    onOk() {
      dataStore.user = {};
      dataStore.chats = []
      dataStore.messages = []
      dataStore.chat_open = {}
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
        style: "color:red;",
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
  <a-layout-sider
    width="4rem"
    style="background-color: #10002b"
    breakpoint="lg"
    collapsed-width="0"
    @collapse="onCollapse"
    @breakpoint="onBreakpoint"
  >
    <div class="user">
      <a-dropdown :trigger="['click']">
        <a-avatar
          :src="user.profile_picture"
          size="large"
          class="green"
          style="cursor: pointer"
        >
          <!-- REVIEW SHOWING PROFILE PICTURE -->
          <!-- {{ user.initials }} -->
        </a-avatar>
        <!-- shows menu from user avatar -->
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
      </a-dropdown>
    </div>
  </a-layout-sider>
</template>

<style scoped>
.user {
  height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  padding: 0 0 12px;
}
</style>
