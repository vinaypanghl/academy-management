import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/apiClient';
import { persistor } from '../store';
import { User, AuthState, Role } from '../../types/User';

function mapSupabaseUser(authUser: any): User {
    const metadata = authUser?.user_metadata || {};
    return {
      id: authUser.id,
      email: authUser.email || '',
      display_name: metadata.display_name || '',
      role: metadata.role || null,
      academy_id: metadata.academy_id || '',
      external_id: metadata.external_id || '',
      is_active: true,
      phone: metadata.phone || null,
      created_at: authUser.created_at,
    };
}

const initialState: AuthState = {
    user: null,
    token: null,
    role: null,
    loading: false,
    error: null,
};

// 🔸 LOGIN
export const loginUser = createAsyncThunk<
    { user: User; token: string; role: Role | null },
    { credential: string; password: string },
    { rejectValue: string }
>('auth/loginUser', async ({ credential, password }, thunkAPI) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credential,
            password,
        });

        if (error || !data.user) {
            return thunkAPI.rejectWithValue(error?.message || 'Invalid credentials');
        }

        const user = mapSupabaseUser(data.user);
        const token = data.session?.access_token || '';

        return { user, token, role: user.role };
    } catch (err: any) {
        return thunkAPI.rejectWithValue(err.message || 'Login failed');
    }
});

// 🔸 REHYDRATE SESSION
export const rehydrateUser = createAsyncThunk<
    { user: User; token: string; role: Role | null } | null,
    void,
    { rejectValue: string }
>('auth/rehydrateUser', async (_, thunkAPI) => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;

        const authUser = session.user;
        if (!authUser) return null;

        const user = mapSupabaseUser(authUser);
        return { user, token: session.access_token, role: user.role };
    } catch (err: any) {
        return thunkAPI.rejectWithValue(err.message || 'Session rehydration failed');
    }
});

// 🔸 LOGOUT
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
    await supabase.auth.signOut();
    await persistor.purge();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                loginUser.fulfilled,
                (state, action: PayloadAction<{ user: User; token: string; role: Role | null }>) => {
                    state.loading = false;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.role = action.payload.role;
                }
            )
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Login failed';
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.role = null;
            })
            .addCase(rehydrateUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.role = action.payload.role;
                }
            });
    },
});

export const { clearCredentials } = authSlice.actions;
export default authSlice.reducer;
