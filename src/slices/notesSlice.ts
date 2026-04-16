// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { getNotes } from '@utils/apiUtil'

// //TODO fix any

// export const fetchNotes = createAsyncThunk<any, any, any>(
//   "notes/fetchNotes",
//   async ({ page, ITEMS_PER_PAGE }) => {
//     const notes = await getNotes(page, ITEMS_PER_PAGE);
//     return notes;
//   }
// );

// export const fetchAllNotes = createAsyncThunk<any, any, any>(
//   "notes/fetchAllNotes",
//   async ({ userId }) => {
//     const response = await getAllNotes(userId);
//     return response;
//   }
// );

// const notesSlice = createSlice({
//   name: "notes",
//   initialState: {
//     data: [],
//     loading: true,
//     error: null,
//     pages: 1,
//     page: Number(localStorage.getItem("currentPage")) || 1,
//   },
//   reducers: {
//     setPage(state, action) {
//       state.page = action.payload;
//     },
//     setNotes(state, action) {
//       state.data = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(fetchNotes.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchNotes.fulfilled, (state, action) => {
//       state.data = action.payload.notes;
//       state.pages = action.payload.pages;
//       state.loading = false;
//     });
//     builder.addCase(fetchNotes.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });
//     builder.addCase(fetchAllNotes.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchAllNotes.fulfilled, (state, action) => {
//       state.data = action.payload;
//       state.loading = false;
//     });
//     builder.addCase(fetchAllNotes.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });
//   },
// });

// export const { setPage, setNotes } = notesSlice.actions;

// export default notesSlice.reducer;