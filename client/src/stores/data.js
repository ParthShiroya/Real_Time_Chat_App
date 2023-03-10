import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useDataStore = defineStore("data", () => {
  let loginFormVisible = ref(true);
  let signupFormVisible = ref(false);
  let signoutFormVisible = ref(false);
  let user = ref({});
  let chats = ref([]);
  let messages = ref([]);
  let chat_open = ref({});

  let pushMessage = (msg) => {
    messages.value.push(msg);
  };
  let addUserToChats = () => {
    chats.value.push(user.value);
  };
  let removeUserFromChats = () => {
    // console.log(chats.value[0]._id == user.value._id);
    chats.value = chats.value.filter((c) => {
      if (c._id !== user.value._id) {
        return c;
      }
    });
  };
  let setChatOpen = (key) => {
    let chat = chats.value.filter((c) => {
      if (c._id === key) {
        return c;
      }
    });
    if (chat.length > 0) {
      chat_open.value = chat[0];
    }
  };

  return {
    loginFormVisible,
    signupFormVisible,
    signoutFormVisible,
    user,
    chats,
    messages,
    chat_open,
    pushMessage,
    addUserToChats,
    removeUserFromChats,
    setChatOpen,
  };
});
