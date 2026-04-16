import { createSlice } from "@reduxjs/toolkit";

interface IModal {
  id: number;
  isOpen: boolean;
  message: string;
  status: "error" | "warning" | "success" | null;
}

const initialState: IModal[] = [
  {
    id: 1,
    isOpen: false,
    message: "",
    status: null,
  },
];

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModal(state, action) {
      const newModal = {
        message: action.payload.message,
        status: action.payload.status,
        isOpen: true,
        id: state.length + 1,
      };
      state.push(newModal);
    },
    setIsOpen: (state, action) => {
      const index = state.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state[index].isOpen = action.payload.isOpen;
      }
    },

    removeModal: (state, action) => {
      return state.filter((m) => m.id !== action.payload);
    },
  },
});

export default modalSlice.reducer;
export const { setModal, setIsOpen, removeModal } = modalSlice.actions;
