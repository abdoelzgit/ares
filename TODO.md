# TODO

- [x] Refactor `app/dashboard/archive/[year]/[category]/page.tsx` so `params` tidak diperlakukan sebagai `Promise`/`use(params)` yang menyebabkan `category` menjadi `undefined`.

- [ ] (Recommended) Split: buat Server Component untuk parsing `params` + fetch awal, dan Client Component untuk stateful UI (upload/edit/delete).
- [ ] Pastikan route link `.../${year}/${cat.code}` menghasilkan nilai `year` & `category` yang benar di halaman `[category]/page.tsx`.
- [ ] Jalankan `npm run lint` dan `npm run dev` untuk verifikasi.

