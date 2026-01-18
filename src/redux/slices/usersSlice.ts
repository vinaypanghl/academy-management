// // src/redux/slices/usersSlice.ts

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { supabase } from '../../services/apiClient';
// import { User } from '../../types';

// interface UsersState {
//     users: User[];
//     loading: boolean;
//     error: string | null;
// }

// const initialState: UsersState = {
//     users: [],
//     loading: false,
//     error: null,
// };

// export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
//     const { data, error } = await supabase.from('users').select('*');
//     if (error) throw error;
//     return data as User[];
// });

// export const createUser = createAsyncThunk('users/createUser', async (newUser: Partial<User>) => {
//     const { data, error } = await supabase.from('users').insert(newUser).select().single();
//     if (error) throw error;
//     return data;
// });

// export const deleteUser = createAsyncThunk('users/deleteUser', async (userId: string) => {
//     const { error } = await supabase.from('users').delete().eq('id', userId);
//     if (error) throw error;
//     return userId;
// });

// const usersSlice = createSlice({
//     name: 'users',
//     initialState,
//     reducers: {},
//     extraReducers: builder => {
//         builder
//             .addCase(fetchUsers.pending, state => { state.loading = true; state.error = null; })
//             .addCase(fetchUsers.fulfilled, (state, action) => { state.users = action.payload; state.loading = false; })
//             .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
//             .addCase(createUser.fulfilled, (state, action) => { state.users.push(action.payload); })
//             .addCase(deleteUser.fulfilled, (state, action) => { state.users = state.users.filter(u => u.id !== action.payload); });
//     }
// });

// export default usersSlice.reducer;
