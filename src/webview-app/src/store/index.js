import { reactive } from "vue";
import { sendMessage } from "../utils/ExtensionCommunicator";
import { convertObjectToArray } from '../utils/index';

// 定义初始状态
const initialState = {
  localData: [],
  userInfo: {},
  debugger: {
    isDebug: true,
  },
  count: 0,
  remainingUsageText: "",
};

// 创建并导出响应式状态
export const store = reactive({
  state: initialState,
  // 定义修改状态的方法
  increment() {
    this.state.count++;
  },
  // 重置状态
  reset() {
    this.state.count = initialState.count;
  },
  getAllLocalData() {
    console.log("getAllLocalData 执行");
    sendMessage("getAllStorage", {}, (result) => {
      if (+result.code === 0) {
        console.log("getAllStorage-result", result);

        try {
          const _data = JSON.parse(result.data);
          const list = convertObjectToArray(_data);
          console.log("转换后的 list", list);
          this.state.localData = list;
        } catch (error) {
          console.log("getAllStorage-解析失败", error);
          this.state.localData = [];
        }
      } else {
        console.log("getAllStorage-失败", result);
        this.state.localData = [];
      }
    });
  },
  getRemainingUsageText() {
    sendMessage("getRemainingUsageText", {}, (result) => {
      if (+result.code === 0) {
        console.log("login-result", result);
        this.state.remainingUsageText = result.data;
      } else {
        console.log("login-失败", result);
      }
    });
  },
  getUserInfo() {
    sendMessage("getUserInfo", {}, (result) => {
      if (+result.code === 0) {
        console.log("getUserInfo-result", result);
        this.state.userInfo = result.data;
      } else {
        console.log("getUserInfo-失败", result);
      }
    });
  },
  getVscodeData() {
    this.getUserInfo()
    this.getRemainingUsageText();
    this.getAllLocalData();
  }
});
