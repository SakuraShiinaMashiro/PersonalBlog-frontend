import { ref } from 'vue'

export const useNotice = () => {
  const noticeVisible = ref(false)
  const noticeMessage = ref('')

  const openNotice = (message: string) => {
    noticeMessage.value = message
    noticeVisible.value = true
  }

  return {
    noticeVisible,
    noticeMessage,
    openNotice
  }
}
