// slices/tagsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITag } from "@/interfaces";

interface TagsState {
  data: ITag[];
}

const initialState: TagsState = {
  data: [],
};

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    setTagss(state, action: PayloadAction<ITag[]>) {
      state.data = action.payload;
    },
    addTag(state, action: PayloadAction<ITag>) {
      state.data.push(action.payload);
    },
    updateTag(state, action: PayloadAction<ITag>) {
      const index = state.data.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteTag(state, action: PayloadAction<number>) {
      state.data = state.data.filter((t) => t.id !== action.payload);
    },
  },
});

export const { setTagss, addTag, updateTag, deleteTag } = tagsSlice.actions;
export default tagsSlice.reducer;
