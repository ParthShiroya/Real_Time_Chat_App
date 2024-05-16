<script setup>
import { useDataStore } from "../stores/data.js";
import { storeToRefs } from "pinia";
import { defineProps, ref, createVNode } from "vue";

import {
  SearchOutlined,
  MoreOutlined,
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  AudioOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";

import axios from "axios";

// SECTION ###### PINIA STORE VARIABLES ######
const dataStore = useDataStore();
let { user, messages, chat_open } = storeToRefs(dataStore);
// !SECTION ######

const mssg = ref(""),
  messageBox = ref(null);
const props = defineProps({ socket: Object });

const sendMessage = async () => {
  // NOTE axios api for sending message
  await axios
    .post(
      "/api/messages",
      {
        message: mssg.value,
        sender: user.value._id,
        receiver: chat_open.value._id,
      },
      {
        headers: { "content-type": "application/json" },
      }
    )
    .then((res) => {
      // console.log(res);
      dataStore.pushMessage(res.data);
      props.socket.emit("data-changes");
      mssg.value = "";
      messageBox.value.focus();
    })
    .catch((err) => {
      console.log("Error while posting", err);
      message.error({
        content: () => "Error while sending message!",
        style: {
          color: "#240046",
        },
      });
    });
};

const deleteMessage = async (message_id) => {
  // NOTE axios api for deleting message
  await axios
    .delete("/api/messages", {
      header: { Authorization: "Bearer my-token" },
      data: { message_id: message_id },
    })
    .then((res) => {
      console.log("Message delete");
      props.socket.emit("data-changes");
      dataStore.messages = res.data.messages;
    })
    .catch((err) => {
      console.log("Can't delete", err.message);
      message.error({
        content: () => "Error while deleting message!",
        style: {
          color: "#240046",
        },
      });
    });
};

// NOTE for signing out; shows modal from here
const showDeleteConfirm = (message_id) => {
  Modal.confirm({
    title: "Are you sure?",
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode(
      "div",
      {
        style: "color:red;",
      },
      "Do you really want to delete the message?"
    ),
    okText: "Delete",
    centered: true,
    onOk() {
      // console.log(message_id);
      deleteMessage(message_id);
    },
    onCancel() {
      console.log("Cancel");
    },
    class: "test",
  });
};
</script>

<template>
  <div class="selectchat" v-if="Object.keys(chat_open).length === 0">
    <span
      style="background-color: #240046; padding: 6px 12px; border-radius: 20px"
    >
      Select a Chat to continue
    </span>
  </div>

  <div class="currentchat" v-else>
    <div class="chat-header">
      <a-avatar
        :src="chat_open.profile_picture"
        :size="45"
        style="color: #240046"
      >
        <!-- {{ chat_open.initials }} -->
      </a-avatar>
      <div class="chat-name">{{ chat_open.name }}</div>
      <a-button ghost shape="circle" size="large" style="border: none">
        <template #icon><SearchOutlined /></template>
      </a-button>
      <a-button ghost shape="circle" size="large" style="border: none">
        <template #icon><MoreOutlined /></template>
      </a-button>
    </div>

    <div class="chat-messages">
      <p class="system-message">System Message</p>
      <div v-for="m in messages" :key="m._id" style="width: 100%">
        <a-dropdown :trigger="['contextmenu']">
          <p
            class="message-sent"
            v-if="m.sender == user._id && m.receiver == chat_open._id"
          >
            {{ m.message }}
            <span class="message-time">
              2:39 AM
              <check-outlined
                v-if="m.seen"
                style="margin-left: 4px; color: red"
              />
              <check-outlined v-else style="margin-left: 4px" />
            </span>
          </p>
          <p
            class="message-received"
            v-else-if="m.receiver == user._id && m.sender == chat_open._id"
          >
            {{ m.message }}
            <span class="message-time"> 2:39 AM </span>
          </p>
          <!-- Right Click options message -->
          <template #overlay>
            <a-menu>
              <a-menu-item key="0">
                <ShareAltOutlined /> <span style="margin-left: 8px">Send</span>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item
                key="1"
                @click="showDeleteConfirm(m._id)"
                style="color: red"
              >
                <DeleteOutlined /> <span style="margin-left: 8px">Delete</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div id="anchor"></div>
    </div>

    <div class="chat-send">
      <button><SmileOutlined /></button>
      <input
        type="text"
        v-model="mssg"
        placeholder="Message..."
        class="message-input"
        ref="messageBox"
      />
      <button><PaperClipOutlined /></button>
      <button v-if="mssg === ''"><AudioOutlined /></button>
      <button v-else type="submit" @click="sendMessage">
        <SendOutlined />
      </button>
    </div>
  </div>
</template>

<style scoped>
.selectchat {
  background-color: #10002b;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.currentchat {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  border-left: 1px solid #10002b;
  background-color: #240046;
  padding: 8px 16px;
}
.chat-messages {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  /* gap: 10px; */
  background-color: #10002b;
  padding: 16px;
  overflow: hidden;
}
/* to create bottom scroll */
.chat-messages * {
  overflow-anchor: none;
}
#anchor {
  overflow-anchor: auto;
  height: 1px;
}
.chat-send {
  display: flex;
  align-items: center;
  background-color: #240046;
  padding: 12px 16px;
  gap: 8px;
  border-left: 1px solid #10002b;
}

.chat-name {
  margin-left: 8px;
  font-size: x-large;
  font-weight: 600;
  flex-grow: 1;
}

.chat-send > * {
  background-color: transparent;
  border: none;
  font-size: x-large;
}
.message-input {
  flex-grow: 1;
  font-size: large !important;
}
.message-input:focus {
  outline: none;
}

.message-sent {
  max-width: 60%;
  margin-left: auto;
  width: fit-content;
  background-color: #3c096c;
  padding: 4px 8px 4px 12px;
  border-radius: 16px;
}
.message-received {
  max-width: 60%;
  width: fit-content;
  background-color: #c77dff;
  color: #10002b;
  padding: 4px 8px 4px 12px;
  border-radius: 16px;
}
.system-message {
  font-size: small;
  max-width: 60%;
  align-self: center;
  width: fit-content;
  padding: 2px 6px 2px 6px;
  margin-top: auto;
  /* border-radius: 16px; */
}
.message-time {
  font-size: x-small;
  position: relative;
  top: 0.375rem;
  bottom: auto !important;
  float: right;
  line-height: 2.5;
  margin: 0 0.375rem 0 0.475rem;
}

.chat-messages:hover {
  overflow-y: scroll;
}
</style>
