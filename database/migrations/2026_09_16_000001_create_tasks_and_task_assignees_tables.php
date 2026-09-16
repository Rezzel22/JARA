<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mengubah/menambah kolom pada tabel tasks yang sudah ada (Alter)
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (!Schema::hasColumn('tasks', 'status')) {
                $table->enum('status', ['todo', 'in_progress', 'completed'])->default('todo')->after('deadline');
            }
        });

        // 2. Membuat tabel pivot task_user untuk Multi-Assignee (SRS-006)
        if (!Schema::hasTable('task_user')) {
            Schema::create('task_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('task_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamps();

                // Mencegah assignment duplikat
                $table->unique(['task_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('task_user');

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['description', 'status']);
        });
    }
};