<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::select('id', 'name', 'email')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create($validator->validated());

        return response()->json($user, 201);
    }

    /**
     * SRS-011: Admin menghapus akun pengguna dengan menjaga konsistensi data terkait.
     */
    public function destroy(string $id)
    {
        // SRS-009 / SRS-011: Periksa kewenangan Admin (sesuaikan middleware atau check role jika ada)
        // Contoh pengecekan sederhana:
        // if (!Auth::user()->is_admin) { return response()->json(['message' => 'Unauthorized'], 403); }

        try {
            return DB::transaction(function () use ($id) {
                // SRS-013: Query aman
                $user = User::findOrFail($id);

                // SRS-011: Bersihkan relasi membership (project_user) dan task assignments (task_user)
                DB::table('project_user')->where('user_id', $user->id)->delete();
                DB::table('task_user')->where('user_id', $user->id)->delete();

                // Hapus user
                $user->delete();

                return response()->json(['message' => 'User berhasil dihapus dan relasi dibersihkan.'], 200);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus user', 'error' => $e->getMessage()], 500);
        }
    }
}