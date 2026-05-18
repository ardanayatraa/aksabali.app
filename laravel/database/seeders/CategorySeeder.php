<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['id' => 'anacaraka', 'name' => 'Aksara Anacaraka', 'description' => 'Aksara wianjana dasar — Ha Na Ca Ra Ka dst.', 'order' => 10],
            ['id' => 'swara', 'name' => 'Aksara Swara', 'description' => 'Aksara vokal mandiri — A I U E O.', 'order' => 20],
            ['id' => 'pangangge', 'name' => 'Pangangge Suara', 'description' => 'Sandangan vokal yang nempel ke konsonan.', 'order' => 30],
            ['id' => 'angka', 'name' => 'Angka Bali', 'description' => 'Angka 0 sampai 9 dalam aksara Bali.', 'order' => 40],
            ['id' => 'kata-aksara', 'name' => 'Kata Aksara', 'description' => 'Kata pendek dalam aksara Bali.', 'order' => 50],
            ['id' => 'gabungan-vokal', 'name' => 'Gabungan Wianjana + Vokal', 'description' => 'Wianjana digabung dgn pangangge suara.', 'order' => 60],
        ];

        foreach ($categories as $row) {
            Category::updateOrCreate(['id' => $row['id']], $row);
        }
    }
}
