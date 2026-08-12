import { message } from "antd";

message.config({
  top: 72,
  duration: 3.5,
  maxCount: 3,
});

export const toast = {
  success: (content) => message.success(content),
  error: (content) => message.error(content),
  info: (content) => message.info(content),
  warning: (content) => message.warning(content),
};
