<script setup>
import { useDataStore } from "../stores/data.js";
import { storeToRefs } from "pinia";
import { defineProps, ref } from "vue";

import {
  LoadingOutlined,
  SearchOutlined,
  CloseOutlined,
  UserAddOutlined,
} from "@ant-design/icons-vue";
import axios from "axios";

// SECTION ###### PINIA STORE VARIABLES ######
const dataStore = useDataStore();
let { chats, chat_open, user, messages } = storeToRefs(dataStore);
// !SECTION ######

const loadingSearch = ref(false),
  loadingNewSearch = ref(false),
  clear = ref(false),
  clearNew = ref(false),
  searchUser = ref(""),
  searchNewUser = ref(""),
  newChatModalVisible = ref(false),
  availableChats = ref([]),
  lastMessage = ref({});

// not const, bcoz need to change value
// can't use ref(chats), else 'chats' will be changed
let chatsToShow = chats;
let availableChatsToShow = availableChats;

// props from parent
const props = defineProps({ socket: Object });

// to set active chat from menu
const selectChat = (chatid) => {
  dataStore.setChatOpen(chatid);
  console.log(dataStore.messages);
  dataStore.messages = messages.value.map((m) => {
    if ( m.sender == chatid && !m.seen ) {
      m.seen = true
    }
    return m
  })
  console.log(dataStore.messages);
};

// to set chats to show on search
const setChatsToShow = (e) => {
  if (newChatModalVisible.value) {
    console.log("its visible");
    // TODO search functionality for newchatmodal
    if (searchNewUser.value !== "") {
      const reg = RegExp(searchNewUser.value, "gi");
      availableChatsToShow = availableChats.value.filter((c) => {
        if (reg.exec(c.name) !== null) {
          return c;
        }
      });
    } else {
      availableChatsToShow = availableChats.value;
    }
  } else {
    console.log("No man");
    if (searchUser.value !== "") {
      const reg = RegExp(searchUser.value, "gi");
      chatsToShow = chats.value.filter((c) => {
        if (reg.exec(c.name) !== null) {
          return c;
        }
      });
    } else {
      chatsToShow = chats.value;
    }
  }
};

const newChat = async () => {
  newChatModalVisible.value = true;
  // NOTE axios api for getting all the users available (except logged one)
  await axios
    .get("/api/user/" + user.value._id + "/getall")
    .then((res) => {
      availableChats.value = res.data.chats;
    })
    .catch((err) => {
      console.log("Error while getting initial data ", err);
    });
};

const setConnections = async (conn_id) => {
  // axios api for adding selected user to connections
  await axios
    .put("/api/user/" + user.value._id + "/connection", { connection: conn_id })
    .then((res) => {
      console.log("Successfully done");
      dataStore.user = res.data.user;
      dataStore.chats = res.data.conn;
      newChatModalVisible.value = false;
      props.socket.emit("data-changes")
    })
    .catch((err) => {
      console.log("There is error");
    });
};

// of no use
const onCollapse = (collapsed, type) => {
  console.log(collapsed, type);
};
const onBreakpoint = (broken) => {
  // console.log(broken);
};
</script>

