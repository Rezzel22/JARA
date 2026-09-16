<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * SRS-007: Membuat project baru dan otomatis menetapkan creator sebagai owner secara atomik.
     */
    public function store(Request $request)
    {
        // SRS-012: Validasi Input
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            // SRS-007 & SRS-013: Operasi Database Atomik menggunakan Transaction & Parameter Binding Eloquent
            $project = DB::transaction(function () use ($request) {
                $user = Auth::user();

                // 1. Buat Project
                $project = Project::create([
                    'name' => $request->input('name'),
                ]);

                // 2. Tetapkan pembuat sebagai owner/member di tabel pivot project_user
                $project->members()->attach($user->id, ['role' => 'owner']);

                return $project;
            });

            return response()->json($project->load('members'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membuat project', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * SRS-008 & SRS-009: Pemilik menghapus daftar/project beserta data terkait secara atomik.
     */
    public function destroy(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                // SRS-013: Query aman menggunakan Eloquent findOrFail
                $project = Project::findOrFail($id);
                $userId = Auth::id();

                // SRS-009: Periksa kewenangan (hanya owner yang boleh menghapus)
                $isOwner = $project->members()
                    ->where('user_id', $userId)
                    ->wherePivot('role', 'owner')
                    ->exists();

                if (!$isOwner) {
                    return response()->json(['message' => 'Unauthorized. Hanya owner yang dapat menghapus project.'], 403);
                }

                // SRS-008: Cascade Deletion secara atomik
                // 1. Hapus task assignments terkait task dalam project ini
                $taskIds = $project->tasks()->pluck('id');
                DB::table('task_user')->whereIn('task_id', $taskIds)->delete();

                // 2. Hapus tasks terkait
                $project->tasks()->delete();

                // 3. Hapus memberships
                $project->members()->detach();

                // 4. Hapus project
                $project->delete();

                return response()->json(['message' => 'Project dan seluruh data terkait berhasil dihapus.'], 200);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus project', 'error' => $e->getMessage()], 500);
        }
    }
}