<template>
  <!-- New Chat Modal -->
  <a-modal
    v-if="newChatModalVisible"
    v-model:visible="newChatModalVisible"
    :closable="false"
    style="width: 25%; max-height: 80vh"
    :centered="true"
    :footer="null"
  >
    <template #title><h1>New Chat</h1></template>

    <div class="search">
      <a-input
        v-model:value="searchNewUser"
        placeholder="Search..."
        style="
          background-color: #5a189a;
          border: none;
          color: #e0aaff;
          font-weight: bold;
        "
        @change="setChatsToShow"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
        <template #suffix v-if="loadingNewSearch">
          <LoadingOutlined />
        </template>
        <template #suffix v-if="clearNew">
          <CloseOutlined />
        </template>
      </a-input>
    </div>

    <a-list :split="false" :data-source="availableChatsToShow" class="chatsNav">
      <template #renderItem="{ item }">
        <a-list-item
          class="chat-item"
          :class="{ openChat: chat_open._id == item._id }"
          @click="setConnections(item._id)"
        >
          <!-- REVIEW Profile Picture -->
          <a-avatar
            :src="item.profile_picture"
            :size="45"
            style="color: #240046"
          >
            <!-- {{ item.initials }} -->
          </a-avatar>
          <div class="details">
            <div class="chat-name">{{ item.name }}</div>
            <div class="">@{{ item.username }}</div>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </a-modal>

  <a-layout-sider
    width="25%"
    class="chats-navigation"
    style="background-color: #240046"
    breakpoint="lg"
    collapsed-width="0"
    @collapse="onCollapse"
    @breakpoint="onBreakpoint"
  >
    <!-- New Chat Button -->
    <a-tooltip>
      <template #title>New Chat</template>
      <a-button
        class="new-chat"
        size="large"
        type="primary"
        shape="circle"
        @click="newChat"
      >
        <template #icon><user-add-outlined /></template>
      </a-button>
    </a-tooltip>

    <!-- SECTION SEARCH -->
    <div class="search">
      <a-input
        v-model:value="searchUser"
        placeholder="Search..."
        style="
          background-color: #5a189a;
          border: none;
          color: #e0aaff;
          font-weight: bold;
        "
        @change="setChatsToShow"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
        <template #suffix v-if="loadingSearch">
          <LoadingOutlined />
        </template>
        <template #suffix v-if="clear">
          <CloseOutlined />
        </template>
      </a-input>
    </div>
    <!-- !SECTION SEARCH -->

    <a-list :split="false" :data-source="chatsToShow" class="chatsNav">
      <template #renderItem="{ item }">
        <a-list-item
          class="chat-item"
          :class="{ openChat: chat_open._id == item._id }"
          @click="selectChat(item._id)"
        >
          <!-- <div class="chat-item"> -->
          <!-- REVIEW Profile Picture -->
          <a-avatar
            :src="item.profile_picture"
            :size="45"
            style="color: #240046"
          >
            <!-- {{ item.initials }} -->
          </a-avatar>
          <div class="details">
            <div class="name">
              <div class="chat-name">{{ item.name }}</div>
              <div class="time">2:39 PM</div>
            </div>
            <div class="info">
              <a-typography-text
                type="success"
                ellipsis
                style="max-width: 250px"
                content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor
                doloremque consequuntur ullam maiores autem veniam temporibus
                aliquid facilis excepturi, recusandae fuga, quas maxime id
                voluptatibus assumenda optio repudiandae voluptatum? Maiores."
              >
              </a-typography-text>
              <a-badge
                count="4"
                :number-style="{
                  backgroundColor: '#9D4EDD',
                  color: '#fff',
                  boxShadow: 'none',
                }"
              />
            </div>
          </div>
          <!-- </div> -->
        </a-list-item>
      </template>
    </a-list>
  </a-layout-sider>
</template>

<style scoped>
.chats-navigation {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.new-chat {
  position: absolute;
  bottom: -50px;
  right: 15px;
}

.chatsNav {
  overflow: hidden;
}
.chats-navigation:hover .chatsNav {
  overflow-y: auto;
}

.chats-navigation:hover .new-chat {
  /* bottom: 15px; */
  transform: translateY(-65px);
}

.search {
  height: 32px;
  margin: 16px;
}

.chat-item {
  /* border: 1px dashed white; */
  margin: 0 16px;
  padding: 16px 8px;
  display: flex;
  align-items: center;
  justify-content: start;
  cursor: pointer;
  border-radius: 16px;
}
.chat-item:hover {
  background-color: #3c096c;
}
.openChat {
  background-color: #5a189a !important;
}

.details {
  /* border: 1px dotted bisque; */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  justify-content: center;
  align-items: start;
  color: aliceblue;
}

.name {
  /* border: 1px double gold; */
  align-self: stretch;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info {
  /* border: 1px double palegreen; */
  align-self: stretch;
  display: flex;
  justify-content: space-between;
}

.chat-name {
  font-weight: 500;
  font-size: medium;
}
.time {
  color: #686c72;
  font-size: smaller;
}
</style>
